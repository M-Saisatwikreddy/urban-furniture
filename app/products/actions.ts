"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "PRODUCT");
  const purchasePrice = String(formData.get("purchasePrice") || "0");
  const sellingPrice = String(formData.get("sellingPrice") || "0");
  const stock = Number(formData.get("stock") || 0);
  const reorderLevel = Number(formData.get("reorderLevel") || 5);
  const categoryId = String(formData.get("categoryId") || "");

  if (!name || !sku || !categoryId) {
    throw new Error("Name, SKU and category are required.");
  }

  if (type !== "PRODUCT" && type !== "SERVICE") {
    throw new Error("Invalid product type.");
  }

  await prisma.product.create({
    data: {
      name,
      sku,
      description: description || null,
      type: type as "PRODUCT" | "SERVICE",
      purchasePrice,
      sellingPrice,
      stock,
      reorderLevel,
      categoryId,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") || "");

  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "PRODUCT");
  const purchasePrice = String(formData.get("purchasePrice") || "0");
  const sellingPrice = String(formData.get("sellingPrice") || "0");
  const stock = Number(formData.get("stock") || 0);
  const reorderLevel = Number(formData.get("reorderLevel") || 5);
  const categoryId = String(formData.get("categoryId") || "");

  if (!id || !name || !sku || !categoryId) {
    throw new Error("Required fields are missing.");
  }

  await prisma.product.update({
    where: {
      id,
    },
    data: {
      name,
      sku,
      description: description || null,
      type: type as "PRODUCT" | "SERVICE",
      purchasePrice,
      sellingPrice,
      stock,
      reorderLevel,
      categoryId,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Product ID is required.");
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
}