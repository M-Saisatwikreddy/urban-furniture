"use client";

import { useState } from "react";
import { createVendorBill } from "./actions";

type Vendor = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
};

type PurchaseOrderItem = {
  id: string;
  productId: string;
  quantity: unknown;
  unitPrice: unknown;
  total: unknown;
  product: Product;
};

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  vendorId: string;
  totalAmount: unknown;
  vendor: Vendor;
  items: PurchaseOrderItem[];
};

type Props = {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
};

export default function VendorBillForm({
  vendors,
  purchaseOrders,
}: Props) {
  const [open, setOpen] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState("");

  const selectedOrder = purchaseOrders.find(
    (order) => order.id === purchaseOrderId
  );

  const selectedVendorId = selectedOrder?.vendorId ?? "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Create Vendor Bill
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Convert a purchase order into a vendor bill.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {open ? "Close" : "Create Bill"}
        </button>
      </div>

      {open && (
        <form
          action={async (formData) => {
            await createVendorBill(formData);
            setOpen(false);
            setPurchaseOrderId("");
          }}
          className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Vendor
            </label>

            <select
              name="vendorId"
              required
              value={selectedVendorId}
              onChange={(event) => {
                const vendorId = event.target.value;

                const matchingOrder = purchaseOrders.find(
                  (order) => order.vendorId === vendorId
                );

                setPurchaseOrderId(
                  matchingOrder?.id ?? ""
                );
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select vendor</option>

              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Purchase Order
            </label>

            <select
              name="purchaseOrderId"
              value={purchaseOrderId}
              onChange={(event) =>
                setPurchaseOrderId(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">
                Select purchase order
              </option>

              {purchaseOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} — {order.vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Bill Date
            </label>

            <input
              name="billDate"
              type="date"
              required
              defaultValue={
                new Date().toISOString().split("T")[0]
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Due Date
            </label>

            <input
              name="dueDate"
              type="date"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tax Rate (%)
            </label>

            <input
              name="taxRate"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {selectedOrder && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Purchase Order Total
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                ₹
                {Number(
                  selectedOrder.totalAmount
                ).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              name="notes"
              rows={3}
              placeholder="Optional bill notes"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Post Vendor Bill
            </button>
          </div>
        </form>
      )}
    </div>
  );
}