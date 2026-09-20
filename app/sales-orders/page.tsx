import { prisma } from "@/lib/prisma";
import SalesOrderForm from "./sales-order-form";
import { convertSalesOrderToInvoice } from "./actions";

export default async function SalesOrdersPage() {
  const salesOrders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
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

  const customers = await prisma.customer.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const totalOrders = salesOrders.length;

  const totalValue = salesOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Sales Orders
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create customer sales orders and prepare them for invoicing.
        </p>
      </div>

      <SalesOrderForm
        customers={customers}
        products={products}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Order Value
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ₹{totalValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Sales Order List
          </h2>
        </div>

        {salesOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No sales orders created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Order Number
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Customer
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Product
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Quantity
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Total
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {salesOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.customer.name}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.items[0]?.product.name ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {order.items[0]?.quantity ?? 0}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      ₹
                      {Number(
                        order.totalAmount
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {order.orderDate.toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {order.status === "CONFIRMED" ? (
                        <form
                          action={convertSalesOrderToInvoice}
                        >
                          <input
                            type="hidden"
                            name="salesOrderId"
                            value={order.id}
                          />

                          <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Convert to Invoice
                          </button>
                        </form>
                      ) : order.status === "INVOICED" ? (
                        <span className="text-xs font-medium text-green-600">
                          Invoiced
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          —
                        </span>
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