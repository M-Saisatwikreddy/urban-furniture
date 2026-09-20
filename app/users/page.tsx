import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateUserForm from "./create-user-form";

export default async function UsersPage() {
  const currentUser = await requireUser();

  if (currentUser.role !== "ADMIN") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-bold text-red-800">
          Access Denied
        </h1>

        <p className="mt-2 text-sm text-red-700">
          Only administrators can manage users.
        </p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage users and their system roles.
          </p>
        </div>

        <CreateUserForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Name
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Created
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                  {user.name}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {user.email}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {user.role}
                  </span>
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
