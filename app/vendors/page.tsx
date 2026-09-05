import { prisma } from "@/lib/prisma";
import { createVendor, deleteVendor } from "./actions";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Vendors
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage suppliers and vendor accounts.
        </p>
      </div>

      {/* Add Vendor */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Vendor
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a supplier record for your business.
        </p>

        <form action={createVendor} className="mt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vendor Name *
              </label>

              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Premium Wood Suppliers"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                name="email"
                type="email"
                placeholder="vendor@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                rows={3}
                placeholder="Vendor address..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Vendor
            </button>
          </div>
        </form>
      </div>

      {/* Vendor List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Vendor Accounts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {vendors.length} vendor
            {vendors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {vendors.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl">🏭</div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No vendors yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first supplier above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Vendor
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
                {vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {vendor.name}
                      </p>

                      {vendor.address && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {vendor.address}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {vendor.email || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {vendor.phone || "No phone"}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {vendor.gstNumber || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      ₹
                      {Number(vendor.openingBalance).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <form action={deleteVendor}>
                        <input
                          type="hidden"
                          name="id"
                          value={vendor.id}
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
