"use client";

import { useState } from "react";
import { api } from "@/lib/client";

const ROLES = [
  { role: "donor", label: "Donor", hint: "Has an urgent request waiting" },
  { role: "requester", label: "Patient's family", hint: "Request with a donor who accepted" },
  { role: "organiser", label: "Blood bank", hint: "Manages stock and a camp" },
  { role: "admin", label: "Admin", hint: "Verifies listings, manages content" },
] as const;

/** One-click sign-in as a sample account. Rendered only when demo mode is on. */
export function DemoLogin({ only }: { only?: readonly string[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const roles = ROLES.filter((r) => !only || only.includes(r.role));

  async function go(role: string) {
    setBusy(role);
    setError(null);
    try {
      const r = await api<{ redirect: string }>("/api/demo/login", { body: { role } });
      window.location.href = r.redirect;
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-5">
      <p className="text-sm font-semibold text-brand-700">Demo mode: skip the code</p>
      <p className="mt-1 text-xs text-muted">Sign in as a sample account to explore.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {roles.map((r) => (
          <button key={r.role} onClick={() => go(r.role)} disabled={busy !== null} className="rounded-xl border border-line bg-card px-3 py-2.5 text-left transition-colors hover:border-brand-600 disabled:opacity-60">
            <span className="block text-sm font-semibold">{busy === r.role ? "Signing in…" : r.label}</span>
            <span className="block text-xs text-muted">{r.hint}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-brand-700" role="alert">{error}</p>}
    </div>
  );
}
