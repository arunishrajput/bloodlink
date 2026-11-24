"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** Search + sort + category chips that live in the URL, so server pages can filter. */
export function ListFilters({ placeholder, categories }: { placeholder: string; categories: readonly (readonly [string, string])[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const push = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => push({ q }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const category = params.get("category") ?? "";
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <label className="block">
          <span className="sr-only">Search</span>
          <input className="input" type="search" placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="block">
          <span className="sr-only">Sort by</span>
          <select className="input" value={params.get("sort") ?? "newest"} onChange={(e) => push({ sort: e.target.value === "newest" ? "" : e.target.value })}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(([v, l]) => (
          <button key={l} onClick={() => push({ category: v })} className={`chip ${category === v ? "chip-active" : ""}`}>{l}</button>
        ))}
      </div>
    </div>
  );
}
