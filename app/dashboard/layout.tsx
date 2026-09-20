import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="pl-64">
        <Header />

        <main className="p-8">
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Welcome, {user.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {user.role}
              </span>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
