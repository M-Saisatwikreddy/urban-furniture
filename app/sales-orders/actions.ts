"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createInvoice } from "@/app/invoices/actions";

export async function createSalesOrder(formData: FormData) {
  const customerId = String(
    formData.get("customerId") ?? ""
  ).trim();

  const productId = String(
    formData.get("productId") ?? ""
  ).trim();

  const quantity = Number(
    formData.get("quantity") ?? 0
  );

  const unitPrice = Number(
    formData.get("unitPrice") ?? 0
  );

  const taxRate = Number(
    formData.get("taxRate") ?? 0
  );

  const orderDate = String(
    formData.get("orderDate") ?? ""
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!customerId || !productId) {
    throw new Error("Customer and product are required.");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  if (unitPrice <= 0) {
    throw new Error("Unit price must be greater than zero.");
  }

  if (taxRate < 0 || taxRate > 100) {
    throw new Error("Tax rate must be between 0 and 100.");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found.");
  }

  if (
    product.type === "PRODUCT" &&
    product.stock < quantity
  ) {
    throw new Error(
      `Insufficient stock. Available stock: ${product.stock}.`
    );
  }

  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  const date = orderDate
    ? new Date(orderDate)
    : new Date();

  const orderNumber = `SO-${Date.now()}`;

  await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId,
      orderDate: date,
      status: "CONFIRMED",
      subtotal,
      taxAmount,
      totalAmount,
      notes: notes || null,

      items: {
        create: {
          productId,
          quantity,
          unitPrice,
          taxRate,
          total: totalAmount,
        },
      },
    },
  });

  revalidatePath("/sales-orders");
  revalidatePath("/dashboard");
}

export async function convertSalesOrderToInvoice(
  formData: FormData
) {
  const salesOrderId = String(
    formData.get("salesOrderId") ?? ""
  ).trim();

  if (!salesOrderId) {
    throw new Error("Sales order is required.");
  }

  const salesOrder = await prisma.salesOrder.findUnique({
    where: {
      id: salesOrderId,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!salesOrder) {
    throw new Error("Sales order not found.");
  }

  if (salesOrder.status === "INVOICED") {
    throw new Error(
      "This sales order has already been invoiced."
    );
  }

  if (salesOrder.status === "CANCELLED") {
    throw new Error(
      "A cancelled sales order cannot be invoiced."
    );
  }

  if (salesOrder.items.length === 0) {
    throw new Error(
      "Sales order does not contain any items."
    );
  }

  const item = salesOrder.items[0];

  const invoiceFormData = new FormData();

  invoiceFormData.set(
    "customerId",
    salesOrder.customerId
  );

  invoiceFormData.set(
    "productId",
    item.productId
  );

  invoiceFormData.set(
    "quantity",
    String(item.quantity)
  );

  invoiceFormData.set(
    "unitPrice",
    String(item.unitPrice)
  );

  invoiceFormData.set(
    "taxRate",
    String(item.taxRate)
  );

  await createInvoice(invoiceFormData);

  await prisma.salesOrder.update({
    where: {
      id: salesOrder.id,
    },
    data: {
      status: "INVOICED",
    },
  });

  revalidatePath("/sales-orders");
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