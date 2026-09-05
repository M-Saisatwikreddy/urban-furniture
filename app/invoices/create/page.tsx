import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/dashboard/invoice-form";
import Link from "next/link";

export default async function CreateInvoicePage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        sellingPrice: true,
        stock: true,
        type: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const safeProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    sellingPrice: Number(product.sellingPrice),
    stock: product.stock,
    type: product.type,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            New Invoice
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a customer invoice and update inventory.
          </p>
        </div>

        <Link
          href="/invoices"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Back to Invoices
        </Link>
      </div>

      <InvoiceForm
        customers={customers}
        products={safeProducts}
      />
    </div>
  );
}