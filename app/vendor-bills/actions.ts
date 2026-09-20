"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVendorBill(formData: FormData) {
  const vendorId = String(formData.get("vendorId") ?? "").trim();
  const purchaseOrderId =
    String(formData.get("purchaseOrderId") ?? "").trim();

  const billDate = String(formData.get("billDate") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();

  const taxRate = Number(formData.get("taxRate") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!vendorId || !billDate) {
    throw new Error("Vendor and bill date are required.");
  }

  const purchaseOrder = purchaseOrderId
    ? await prisma.purchaseOrder.findUnique({
        where: {
          id: purchaseOrderId,
        },
        include: {
          items: true,
        },
      })
    : null;

  if (purchaseOrderId && !purchaseOrder) {
    throw new Error("Purchase order not found.");
  }

  if (purchaseOrder && purchaseOrder.vendorId !== vendorId) {
    throw new Error("Selected vendor does not match the purchase order.");
  }

  const subtotal = purchaseOrder
    ? purchaseOrder.items.reduce(
        (sum, item) => sum + Number(item.total),
        0
      )
    : 0;

  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  if (subtotal <= 0) {
    throw new Error("The purchase order must contain items.");
  }

  const billNumber = `BILL-${Date.now()}`;

  await prisma.$transaction(async (tx) => {
    await tx.vendorBill.create({
      data: {
        billNumber,
        vendorId,
        purchaseOrderId: purchaseOrderId || null,
        billDate: new Date(billDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        taxAmount,
        totalAmount,
        status: "POSTED",
        notes: notes || null,

        items: purchaseOrder
          ? {
              create: purchaseOrder.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate,
                total:
                  Number(item.total) +
                  Number(item.total) * (taxRate / 100),
              })),
            }
          : undefined,
      },
    });

    if (purchaseOrder) {
      await tx.purchaseOrder.update({
        where: {
          id: purchaseOrder.id,
        },
        data: {
          status: "BILLED",
        },
      });
    }
  });

  revalidatePath("/vendor-bills");
  revalidatePath("/purchase-orders");
}