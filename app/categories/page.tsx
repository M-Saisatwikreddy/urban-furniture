
import { prisma } from "@/lib/prisma";
import { createCategory } from "./actions";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Categories
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Organize furniture products into categories.
        </p>
      </div>

      {/* Add Category */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Category
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a category for your furniture inventory.
        </p>

        <form action={createCategory} className="mt-6 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category Name *
            </label>

            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Office Furniture"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              rows={3}
              placeholder="Category description..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Category
            </button>
          </div>

        </form>
      </div>

      {/* Categories */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Product Categories
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No categories created yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between px-6 py-5"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {category.name}
                  </p>

                  {category.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="text-sm text-slate-500">
                  {category._count.products} product
                  {category._count.products !== 1 ? "s" : ""}
                </div>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}