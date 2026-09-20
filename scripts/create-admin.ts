import { prisma } from "../lib/prisma";

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "admin@urbanfurniture.com",
    },
    update: {
      name: "Urban Furniture Admin",
      role: "ADMIN",
    },
    create: {
      email: "admin@urbanfurniture.com",
      name: "Urban Furniture Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

