import { prisma } from "@/lib/prisma";

export default async function BalanceSheetPage() {
  const accounts = await prisma.account.findMany({
    orderBy: {
      code: "asc",
    },
  });

  const journalLines = await prisma.journalLine.findMany();

  const balances = accounts.map((account) => {
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
      balance: debit - credit,
    };
  });

  const assets = balances.filter(
    (account) => account.type === "ASSET"
  );

  const liabilities = balances.filter(
    (account) => account.type === "LIABILITY"
  );

  const equity = balances.filter(
    (account) => account.type === "EQUITY"
  );

  const revenue = balances
    .filter((account) => account.type === "REVENUE")
    .reduce((sum, account) => sum + account.balance, 0);

  const expenses = balances
    .filter((account) => account.type === "EXPENSE")
    .reduce((sum, account) => sum + account.balance, 0);

  const netProfit = revenue + expenses;

  const totalAssets = assets.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const totalLiabilities = liabilities.reduce(
    (sum, account) => sum - account.balance,
    0
  );

  const totalEquity =
    equity.reduce((sum, account) => sum - account.balance, 0) +
    netProfit;

  const format = (amount: number) =>
    Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });

  const Section = ({
    title,
    rows,
    total,
  }: {
    title: string;
    rows: typeof balances;
    total: number;
  }) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            No accounts recorded.
          </div>
        ) : (
          rows.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <span className="font-mono text-xs text-slate-500">
                  {account.code}
                </span>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {account.name}
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-900">
                ₹{format(account.balance)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t-2 border-slate-300 bg-slate-50 px-6 py-4">
        <span className="text-sm font-bold text-slate-900">
          Total {title}
        </span>

        <span className="text-sm font-bold text-slate-900">
          ₹{format(total)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Balance Sheet
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of Urban Furniture's assets, liabilities and equity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Section
          title="Assets"
          rows={assets}
          total={totalAssets}
        />

        <Section
          title="Liabilities"
          rows={liabilities}
          total={totalLiabilities}
        />

        <Section
          title="Equity"
          rows={equity}
          total={totalEquity}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Net Profit
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Revenue minus expenses
            </p>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            ₹{format(netProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}
