"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "PRODUCT");
  const purchasePrice = Number(formData.get("purchasePrice") || 0);
  const sellingPrice = Number(formData.get("sellingPrice") || 0);
  const stock = Number(formData.get("stock") || 0);
  const reorderLevel = Number(formData.get("reorderLevel") || 5);
  const categoryId = String(formData.get("categoryId") || "");

  if (!name || !sku || !categoryId) {
    throw new Error("Name, SKU and category are required.");
  }

  if (type !== "PRODUCT" && type !== "SERVICE") {
    throw new Error("Invalid product type.");
  }

  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
    throw new Error("Purchase price must be a valid number.");
  }

  if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
    throw new Error("Selling price must be a valid number.");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Stock must be a valid non-negative integer.");
  }

  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
    throw new Error("Reorder level must be a valid non-negative integer.");
  }

  const existingSku = await prisma.product.findUnique({
    where: {
      sku,
    },
  });

  if (existingSku) {
    throw new Error("A product with this SKU already exists.");
  }

  await prisma.product.create({
    data: {
      name,
      sku,
      description: description || null,
      type: type as "PRODUCT" | "SERVICE",
      purchasePrice: purchasePrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2),
      stock: type === "SERVICE" ? 0 : stock,
      reorderLevel: type === "SERVICE" ? 0 : reorderLevel,
      categoryId,
    },
  });

  revalidatePath("/products");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") || "");

  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "PRODUCT");
  const purchasePrice = Number(formData.get("purchasePrice") || 0);
  const sellingPrice = Number(formData.get("sellingPrice") || 0);
  const stock = Number(formData.get("stock") || 0);
  const reorderLevel = Number(formData.get("reorderLevel") || 5);
  const categoryId = String(formData.get("categoryId") || "");

  if (!id || !name || !sku || !categoryId) {
    throw new Error("Required fields are missing.");
  }

  if (type !== "PRODUCT" && type !== "SERVICE") {
    throw new Error("Invalid product type.");
  }

  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
    throw new Error("Purchase price must be a valid number.");
  }

  if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
    throw new Error("Selling price must be a valid number.");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Stock must be a valid non-negative integer.");
  }

  if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
    throw new Error("Reorder level must be a valid non-negative integer.");
  }

  const existingSku = await prisma.product.findFirst({
    where: {
      sku,
      NOT: {
        id,
      },
    },
  });

  if (existingSku) {
    throw new Error("Another product already uses this SKU.");
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
      purchasePrice: purchasePrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2),
      stock: type === "SERVICE" ? 0 : stock,
      reorderLevel: type === "SERVICE" ? 0 : reorderLevel,
      categoryId,
    },
  });

  revalidatePath("/products");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("Product ID is required.");
  }

  const invoiceItemCount = await prisma.invoiceItem.count({
    where: {
      productId: id,
    },
  });

  if (invoiceItemCount > 0) {
    throw new Error(
      "Cannot delete a product that has been used in an invoice."
    );
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
}
