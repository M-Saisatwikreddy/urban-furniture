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

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.type === "PRODUCT" && product.stock < quantity) {
    throw new Error(
      `Insufficient stock. Available stock: ${product.stock}.`
    );
  }

  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  const invoiceNumber = `INV-${Date.now()}`;

  await prisma.$transaction(async (tx) => {
    await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        invoiceDate: new Date(),
        dueDate: dueDateValue ? new Date(dueDateValue) : null,
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

    if (product.type === "PRODUCT") {
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });
    }
  });

  revalidatePath("/invoices");
  revalidatePath("/products");
  revalidatePath("/dashboard");
}