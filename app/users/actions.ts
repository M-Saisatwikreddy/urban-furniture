"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createUser(formData: FormData) {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "");

  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  if (password.length < 6) {
    throw new Error("Password must contain at least 6 characters");
  }

  const allowedRoles = [
    "ADMIN",
    "ACCOUNTANT",
    "SALES",
    "INVENTORY",
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role: role as
          | "ADMIN"
          | "ACCOUNTANT"
          | "SALES"
          | "INVENTORY",
      },
    });
  } catch (error) {
    console.error("Prisma user creation failed:", error);

    // Roll back the Supabase account if Prisma creation fails.
    if (data.user) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    }

    throw new Error(
      "Could not create application user."
    );
  }

  return {
    success: true,
  };
}
