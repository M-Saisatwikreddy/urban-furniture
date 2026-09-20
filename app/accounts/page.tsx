import { prisma } from "@/lib/prisma";
import { createAccount } from "./actions";

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: {
      code: "asc",
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Chart of Accounts
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage the accounts used for Urban Furniture bookkeeping.
        </p>
      </div>

      {/* Add Account */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Account
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a ledger account for financial transactions.
        </p>

        <form action={createAccount} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Code */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Account Code *
              </label>

              <input
                name="code"
                type="text"
                required
                placeholder="e.g. 1000"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Account Name *
              </label>

              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Cash"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Account Type *
              </label>

              <select
                name="type"
                required
                defaultValue=""
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="" disabled>
                  Select type
                </option>

                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              rows={3}
              placeholder="Optional account description..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>

      {/* Account List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Accounts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {accounts.length} account
            {accounts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl">📒</div>

            <p className="mt-4 text-sm text-slate-500">
              No accounts created yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Code
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {account.code}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {account.name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {account.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {account.description || "—"}
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