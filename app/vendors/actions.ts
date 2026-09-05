"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVendor(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const gstNumber = String(formData.get("gstNumber") || "").trim();
  const openingBalance = String(
    formData.get("openingBalance") || "0"
  );

  if (!name) {
    throw new Error("Vendor name is required.");
  }

  const balance = Number(openingBalance);

  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error("Opening balance must be a valid positive number.");
  }

  await prisma.vendor.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      gstNumber: gstNumber || null,
      openingBalance,
    },
  });

  revalidatePath("/vendors");
  revalidatePath("/dashboard");
}

export async function deleteVendor(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Vendor ID is required.");
  }

  await prisma.vendor.delete({
    where: {
      id,
    },
  });

  revalidatePath("/vendors");
  revalidatePath("/dashboard");
}