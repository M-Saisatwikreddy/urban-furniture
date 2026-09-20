
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const customerId = String(formData.get("customerId") || "");
  const productId = String(formData.get("productId") || "");
  const quantity = Number(formData.get("quantity") || 0);
  const unitPrice = Number(formData.get("unitPrice") || 0);
  const taxRate = Number(formData.get("taxRate") || 0);
  const dueDateValue = String(formData.get("dueDate") || "");

  // -----------------------------
  // Validation
  // -----------------------------

  if (!customerId) {
    throw new Error("Customer is required.");
  }

  if (!productId) {
    throw new Error("Product is required.");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than 0.");
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error("Invalid unit price.");
  }

  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new Error("Tax rate must be between 0 and 100.");
  }

  // -----------------------------
  // Find product
  // -----------------------------

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  // -----------------------------
  // Check inventory
  // -----------------------------

  if (
    product.type === "PRODUCT" &&
    product.stock < quantity
  ) {
    throw new Error(
      `Insufficient stock. Available stock: ${product.stock}.`
    );
  }

  // -----------------------------
  // Calculate invoice amounts
  // -----------------------------

  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  // -----------------------------
  // Calculate COGS
  //
  // COGS = purchase price × quantity
  // -----------------------------

  const costOfGoods =
    product.type === "PRODUCT"
      ? quantity * Number(product.purchasePrice)
      : 0;

  // -----------------------------
  // Find accounting accounts
  //
  // 1100 = Accounts Receivable
  // 2100 = GST Payable
  // 4000 = Sales Revenue
  // 1200 = Inventory
  // 5000 = Cost of Goods Sold
  // -----------------------------

  const [
    receivableAccount,
    salesAccount,
    taxAccount,
    inventoryAccount,
    cogsAccount,
  ] = await Promise.all([
    prisma.account.findUnique({
      where: {
        code: "1100",
      },
    }),

    prisma.account.findUnique({
      where: {
        code: "4000",
      },
    }),

    prisma.account.findUnique({
      where: {
        code: "2100",
      },
    }),

    prisma.account.findUnique({
      where: {
        code: "1200",
      },
    }),

    prisma.account.findUnique({
      where: {
        code: "5000",
      },
    }),
  ]);

  if (!receivableAccount) {
    throw new Error(
      "Account 1100 - Accounts Receivable was not found."
    );
  }

  if (!salesAccount) {
    throw new Error(
      "Account 4000 - Sales Revenue was not found."
    );
  }

  if (!taxAccount) {
    throw new Error(
      "Account 2100 - GST Payable was not found."
    );
  }

  if (product.type === "PRODUCT" && !inventoryAccount) {
    throw new Error(
      "Account 1200 - Inventory was not found."
    );
  }

  if (product.type === "PRODUCT" && !cogsAccount) {
    throw new Error(
      "Account 5000 - Cost of Goods Sold was not found."
    );
  }

  // -----------------------------
  // Generate unique numbers
  // -----------------------------

  const timestamp = Date.now();

  const invoiceNumber = `INV-${timestamp}`;
  const salesEntryNumber = `JE-${timestamp}`;
  const cogsEntryNumber = `JE-COGS-${timestamp}`;

  // -----------------------------
  // Database transaction
  // -----------------------------

  await prisma.$transaction(async (tx) => {
    // 1. Create invoice

    await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId,

        invoiceDate: new Date(),

        dueDate: dueDateValue
          ? new Date(dueDateValue)
          : null,

        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        paidAmount: "0",

        status: "DRAFT",

        items: {
          create: {
            productId,
            quantity,
            unitPrice: unitPrice.toFixed(2),
            taxRate: taxRate.toFixed(2),
            total: totalAmount.toFixed(2),
          },
        },
      },
    });

    // 2. Reduce inventory

    if (product.type === "PRODUCT") {
      await tx.product.update({
        where: {
          id: productId,
        },

        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    }

    // 3. Create sales journal entry
    //
    // Debit:
    //   Accounts Receivable = Total
    //
    // Credit:
    //   Sales Revenue = Subtotal
    //   GST Payable   = Tax

    await tx.journalEntry.create({
      data: {
        entryNumber: salesEntryNumber,

        entryDate: new Date(),

        description: `Sales invoice ${invoiceNumber}`,

        reference: invoiceNumber,

        lines: {
          create: [
            {
              accountId: receivableAccount.id,
              type: "DEBIT",
              amount: totalAmount.toFixed(2),
              description: `Amount receivable for ${invoiceNumber}`,
            },

            {
              accountId: salesAccount.id,
              type: "CREDIT",
              amount: subtotal.toFixed(2),
              description: `Sales revenue for ${invoiceNumber}`,
            },

            {
              accountId: taxAccount.id,
              type: "CREDIT",
              amount: taxAmount.toFixed(2),
              description: `GST payable for ${invoiceNumber}`,
            },
          ],
        },
      },
    });

    // 4. Create COGS journal entry
    //
    // Only physical products affect inventory.
    //
    // Debit:
    //   Cost of Goods Sold = purchase price × quantity
    //
    // Credit:
    //   Inventory = purchase price × quantity

    if (
      product.type === "PRODUCT" &&
      inventoryAccount &&
      cogsAccount &&
      costOfGoods > 0
    ) {
      await tx.journalEntry.create({
        data: {
          entryNumber: cogsEntryNumber,

          entryDate: new Date(),

          description: `COGS for ${invoiceNumber}`,

          reference: invoiceNumber,

          lines: {
            create: [
              {
                accountId: cogsAccount.id,
                type: "DEBIT",
                amount: costOfGoods.toFixed(2),
                description: `Cost of goods sold for ${invoiceNumber}`,
              },

              {
                accountId: inventoryAccount.id,
                type: "CREDIT",
                amount: costOfGoods.toFixed(2),
                description: `Inventory reduction for ${invoiceNumber}`,
              },
            ],
          },
        },
      });
    }
  });

  // -----------------------------
  // Refresh affected pages
  // -----------------------------

  revalidatePath("/invoices");
  revalidatePath("/products");
  revalidatePath("/journal");
  revalidatePath("/dashboard");

  revalidatePath("/reports");
  revalidatePath("/reports/trial-balance");
  revalidatePath("/reports/general-ledger");
  revalidatePath("/reports/profit-loss");
  revalidatePath("/reports/balance-sheet");
}