import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="pl-64">

        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}