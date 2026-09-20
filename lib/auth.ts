import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use the authenticated Supabase user when available.
  if (user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (dbUser) {
      return dbUser;
    }
  }

  // Demo fallback for the hackathon.
  // This allows the application to work even if the
  // browser does not currently have a Supabase session.
  const demoUser = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!demoUser) {
    throw new Error(
      "No ADMIN user found. Run: npx prisma db seed"
    );
  }

  return demoUser;
}
