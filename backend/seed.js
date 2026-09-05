const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // -------------------------
  // CONTACTS
  // -------------------------

  const azureFurniture = await prisma.contact.create({
    data: {
      name: "Azure Furniture",
      type: "VENDOR",
      email: "azure@example.com",
      mobile: "9876543210",
      address: "Main Market",
      city: "Anantapur",
      state: "Andhra Pradesh",
      pincode: "515001",
    },
  });

  const nimeshPathak = await prisma.contact.create({
    data: {
      name: "Nimesh Pathak",
      type: "CUSTOMER",
      email: "nimesh@example.com",
      mobile: "9876501234",
      address: "MG Road",
      city: "Anantapur",
      state: "Andhra Pradesh",
      pincode: "515001",
    },
  });

  // -------------------------
  // PRODUCTS
  // -------------------------

  await prisma.product.createMany({
    data: [
      {
        name: "Office Chair",
        type: "GOODS",
        salesPrice: 5000,
        purchasePrice: 3500,
        category: "Chairs",
        stock: 20,
      },
      {
        name: "Wooden Table",
        type: "GOODS",
        salesPrice: 12000,
        purchasePrice: 8000,
        category: "Tables",
        stock: 10,
      },
      {
        name: "Sofa",
        type: "GOODS",
        salesPrice: 25000,
        purchasePrice: 18000,
        category: "Sofas",
        stock: 5,
      },
      {
        name: "Dining Table",
        type: "GOODS",
        salesPrice: 30000,
        purchasePrice: 22000,
        category: "Tables",
        stock: 6,
      },
    ],
  });

  // -------------------------
  // CHART OF ACCOUNTS
  // -------------------------

  await prisma.account.createMany({
    data: [
      {
        name: "Cash",
        type: "ASSET",
        code: "1001",
      },
      {
        name: "Bank",
        type: "ASSET",
        code: "1002",
      },
      {
        name: "Debtors",
        type: "ASSET",
        code: "1100",
      },
      {
        name: "Creditors",
        type: "LIABILITY",
        code: "2001",
      },
      {
        name: "Capital",
        type: "CAPITAL",
        code: "3001",
      },
      {
        name: "Sales Income",
        type: "INCOME",
        code: "4001",
      },
      {
        name: "Purchases Expense",
        type: "EXPENSE",
        code: "5001",
      },
    ],
  });

  // -------------------------
  // JOURNALS
  // -------------------------

  await prisma.journal.createMany({
    data: [
      {
        name: "Sales Journal",
        type: "SALES",
      },
      {
        name: "Purchase Journal",
        type: "PURCHASE",
      },
      {
        name: "Bank Journal",
        type: "BANK",
      },
      {
        name: "Cash Journal",
        type: "CASH",
      },
    ],
  });

  // -------------------------
  // ANALYTIC ACCOUNTS
  // -------------------------

  const furnitureSales = await prisma.analyticAccount.create({
    data: {
      name: "Furniture Sales",
      type: "INCOME",
    },
  });

  const furnitureExpenses = await prisma.analyticAccount.create({
    data: {
      name: "Furniture Expenses",
      type: "EXPENSE",
    },
  });

  // -------------------------
  // BUDGET
  // -------------------------

  await prisma.budget.create({
    data: {
      name: "2026 Furniture Budget",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-12-31"),
      responsiblePerson: "Admin",
      analyticAccountId: furnitureExpenses.id,
      plannedAmount: 500000,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`Vendor created: ${azureFurniture.name}`);
  console.log(`Customer created: ${nimeshPathak.name}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });