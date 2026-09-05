"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) {
    throw new Error("Category name is required");
  }

  await prisma.category.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/products");
}
