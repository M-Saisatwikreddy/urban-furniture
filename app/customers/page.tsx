import { prisma } from "@/lib/prisma";
import { createCustomer, deleteCustomer } from "./actions";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Customers
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage Urban Furniture customers and their account balances.
        </p>
      </div>

      {/* Add Customer */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Customer
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a customer record for invoicing and payments.
        </p>

        <form action={createCustomer} className="mt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer Name *
              </label>

              <input
                name="name"
                type="text"
                required
                placeholder="e.g. ABC Interiors Pvt Ltd"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                name="email"
                type="email"
                placeholder="customer@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* GST */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                GST Number
              </label>

              <input
                name="gstNumber"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Opening Balance */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Opening Balance (₹)
              </label>

              <input
                name="openingBalance"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                rows={3}
                placeholder="Customer billing address..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>

      {/* Customer List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Customer Accounts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {customers.length} customer
            {customers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {customers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl">👥</div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No customers yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first customer above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    GST
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Opening Balance
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {customer.name}
                      </p>

                      {customer.address && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {customer.address}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {customer.email || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {customer.phone || "No phone"}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {customer.gstNumber || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      ₹
                      {Number(customer.openingBalance).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <form action={deleteCustomer}>
                        <input
                          type="hidden"
                          name="id"
                          value={customer.id}
                        />

                        <button
                          type="submit"
                          className="text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </form>
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