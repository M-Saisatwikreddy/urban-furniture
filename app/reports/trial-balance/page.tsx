import { prisma } from "@/lib/prisma";

export default async function TrialBalancePage() {
  const accounts = await prisma.account.findMany({
    orderBy: {
      code: "asc",
    },
  });

  const journalLines = await prisma.journalLine.findMany();

  const rows = accounts.map((account) => {
    const lines = journalLines.filter(
      (line) => line.accountId === account.id
    );

    const debit = lines
      .filter((line) => line.type === "DEBIT")
      .reduce((sum, line) => sum + Number(line.amount), 0);

    const credit = lines
      .filter((line) => line.type === "CREDIT")
      .reduce((sum, line) => sum + Number(line.amount), 0);

    return {
      ...account,
      debit,
      credit,
    };
  });

  const totalDebit = rows.reduce(
    (sum, row) => sum + row.debit,
    0
  );

  const totalCredit = rows.reduce(
    (sum, row) => sum + row.credit,
    0
  );

  const difference = totalDebit - totalCredit;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Trial Balance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Summary of all ledger account debit and credit balances.
        </p>
      </div>

      {/* Balance Status */}
      <div
        className={`rounded-xl border p-5 ${
          Math.abs(difference) < 0.01
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <p
          className={`text-sm font-semibold ${
            Math.abs(difference) < 0.01
              ? "text-green-700"
              : "text-red-700"
          }`}
        >
          {Math.abs(difference) < 0.01
            ? "✓ Trial Balance is balanced"
            : "⚠ Trial Balance is not balanced"}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Difference: ₹
          {Math.abs(difference).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Trial Balance Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Account Balances
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {rows.length} account
            {rows.length !== 1 ? "s" : ""}
          </p>
        </div>

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

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Debit
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Credit
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                    {row.code}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {row.name}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {row.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-slate-700">
                    {row.debit > 0
                      ? `₹${row.debit.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`
                      : "—"}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-slate-700">
                    {row.credit > 0
                      ? `₹${row.credit.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="border-t-2 border-slate-300 bg-slate-50">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-4 text-sm font-bold text-slate-900"
                >
                  TOTAL
                </td>

                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  ₹
                  {totalDebit.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>

                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                  ₹
                  {totalCredit.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}