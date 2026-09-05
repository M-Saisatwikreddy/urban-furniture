import { prisma } from "@/lib/prisma";
import { createPayment } from "./actions";

export default async function PaymentsPage() {
  const [customers, invoices, payments] = await Promise.all([
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.invoice.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        customerId: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        invoiceDate: "desc",
      },
    }),

    prisma.payment.findMany({
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: {
        paymentDate: "desc",
      },
    }),
  ]);

  const openInvoices = invoices.filter((invoice) => {
    const total = Number(invoice.totalAmount);
    const paid = Number(invoice.paidAmount);

    return total > paid;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Payments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Record customer payments and track outstanding balances.
        </p>
      </div>

      {/* Payment Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Record Payment
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Record a payment against an outstanding customer invoice.
          </p>
        </div>

        {customers.length === 0 || openInvoices.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {customers.length === 0
              ? "Create a customer before recording a payment."
              : "There are no outstanding invoices available for payment."}
          </div>
        ) : (
          <form action={createPayment} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Customer */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Customer *
                </label>

                <select
                  name="customerId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="" disabled>
                    Select customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Invoice *
                </label>

                <select
                  name="invoiceId"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="" disabled>
                    Select invoice
                  </option>

                  {openInvoices.map((invoice) => {
                    const outstanding =
                      Number(invoice.totalAmount) -
                      Number(invoice.paidAmount);

                    return (
                      <option
                        key={invoice.id}
                        value={invoice.id}
                      >
                        {invoice.invoiceNumber} —{" "}
                        {invoice.customer.name} — Outstanding ₹
                        {outstanding.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Amount (₹) *
                </label>

                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="e.g. 25000"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method *
                </label>

                <select
                  name="method"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                >
                  <option value="" disabled>
                    Select method
                  </option>

                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reference
                </label>

                <input
                  name="reference"
                  type="text"
                  placeholder="e.g. UPI transaction ID"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <input
                  name="notes"
                  type="text"
                  placeholder="Optional notes"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Record Payment
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Payment History */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Payment History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {payments.length} payment
            {payments.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Invoice
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Method
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {payment.paymentDate.toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {payment.customer.name}
                    </td>

                    <td className="px-6 py-4 font-mono text-sm text-slate-700">
                      {payment.invoice?.invoiceNumber || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      ₹
                      {Number(payment.amount).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {payment.method.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {payment.reference || "—"}
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