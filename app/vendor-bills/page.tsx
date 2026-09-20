import { prisma } from "@/lib/prisma";
import VendorBillForm from "./vendor-bill-form";
import PaymentForm from "./payment-form";

export default async function VendorBillsPage() {
  const vendorBills = await prisma.vendorBill.findMany({
    include: {
      vendor: true,
      purchaseOrder: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const vendors = await prisma.vendor.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      status: {
        in: ["DRAFT", "CONFIRMED"],
      },
    },
    include: {
      vendor: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Bills that still have an outstanding amount
  const payableBills = await prisma.vendorBill.findMany({
    where: {
      status: {
        in: ["POSTED", "PARTIALLY_PAID"],
      },
    },
    include: {
      vendor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalBills = vendorBills.length;

  const totalAmount = vendorBills.reduce(
    (sum, bill) => sum + Number(bill.totalAmount),
    0
  );

  const outstandingAmount = vendorBills.reduce(
    (sum, bill) =>
      sum +
      Number(bill.totalAmount) -
      Number(bill.paidAmount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Vendor Bills
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Convert purchase orders into vendor bills and track
          payables.
        </p>
      </div>

      {/* Create Vendor Bill */}
      <VendorBillForm
        vendors={vendors}
        purchaseOrders={purchaseOrders}
      />

      {/* Vendor Payment */}
      <PaymentForm bills={payableBills} />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Bills
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalBills}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Bills Value
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Outstanding Payables
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ₹{outstandingAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Vendor Bills Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Vendor Bill List
          </h2>
        </div>

        {vendorBills.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No vendor bills created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Bill Number
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Vendor
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Purchase Order
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Bill Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Amount
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Paid
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Outstanding
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {vendorBills.map((bill) => {
                  const outstanding =
                    Number(bill.totalAmount) -
                    Number(bill.paidAmount);

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {bill.billNumber}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {bill.vendor.name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {bill.purchaseOrder?.orderNumber ??
                          "Manual"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {bill.billDate.toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-900">
                        ₹
                        {Number(
                          bill.totalAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        ₹
                        {Number(
                          bill.paidAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        ₹
                        {outstanding.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}