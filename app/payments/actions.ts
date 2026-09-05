"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPayment(formData: FormData) {
  const customerId = String(formData.get("customerId") || "");
  const invoiceId = String(formData.get("invoiceId") || "");
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") || "");
  const reference = String(formData.get("reference") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!customerId) {
    throw new Error("Customer is required.");
  }

  if (!invoiceId) {
    throw new Error("Invoice is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than 0.");
  }

  const validMethods = [
    "CASH",
    "BANK_TRANSFER",
    "UPI",
    "CARD",
    "CHEQUE",
  ];

  if (!validMethods.includes(method)) {
    throw new Error("Invalid payment method.");
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  if (invoice.customerId !== customerId) {
    throw new Error("Selected customer does not match the invoice.");
  }

  if (
    invoice.status === "CANCELLED" ||
    invoice.status === "PAID"
  ) {
    throw new Error("This invoice cannot receive another payment.");
  }

  const totalAmount = Number(invoice.totalAmount);
  const paidAmount = Number(invoice.paidAmount);
  const outstandingAmount = totalAmount - paidAmount;

  if (amount > outstandingAmount) {
    throw new Error(
      `Payment exceeds outstanding amount of ₹${outstandingAmount.toFixed(2)}.`
    );
  }

  const newPaidAmount = paidAmount + amount;

  const newStatus =
    newPaidAmount >= totalAmount
      ? "PAID"
      : "PARTIALLY_PAID";

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        customerId,
        invoiceId,
        amount: amount.toFixed(2),
        paymentDate: new Date(),
        method: method as
          | "CASH"
          | "BANK_TRANSFER"
          | "UPI"
          | "CARD"
          | "CHEQUE",
        reference: reference || null,
        notes: notes || null,
      },
    });

    await tx.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        paidAmount: newPaidAmount.toFixed(2),
        status: newStatus,
      },
    });
  });

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}