"use client";

import { useState } from "react";
import { createSalesOrder } from "./actions";

type Customer = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sellingPrice: unknown;
  stock: number;
  type: string;
};

type Props = {
  customers: Customer[];
  products: Product[];
};

export default function SalesOrderForm({
  customers,
  products,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  const product = products.find(
    (item) => item.id === selectedProduct
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Create Sales Order
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create a customer order with product, quantity, price,
            and tax.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {open ? "Close" : "New Sales Order"}
        </button>
      </div>

      {open && (
        <form
          action={async (formData) => {
            await createSalesOrder(formData);
            setOpen(false);
            setSelectedProduct("");
          }}
          className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Customer
            </label>

            <select
              name="customerId"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select customer</option>

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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Product
            </label>

            <select
              name="productId"
              required
              value={selectedProduct}
              onChange={(event) =>
                setSelectedProduct(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select product</option>

              {products.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} — ₹
                  {Number(item.sellingPrice).toLocaleString(
                    "en-IN"
                  )}{" "}
                  — Stock: {item.stock}
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
              defaultValue="1"
              placeholder="Quantity"
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
                product
                  ? Number(product.sellingPrice)
                  : undefined
              }
              placeholder="Unit price"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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
              defaultValue="18"
              placeholder="Tax rate"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Order Date
            </label>

            <input
              name="orderDate"
              type="date"
              required
              defaultValue={
                new Date().toISOString().split("T")[0]
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Sales Order
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
