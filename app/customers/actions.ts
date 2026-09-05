"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const gstNumber = String(formData.get("gstNumber") || "").trim();
  const openingBalance = String(
    formData.get("openingBalance") || "0"
  );

  if (!name) {
    throw new Error("Customer name is required.");
  }

  const balance = Number(openingBalance);

  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error("Opening balance must be a valid positive number.");
  }

  await prisma.customer.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      gstNumber: gstNumber || null,
      openingBalance,
    },
  });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
}

export async function deleteCustomer(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Customer ID is required.");
  }

  const invoiceCount = await prisma.invoice.count({
    where: {
      customerId: id,
    },
  });

  const paymentCount = await prisma.payment.count({
    where: {
      customerId: id,
    },
  });

  if (invoiceCount > 0 || paymentCount > 0) {
    throw new Error(
      "Cannot delete a customer with existing invoices or payments."
    );
  }

  await prisma.customer.delete({
    where: {
      id,
    },
  });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
}