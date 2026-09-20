"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBudget(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const period = String(formData.get("period") ?? "").trim();
  const responsible = String(formData.get("responsible") ?? "").trim();
  const analyticAccount =
    String(formData.get("analyticAccount") ?? "").trim();
  const plannedAmount = Number(formData.get("plannedAmount") ?? 0);

  if (!name || !period || !responsible || plannedAmount <= 0) {
    throw new Error("Please provide all required budget details.");
  }

  await prisma.budget.create({
    data: {
      name,
      period,
      responsible,
      analyticAccount: analyticAccount || null,
      plannedAmount,
    },
  });

  revalidatePath("/budgets");
}