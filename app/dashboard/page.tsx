export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Welcome back. Here is what happening with Urban Furniture.
          </p>
        </div>

        <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          + New Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {/* Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Revenue
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹8,42,500
          </p>

          <p className="mt-2 text-xs font-medium text-green-600">
            ↑ 12.5% from last month
          </p>
        </div>

        {/* Receivables */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Accounts Receivable
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹2,18,400
          </p>

          <p className="mt-2 text-xs font-medium text-orange-600">
            18 invoices pending
          </p>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Invoices
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            128
          </p>

          <p className="mt-2 text-xs font-medium text-green-600">
            ↑ 8.2% this month
          </p>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Products
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            246
          </p>

          <p className="mt-2 text-xs font-medium text-slate-500">
            Across 12 categories
          </p>
        </div>

      </div>

      {/* Lower Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Invoices */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Invoices
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest sales invoices
              </p>
            </div>

            <a
              href="/invoices"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              View all →
            </a>
          </div>

          <div className="divide-y divide-slate-100">

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  INV-2026-0128
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Rahul Interiors
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  ₹48,500
                </p>

                <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  Paid
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  INV-2026-0127
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Modern Home Pvt Ltd
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  ₹72,300
                </p>

                <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                  Pending
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  INV-2026-0126
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Sai Furniture Works
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  ₹31,750
                </p>

                <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  Paid
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Frequently used operations
          </p>

          <div className="mt-5 space-y-3">

            <a
              href="/invoices"
              className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                Create Invoice
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Record a new customer invoice
              </p>
            </a>

            <a
              href="/customers"
              className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                Add Customer
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Create a new customer
              </p>
            </a>

            <a
              href="/products"
              className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                Add Product
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add a product to inventory
              </p>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
}