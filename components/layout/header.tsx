"use client";

import { useEffect, useState } from "react";

type SearchResult = {
  type: "Invoice" | "Customer" | "Product" | "Vendor" | "Account";
  name: string;
  href: string;
};

export default function Header() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const searchTerm = query.trim();

    if (searchTerm === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}`
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data: {
          results?: SearchResult[];
        } = await response.json();

        setResults(data.results ?? []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur">
      {/* SEARCH */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          ⌕
        </span>

        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder="Search invoices, customers, products..."
          className="h-10 w-80 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
        />

        {query.trim() !== "" && (
          <div className="absolute left-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {loading ? (
              <div className="px-4 py-4 text-sm text-slate-500">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto py-2">
                {results.map((result, index) => (
                  <a
                    key={`${result.type}-${result.name}-${index}`}
                    href={result.href}
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                    }}
                    className="block px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {result.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {result.type}
                        </p>
                      </div>

                      <span className="text-slate-400">→</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 text-center text-sm text-slate-500">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          ♢

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Accountant
            </p>
          </div>

          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  );
}