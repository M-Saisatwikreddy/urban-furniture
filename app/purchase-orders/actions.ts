"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPurchaseOrder(formData: FormData) {
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 0);
  const unitPrice = Number(formData.get("unitPrice") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!vendorId || !productId || quantity <= 0 || unitPrice <= 0) {
    throw new Error("Please provide valid purchase order details.");
  }

  const total = quantity * unitPrice;

  const orderNumber = `PO-${Date.now()}`;

  await prisma.purchaseOrder.create({
    data: {
      orderNumber,
      vendorId,
      totalAmount: total,
      notes: notes || null,
      items: {
        create: {
          productId,
          quantity,
          unitPrice,
          total,
        },
      },
    },
  });

  revalidatePath("/purchase-orders");
}