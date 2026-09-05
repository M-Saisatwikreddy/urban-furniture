"use client";

import { useState } from "react";
import { createInvoice } from "@/app/invoices/actions";

type Customer = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stock: number;
  type: "PRODUCT" | "SERVICE";
};

export default function InvoiceForm({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [taxRate, setTaxRate] = useState(18);

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  const subtotal = quantity * unitPrice;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  function handleProductChange(id: string) {
    setProductId(id);

    const product = products.find((item) => item.id === id);

    if (product) {
      setUnitPrice(product.sellingPrice);
    } else {
      setUnitPrice(0);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Create Invoice
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a customer invoice and automatically update inventory.
        </p>
      </div>

      {customers.length === 0 || products.length === 0 ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You need at least one customer and one product before creating an
          invoice.
        </div>
      ) : (
        <form action={createInvoice} className="mt-6 space-y-6">
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
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Due Date
              </label>

              <input
                name="dueDate"
                type="date"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product *
              </label>

              <select
                name="productId"
                required
                value={productId}
                onChange={(event) =>
                  handleProductChange(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="" disabled>
                  Select product
                </option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku}) — Stock:{" "}
                    {product.type === "SERVICE"
                      ? "Service"
                      : product.stock}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity *
              </label>

              <input
                name="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.max(1, Number(event.target.value))
                  )
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Unit Price (₹) *
              </label>

              <input
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(event) =>
                  setUnitPrice(Number(event.target.value))
                }
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            {/* Tax */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                GST / Tax Rate (%)
              </label>

              <select
                name="taxRate"
                value={taxRate}
                onChange={(event) =>
                  setTaxRate(Number(event.target.value))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          {/* Selected Product */}
          {selectedProduct && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <span className="font-medium text-slate-700">
                Selected:
              </span>{" "}
              <span className="text-slate-900">
                {selectedProduct.name}
              </span>

              <span className="ml-4 text-slate-500">
                Current stock:{" "}
                {selectedProduct.type === "SERVICE"
                  ? "Service"
                  : selectedProduct.stock}
              </span>
            </div>
          )}

          {/* Totals */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="ml-auto max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Subtotal
                </span>

                <span className="font-medium text-slate-900">
                  ₹
                  {subtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Tax ({taxRate}%)
                </span>

                <span className="font-medium text-slate-900">
                  ₹
                  {taxAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    ₹
                    {total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create Invoice
            </button>
          </div>
        </form>
      )}
    </div>
  );
}