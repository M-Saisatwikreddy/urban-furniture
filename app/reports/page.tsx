import Link from "next/link";

const reports = [
  {
    title: "Trial Balance",
    description:
      "View debit and credit balances for all ledger accounts.",
    href: "/reports/trial-balance",
  },
  {
    title: "Profit & Loss",
    description:
      "Analyze revenue, expenses and net profit for the business.",
    href: "/reports/profit-loss",
  },
  {
    title: "Balance Sheet",
    description:
      "View assets, liabilities and owner's equity.",
    href: "/reports/balance-sheet",
  },
  {
    title: "General Ledger",
    description:
      "View detailed transactions for each accounting account.",
    href: "/reports/general-ledger",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Financial Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Analyze Urban Furnitures financial performance and
          accounting records.
        </p>
      </div>

      {/* Reports */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {report.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {report.description}
                </p>
              </div>

              <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}