import { prisma } from "@/lib/prisma";

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    include: {
      lines: {
        include: {
          account: true,
        },
      },
    },
    orderBy: {
      entryDate: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Journal
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View all accounting transactions and double-entry records.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Journal Entries
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl">📒</div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No journal entries yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Accounting entries will appear here when transactions are recorded.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const totalDebit = entry.lines
                .filter((line) => line.type === "DEBIT")
                .reduce(
                  (sum, line) => sum + Number(line.amount),
                  0
                );

              const totalCredit = entry.lines
                .filter((line) => line.type === "CREDIT")
                .reduce(
                  (sum, line) => sum + Number(line.amount),
                  0
                );

              const balanced =
                Math.abs(totalDebit - totalCredit) < 0.01;

              return (
                <div key={entry.id} className="p-6">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {entry.entryNumber}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {entry.entryDate.toLocaleDateString("en-IN")}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {entry.description}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                        balanced
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {balanced ? "✓ Balanced" : "⚠ Unbalanced"}
                    </span>
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Account
                          </th>

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Description
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Debit
                          </th>

                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Credit
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {entry.lines.map((line) => (
                          <tr key={line.id}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-900">
                                {line.account.name}
                              </p>

                              <p className="font-mono text-xs text-slate-500">
                                {line.account.code}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-600">
                              {line.description || "—"}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                              {line.type === "DEBIT"
                                ? `₹${Number(line.amount).toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}`
                                : "—"}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                              {line.type === "CREDIT"
                                ? `₹${Number(line.amount).toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot className="border-t border-slate-200 bg-slate-50">
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-3 text-sm font-semibold text-slate-900"
                          >
                            Total
                          </td>

                          <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                            ₹
                            {totalDebit.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>

                          <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}