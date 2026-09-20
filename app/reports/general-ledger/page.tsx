import { prisma } from "@/lib/prisma";

export default async function GeneralLedgerPage() {
  const accounts = await prisma.account.findMany({
    orderBy: {
      code: "asc",
    },
    include: {
      journalLines: {
        include: {
          journalEntry: true,
        },
      },
    },
  });

  const format = (amount: number) =>
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          General Ledger
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Detailed journal transactions for every accounting account.
        </p>
      </div>

      {accounts.map((account) => {
        const lines = [...account.journalLines].sort(
          (a, b) =>
            new Date(a.journalEntry.entryDate).getTime() -
            new Date(b.journalEntry.entryDate).getTime()
        );

        const totalDebit = lines
          .filter((line) => line.type === "DEBIT")
          .reduce((sum, line) => sum + Number(line.amount), 0);

        const totalCredit = lines
          .filter((line) => line.type === "CREDIT")
          .reduce((sum, line) => sum + Number(line.amount), 0);

        return (
          <div
            key={account.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div>
                <span className="font-mono text-xs text-slate-500">
                  {account.code}
                </span>

                <h2 className="mt-1 font-semibold text-slate-900">
                  {account.name}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {account.type}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <p>
                  Debit:{" "}
                  <span className="font-semibold text-slate-900">
                    ₹{format(totalDebit)}
                  </span>
                </p>

                <p className="mt-1">
                  Credit:{" "}
                  <span className="font-semibold text-slate-900">
                    ₹{format(totalCredit)}
                  </span>
                </p>
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="px-6 py-8 text-sm text-slate-500">
                No journal transactions for this account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Entry
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
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
                    {lines.map((line) => (
                      <tr
                        key={line.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(
                            line.journalEntry.entryDate
                          ).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {line.journalEntry.entryNumber}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {line.description ||
                            line.journalEntry.description}
                        </td>

                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {line.type === "DEBIT"
                            ? `₹${format(Number(line.amount))}`
                            : "—"}
                        </td>

                        <td className="px-6 py-4 text-right text-sm text-slate-700">
                          {line.type === "CREDIT"
                            ? `₹${format(Number(line.amount))}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot className="border-t border-slate-200 bg-slate-50">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-sm font-bold text-slate-900"
                      >
                        Account Total
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                        ₹{format(totalDebit)}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                        ₹{format(totalCredit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
