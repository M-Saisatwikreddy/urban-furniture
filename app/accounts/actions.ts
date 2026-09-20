"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAccount(formData: FormData) {
  const code = String(formData.get("code") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const description = String(
    formData.get("description") || ""
  ).trim();

  if (!code || !name || !type) {
    throw new Error("Account code, name and type are required.");
  }

  const existingAccount = await prisma.account.findUnique({
    where: {
      code,
    },
  });

  if (existingAccount) {
    throw new Error("An account with this code already exists.");
  }

  await prisma.account.create({
    data: {
      code,
      name,
      type,
      description: description || null,
    },
  });

  revalidatePath("/accounts");
  revalidatePath("/journal");
  revalidatePath("/dashboard");
}