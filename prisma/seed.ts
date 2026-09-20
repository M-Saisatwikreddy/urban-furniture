import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Urban Furniture demo data...");

  // USERS
  await prisma.user.upsert({
    where: { email: "admin@urbanfurniture.com" },
    update: {},
    create: {
      email: "admin@urbanfurniture.com",
      name: "Urban Furniture Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "accounts@urbanfurniture.com" },
    update: {},
    create: {
      email: "accounts@urbanfurniture.com",
      name: "Accounts Manager",
      role: "ACCOUNTANT",
    },
  });

  // CATEGORIES
  const sofas = await prisma.category.upsert({
    where: { name: "Sofas" },
    update: {},
    create: {
      name: "Sofas",
      description: "Living room sofas and couches",
    },
  });

  const tables = await prisma.category.upsert({
    where: { name: "Tables" },
    update: {},
    create: {
      name: "Tables",
      description: "Dining and living room tables",
    },
  });

  const chairs = await prisma.category.upsert({
    where: { name: "Chairs" },
    update: {},
    create: {
      name: "Chairs",
      description: "Office and dining chairs",
    },
  });

  // PRODUCTS
  await prisma.product.upsert({
    where: { sku: "SOFA-001" },
    update: {},
    create: {
      name: "Premium 3-Seater Sofa",
      sku: "SOFA-001",
      description: "Premium fabric 3-seater sofa",
      type: "PRODUCT",
      purchasePrice: 28000,
      sellingPrice: 39999,
      stock: 12,
      reorderLevel: 5,
      categoryId: sofas.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: "TABLE-001" },
    update: {},
    create: {
      name: "Modern Dining Table",
      sku: "TABLE-001",
      description: "6-seater wooden dining table",
      type: "PRODUCT",
      purchasePrice: 18000,
      sellingPrice: 26999,
      stock: 8,
      reorderLevel: 3,
      categoryId: tables.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: "CHAIR-001" },
    update: {},
    create: {
      name: "Ergonomic Office Chair",
      sku: "CHAIR-001",
      description: "Adjustable ergonomic office chair",
      type: "PRODUCT",
      purchasePrice: 6500,
      sellingPrice: 9999,
      stock: 25,
      reorderLevel: 10,
      categoryId: chairs.id,
    },
  });

  // CUSTOMERS
  const customer1 = await prisma.customer.upsert({
    where: { id: "demo-customer-001" },
    update: {},
    create: {
      id: "demo-customer-001",
      name: "Ravi Enterprises",
      email: "ravi@example.com",
      phone: "9876543210",
      address: "Bangalore, Karnataka",
      gstNumber: "29ABCDE1234F1Z5",
      openingBalance: 0,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: "demo-customer-002" },
    update: {},
    create: {
      id: "demo-customer-002",
      name: "Sharma Interiors",
      email: "sharma@example.com",
      phone: "9988776655",
      address: "Hyderabad, Telangana",
      gstNumber: "36ABCDE5678G1Z2",
      openingBalance: 5000,
    },
  });

  // VENDORS
  await prisma.vendor.upsert({
    where: { id: "demo-vendor-001" },
    update: {},
    create: {
      id: "demo-vendor-001",
      name: "WoodCraft Suppliers",
      email: "sales@woodcraft.example.com",
      phone: "9123456789",
      address: "Mysore, Karnataka",
      gstNumber: "29WOODC1234A1Z1",
      openingBalance: 15000,
    },
  });

  await prisma.vendor.upsert({
    where: { id: "demo-vendor-002" },
    update: {},
    create: {
      id: "demo-vendor-002",
      name: "Premium Fabrics India",
      email: "info@premiumfabrics.example.com",
      phone: "9012345678",
      address: "Surat, Gujarat",
      gstNumber: "24FABRI1234B1Z3",
      openingBalance: 8500,
    },
  });

  // ACCOUNTS
  const cash = await prisma.account.upsert({
    where: { code: "1000" },
    update: {},
    create: {
      code: "1000",
      name: "Cash",
      type: "ASSET",
      description: "Cash on hand",
    },
  });

  const sales = await prisma.account.upsert({
    where: { code: "4000" },
    update: {},
    create: {
      code: "4000",
      name: "Sales Revenue",
      type: "REVENUE",
      description: "Revenue from furniture sales",
    },
  });

  const receivable = await prisma.account.upsert({
    where: { code: "1100" },
    update: {},
    create: {
      code: "1100",
      name: "Accounts Receivable",
      type: "ASSET",
      description: "Customer outstanding balances",
    },
  });

  // INVOICE
  const product = await prisma.product.findUnique({
    where: { sku: "SOFA-001" },
  });

  if (product) {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: "INV-2026-001" },
    });

    if (!existingInvoice) {
      const subtotal = 39999;
      const taxAmount = 7200;
      const totalAmount = subtotal + taxAmount;

      await prisma.invoice.create({
        data: {
          invoiceNumber: "INV-2026-001",
          customerId: customer1.id,
          subtotal,
          taxAmount,
          totalAmount,
          paidAmount: 20000,
          status: "PARTIALLY_PAID",
          notes: "Demo furniture invoice",
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 39999,
              taxRate: 18,
              total: 39999,
            },
          },
        },
      });
    }
  }

  // PAYMENT
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: "INV-2026-001" },
  });

  if (invoice) {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        invoiceId: invoice.id,
        reference: "DEMO-PAY-001",
      },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          customerId: customer1.id,
          invoiceId: invoice.id,
          amount: 20000,
          method: "UPI",
          reference: "DEMO-PAY-001",
          notes: "Demo customer payment",
        },
      });
    }
  }

  // JOURNAL ENTRY
  const existingEntry = await prisma.journalEntry.findUnique({
    where: { entryNumber: "JE-2026-001" },
  });

  if (!existingEntry) {
    await prisma.journalEntry.create({
      data: {
        entryNumber: "JE-2026-001",
        description: "Demo furniture sale",
        reference: "INV-2026-001",
        lines: {
          create: [
            {
              accountId: receivable.id,
              type: "DEBIT",
              amount: 47199,
              description: "Customer receivable",
            },
            {
              accountId: sales.id,
              type: "CREDIT",
              amount: 39999,
              description: "Furniture sales",
            },
            {
              accountId: cash.id,
              type: "CREDIT",
              amount: 7200,
              description: "Tax component",
            },
          ],
        },
      },
    });
  }

  console.log("✅ Demo data created successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
