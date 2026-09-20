"use client";

import { useState } from "react";
import { createBudget } from "./actions";

export default function BudgetForm() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Create Budget
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add a planned budget for your business.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {open ? "Close" : "Add Budget"}
        </button>
      </div>

      {open && (
        <form
          action={async (formData) => {
            await createBudget(formData);
            setOpen(false);
          }}
          className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Budget Name
            </label>

            <input
              name="name"
              required
              placeholder="2026 Sales Budget"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Period
            </label>

            <input
              name="period"
              required
              placeholder="2026"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Responsible Person
            </label>

            <input
              name="responsible"
              required
              placeholder="Admin User"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Analytic Account
            </label>

            <input
              name="analyticAccount"
              placeholder="Sales / Operations"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Planned Amount
            </label>

            <input
              name="plannedAmount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="1000000"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save Budget
            </button>
          </div>
        </form>
      )}
    </div>
  );
}