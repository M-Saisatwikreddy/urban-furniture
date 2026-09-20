import BudgetForm from "./budget-form";
import { prisma } from "@/lib/prisma";

export default async function BudgetsPage() {
  const budgets = await prisma.budget.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPlanned = budgets.reduce(
    (sum, budget) => sum + Number(budget.plannedAmount),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Budgets
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage planned budgets and spending targets.
        </p>
      </div>

      <BudgetForm />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Budgets</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {budgets.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Planned Amount
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ₹
            {totalPlanned.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Budget List
          </h2>
        </div>

        {budgets.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No budgets created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-medium text-slate-600">
                    Budget
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-600">
                    Period
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-600">
                    Responsible
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-600">
                    Analytic Account
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-slate-600">
                    Planned Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((budget) => (
                  <tr
                    key={budget.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {budget.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {budget.period}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {budget.responsible}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {budget.analyticAccount || "—"}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      ₹
                      {Number(budget.plannedAmount).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
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