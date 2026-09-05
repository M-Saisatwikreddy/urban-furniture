import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      invoiceDate: "desc",
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer invoices and billing.
          </p>
        </div>

        <Link
          href="/invoices/create"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + New Invoice
        </Link>
      </div>

      {/* Invoice Register */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Invoice Register
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {invoices.length} invoice
            {invoices.length !== 1 ? "s" : ""}
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl">🧾</div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No invoices yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first customer invoice.
            </p>

            <Link
              href="/invoices/create"
              className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              + Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Invoice
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Items
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Paid
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {invoice.invoiceNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {invoice.invoiceDate.toLocaleDateString("en-IN")}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {invoice.customer.name}
                    </td>

                    <td className="px-6 py-4">
                      {invoice.items.map((item) => (
                        <p
                          key={item.id}
                          className="text-sm text-slate-700"
                        >
                          {item.product.name} × {item.quantity}
                        </p>
                      ))}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      ₹
                      {Number(invoice.totalAmount).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      ₹
                      {Number(invoice.paidAmount).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}