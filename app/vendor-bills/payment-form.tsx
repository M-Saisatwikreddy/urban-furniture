"use client";

import { useState } from "react";
import { createVendorPayment } from "./payment-actions";

type VendorBill = {
  id: string;
  billNumber: string;
  totalAmount: unknown;
  paidAmount: unknown;
  vendor: {
    name: string;
  };
};

type Props = {
  bills: VendorBill[];
};

export default function PaymentForm({ bills }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Pay Vendor Bill
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Register a cash, bank, UPI, card, or cheque payment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {open ? "Close" : "Record Payment"}
        </button>
      </div>

      {open && (
        <form
          action={async (formData) => {
            await createVendorPayment(formData);
            setOpen(false);
          }}
          className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2"
        >
          {/* Vendor Bill */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Vendor Bill
            </label>

            <select
              name="vendorBillId"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select vendor bill</option>

              {bills.map((bill) => {
                const outstanding =
                  Number(bill.totalAmount) -
                  Number(bill.paidAmount);

                return (
                  <option key={bill.id} value={bill.id}>
                    {bill.billNumber} — {bill.vendor.name} — ₹
                    {outstanding.toLocaleString("en-IN")} outstanding
                  </option>
                );
              })}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount
            </label>

            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="Payment amount"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Method
            </label>

            <select
              name="method"
              required
              defaultValue="BANK_TRANSFER"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Date
            </label>

            <input
              name="paymentDate"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Reference */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reference
            </label>

            <input
              name="reference"
              type="text"
              placeholder="Transaction / cheque reference"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <input
              name="notes"
              type="text"
              placeholder="Optional notes"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Record Payment
            </button>
          </div>
        </form>
      )}
    </div>
  );
}