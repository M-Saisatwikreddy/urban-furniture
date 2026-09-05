import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/dashboard/product-form";
import { deleteProduct } from "./actions";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Products
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage furniture products, pricing and inventory.
        </p>
      </div>

      {/* Add Product Form */}
      <ProductForm categories={categories} />

      {/* Product Inventory */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Product Inventory
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl">📦</div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No products yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add your first furniture product above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SKU
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Purchase
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Selling
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Stock
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {products.map((product) => {
                  const lowStock =
                    product.type === "PRODUCT" &&
                    product.stock <= product.reorderLevel;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>

                        {product.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {product.description}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-600">
                          {product.sku}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.category.name}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        ₹
                        {Number(product.purchasePrice).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        ₹
                        {Number(product.sellingPrice).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {product.type === "SERVICE"
                          ? "—"
                          : product.stock}
                      </td>

                      <td className="px-6 py-4">

                        {product.type === "SERVICE" ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            Service
                          </span>
                        ) : lowStock ? (
                          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            In Stock
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-4">

                        <form action={deleteProduct}>
                          <input
                            type="hidden"
                            name="id"
                            value={product.id}
                          />

                          <button
                            type="submit"
                            className="text-xs font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </form>

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
