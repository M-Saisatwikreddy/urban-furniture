"use client";

import { useState } from "react";
import { createProduct } from "@/app/products/actions";

type Category = {
  id: string;
  name: string;
};

export default function ProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Add Product
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create a new product or service.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {open ? "Close" : "+ Add Product"}
        </button>
      </div>

      {open && (
        <form action={createProduct} className="p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Product Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Executive Office Chair"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SKU *
              </label>

              <input
                type="text"
                name="sku"
                required
                placeholder="e.g. CHR-001"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                name="type"
                defaultValue="PRODUCT"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category *
              </label>

              <select
                name="categoryId"
                required
                defaultValue=""
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              >
                <option value="" disabled>
                  Select category
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Purchase Price (₹)
              </label>

              <input
                type="number"
                name="purchasePrice"
                min="0"
                step="0.01"
                defaultValue="0"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Selling Price (₹)
              </label>

              <input
                type="number"
                name="sellingPrice"
                min="0"
                step="0.01"
                defaultValue="0"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                defaultValue="0"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reorder Level
              </label>

              <input
                type="number"
                name="reorderLevel"
                min="0"
                defaultValue="5"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              rows={4}
              placeholder="Product description..."
              className="block w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save Product
            </button>
          </div>
        </form>
      )}
    </div>
  );
}