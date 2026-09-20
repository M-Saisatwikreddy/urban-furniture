"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVendorPayment(formData: FormData) {
  const vendorBillId = String(
    formData.get("vendorBillId") ?? ""
  ).trim();

  const amount = Number(formData.get("amount") ?? 0);

  const method = String(
    formData.get("method") ?? ""
  ).trim() as
    | "CASH"
    | "BANK_TRANSFER"
    | "UPI"
    | "CARD"
    | "CHEQUE";

  const paymentDate = String(
    formData.get("paymentDate") ?? ""
  ).trim();

  const reference = String(
    formData.get("reference") ?? ""
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!vendorBillId || amount <= 0 || !method || !paymentDate) {
    throw new Error("Please provide all required payment details.");
  }

  await prisma.$transaction(async (tx) => {
    const bill = await tx.vendorBill.findUnique({
      where: {
        id: vendorBillId,
      },
    });

    if (!bill) {
      throw new Error("Vendor bill not found.");
    }

    const outstanding =
      Number(bill.totalAmount) - Number(bill.paidAmount);

    if (amount > outstanding) {
      throw new Error(
        `Payment cannot exceed outstanding amount of ₹${outstanding.toLocaleString(
          "en-IN"
        )}.`
      );
    }

    const newPaidAmount =
      Number(bill.paidAmount) + amount;

    let status:
      | "PARTIALLY_PAID"
      | "PAID";

    if (newPaidAmount >= Number(bill.totalAmount)) {
      status = "PAID";
    } else {
      status = "PARTIALLY_PAID";
    }

    await tx.vendorPayment.create({
      data: {
        vendorBillId,
        vendorId: bill.vendorId,
        amount,
        paymentDate: new Date(paymentDate),
        method,
        reference: reference || null,
        notes: notes || null,
      },
    });

    await tx.vendorBill.update({
      where: {
        id: vendorBillId,
      },
      data: {
        paidAmount: newPaidAmount,
        status,
      },
    });
  });

  revalidatePath("/vendor-bills");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
}