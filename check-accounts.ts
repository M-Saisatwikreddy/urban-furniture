import { prisma } from "./lib/prisma";

async function main() {
  const accounts = await prisma.account.findMany({
    orderBy: {
      code: "asc",
    },
  });

  console.table(
    accounts.map((account) => ({
      code: account.code,
      name: account.name,
      type: account.type,
    }))
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
