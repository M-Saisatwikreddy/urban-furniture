"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPayment(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") || "");
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") || "");
  const reference = String(
    formData.get("reference") || ""
  ).trim();
  const notes = String(
    formData.get("notes") || ""
  ).trim();

  // ---------------------------------
  // Validation
  // ---------------------------------

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

  // ---------------------------------
  // Find invoice
  // ---------------------------------

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const customerId = invoice.customerId;

  // ---------------------------------
  // Invoice validation
  // ---------------------------------

  if (invoice.status === "CANCELLED") {
    throw new Error(
      "This invoice cannot receive a payment because it is cancelled."
    );
  }

  if (invoice.status === "PAID") {
    throw new Error("This invoice is already fully paid.");
  }

  // ---------------------------------
  // Outstanding balance
  // ---------------------------------

  const totalAmount = Number(invoice.totalAmount);
  const paidAmount = Number(invoice.paidAmount);

  const outstandingAmount = totalAmount - paidAmount;

  if (outstandingAmount <= 0) {
    throw new Error(
      "This invoice has no outstanding balance."
    );
  }

  if (amount > outstandingAmount) {
    throw new Error(
      `Payment exceeds outstanding amount of ₹${outstandingAmount.toFixed(
        2
      )}.`
    );
  }

  // ---------------------------------
  // New invoice status
  // ---------------------------------

  const newPaidAmount = paidAmount + amount;

  const newStatus =
    newPaidAmount >= totalAmount
      ? "PAID"
      : "PARTIALLY_PAID";

  // ---------------------------------
  // Find accounting accounts
  //
  // 1000 = Cash
  // 1010 = Bank
  // 1100 = Accounts Receivable
  //
  // Payment method determines the
  // debit account.
  // ---------------------------------

  const receivableAccount =
    await prisma.account.findUnique({
      where: {
        code: "1100",
      },
    });

  if (!receivableAccount) {
    throw new Error(
      "Account 1100 - Accounts Receivable was not found."
    );
  }

  // ---------------------------------
  // Map payment method to account
  // ---------------------------------

  const paymentAccountCode =
    method === "CASH"
      ? "1000"
      : method === "BANK_TRANSFER"
      ? "1010"
      : method === "UPI"
      ? "1010"
      : method === "CARD"
      ? "1010"
      : method === "CHEQUE"
      ? "1000"
      : "";

  if (!paymentAccountCode) {
    throw new Error(
      "Could not determine payment account."
    );
  }

  const paymentAccount =
    await prisma.account.findUnique({
      where: {
        code: paymentAccountCode,
      },
    });

  if (!paymentAccount) {
    throw new Error(
      `Account ${paymentAccountCode} was not found.`
    );
  }

  // ---------------------------------
  // Generate unique journal number
  // ---------------------------------

  const timestamp = Date.now();

  const entryNumber = `JE-PAY-${timestamp}`;

  // ---------------------------------
  // Database transaction
  // ---------------------------------

  await prisma.$transaction(
    async (tx) => {
      // 1. Create payment

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

      // 2. Update invoice

      await tx.invoice.update({
        where: {
          id: invoiceId,
        },

        data: {
          paidAmount: newPaidAmount.toFixed(2),
          status: newStatus,
        },
      });

      // 3. Create journal entry
      //
      // Example:
      //
      // Customer pays ₹5,000 through bank.
      //
      // Debit  Bank                 ₹5,000
      // Credit Accounts Receivable ₹5,000
      //
      // Debit = Credit

      await tx.journalEntry.create({
        data: {
          entryNumber,
          entryDate: new Date(),

          description: `Payment received for invoice ${invoice.invoiceNumber}`,

          reference:
            reference ||
            invoice.invoiceNumber,

          lines: {
            create: [
              {
                // Debit Cash/Bank
                accountId: paymentAccount.id,
                type: "DEBIT",
                amount: amount.toFixed(2),
                description: `Payment received via ${method}`,
              },

              {
                // Credit Accounts Receivable
                accountId: receivableAccount.id,
                type: "CREDIT",
                amount: amount.toFixed(2),
                description: `Settlement of ${invoice.invoiceNumber}`,
              },
            ],
          },
        },
      });
    },
    {
      timeout: 15000,
    }
  );

  // ---------------------------------
  // Refresh affected pages
  // ---------------------------------

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath("/journal");
  revalidatePath("/dashboard");

  revalidatePath("/reports/trial-balance");
  revalidatePath("/reports/general-ledger");
  revalidatePath("/reports/profit-loss");
  revalidatePath("/reports/balance-sheet");
}
