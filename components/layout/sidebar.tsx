"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "▦",
      },
    ],
  },

  {
    title: "Sales",
    items: [
      {
        label: "Invoices",
        href: "/invoices",
        icon: "▤",
      },
      {
        label: "Customers",
        href: "/customers",
        icon: "♙",
      },
      {
        label: "Payments",
        href: "/payments",
        icon: "₹",
      },
    ],
  },

  {
    title: "Inventory",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: "□",
      },
      {
        label: "Categories",
        href: "/categories",
        icon: "▣",
      },
    ],
  },

  {
    title: "Purchases",
    items: [
      {
        label: "Vendors",
        href: "/vendors",
        icon: "♙",
      },
    ],
  },

  {
    title: "Accounting",
    items: [
      {
        label: "Accounts",
        href: "/accounts",
        icon: "◎",
      },
      {
        label: "Journal",
        href: "/journal",
        icon: "≡",
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: "◒",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">

      {/* BRAND */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div>
          <div className="text-lg font-bold tracking-tight text-slate-900">
            URBAN FURNITURE
          </div>

          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Accounting System
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">

        {sections.map((section) => (
          <div
            key={section.title}
            className="mb-6"
          >
            {/* Section title */}
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>

            {/* Section items */}
            <div className="space-y-1">

              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {/* Icon */}
                    <span className="flex h-5 w-5 items-center justify-center text-sm">
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            </div>
          </div>
        ))}

      </nav>

      {/* USER PROFILE */}
      <div className="border-t border-slate-200 p-4">

        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">

          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            SA
          </div>

          {/* User information */}
          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-900">
              Admin User
            </p>

            <p className="truncate text-xs text-slate-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}