import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [invoices, products, customers, payments] =
    await Promise.all([
      prisma.invoice.findMany({
        include: {
          customer: true,
        },
        orderBy: {
          invoiceDate: "desc",
        },
      }),

      prisma.product.findMany({
        include: {
          category: true,
        },
      }),

      prisma.customer.findMany(),

      prisma.payment.findMany(),
    ]);

  const totalRevenue = invoices
    .filter((invoice) => invoice.status !== "CANCELLED")
    .reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount),
      0
    );

  const totalReceivable = invoices
    .filter((invoice) => invoice.status !== "CANCELLED")
    .reduce(
      (sum, invoice) =>
        sum +
        Math.max(
          Number(invoice.totalAmount) -
            Number(invoice.paidAmount),
          0
        ),
      0
    );

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.status !== "PAID" &&
      invoice.status !== "CANCELLED"
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      product.type === "PRODUCT" &&
      product.stock <= product.reorderLevel
  ).length;

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Real-time overview of Urban Furniture.
          </p>
        </div>

        <a
          href="/invoices"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + New Invoice
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Revenue
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹
            {totalRevenue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            From recorded invoices
          </p>
        </div>

        {/* Receivables */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Accounts Receivable
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹
            {totalReceivable.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-xs font-medium text-orange-600">
            {pendingInvoices} pending invoice
            {pendingInvoices !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Invoices
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {invoices.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Recorded in system
          </p>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Products
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {products.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {lowStockCount} low-stock item
            {lowStockCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Business Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Customers
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {customers.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Registered customers
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Payments Received
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ₹
            {payments
              .reduce(
                (sum, payment) =>
                  sum + Number(payment.amount),
                0
              )
              .toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Total recorded payments
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Low Stock
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {lowStockCount}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Products requiring attention
          </p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Invoices
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Latest sales transactions
            </p>
          </div>

          <a
            href="/invoices"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View all →
          </a>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No invoices recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {invoice.invoiceNumber}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {invoice.customer.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {invoice.invoiceDate.toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ₹
                    {Number(invoice.totalAmount).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      invoice.status === "PAID"
                        ? "bg-green-50 text-green-700"
                        : invoice.status === "CANCELLED"
                        ? "bg-red-50 text-red-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {invoice.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-slate-900">
          Quick Actions
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a
            href="/invoices"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">
              Create Invoice
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Record a new customer sale
            </p>
          </a>

          <a
            href="/customers"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">
              Add Customer
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Register a new customer
            </p>
          </a>

          <a
            href="/products"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">
              Add Product
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Manage furniture inventory
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
