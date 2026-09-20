import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!dbUser) {
    throw new Error(
      "Authenticated Supabase user is not registered in the application database."
    );
  }

  return dbUser;
}