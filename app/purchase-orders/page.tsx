import { prisma } from "@/lib/prisma";
import PurchaseOrderForm from "./purchase-order-form";

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
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

  const vendors = await prisma.vendor.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const totalValue = purchaseOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Purchase Orders
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create and manage purchase orders for vendors.
        </p>
      </div>

      <PurchaseOrderForm vendors={vendors} products={products} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {purchaseOrders.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Purchase Value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ₹{totalValue.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Confirmed Orders</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {
              purchaseOrders.filter(
                (order) => order.status === "CONFIRMED"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Purchase Order List
          </h2>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No purchase orders created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Vendor</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.vendor.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {order.orderDate.toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {order.items.length}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {order.status}
                      </span>
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