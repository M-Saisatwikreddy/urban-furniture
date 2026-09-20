"use client";

import { useState } from "react";
import { createPurchaseOrder } from "./actions";

type Vendor = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  purchasePrice: unknown;
};

type Props = {
  vendors: Vendor[];
  products: Product[];
};

export default function PurchaseOrderForm({
  vendors,
  products,
}: Props) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Create Purchase Order
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create an order for products purchased from a vendor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {open ? "Close" : "Add Purchase Order"}
        </button>
      </div>

      {open && (
        <form
          action={async (formData) => {
            await createPurchaseOrder(formData);
            setOpen(false);
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
              Product
            </label>

            <select
              name="productId"
              required
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Quantity
            </label>

            <input
              name="quantity"
              type="number"
              min="1"
              step="1"
              required
              placeholder="10"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Unit Price
            </label>

            <input
              name="unitPrice"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={
                selectedProduct
                  ? Number(selectedProduct.purchasePrice)
                  : ""
              }
              key={selectedProduct?.id ?? "empty"}
              placeholder="25000"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              name="notes"
              rows={3}
              placeholder="Optional purchase notes"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save Purchase Order
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
