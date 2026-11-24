"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/client";

export function PledgeForm({ initialCount, goal }: { initialCount: number; goal: number }) {
  const [count, setCount] = useState(initialCount);
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setError(null);
    try {
      const r = await api<{ count: number }>("/api/pledges", { body: f });
      setCount(r.count);
      setStatus("done");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <p className="font-display text-4xl font-extrabold text-brand-700">{count.toLocaleString("en-IN")}<span className="text-lg text-muted"> / {goal.toLocaleString("en-IN")} pledged</span></p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-brand-600" style={{ width: `${Math.min(100, (count / goal) * 100)}%` }} />
      </div>
      {status === "done" ? (
        <div className="mt-8 rounded-xl bg-green-50 p-5 text-green-900">
          <p className="font-bold">Thank you for your pledge!</p>
          <p className="mt-1 text-sm">You&apos;re one of {count.toLocaleString("en-IN")} people standing up for voluntary blood donation.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block"><span className="label">Full name *</span><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="block"><span className="label">Email *</span><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <label className="block"><span className="label">Phone</span><input className="input" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></label>
          <label className="block"><span className="label">Anything you&apos;d like to add? <span className="font-normal text-muted">(optional)</span></span><textarea className="input" rows={3} placeholder="e.g. why this matters to you" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
          <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label>
          {error && <p className="text-sm text-brand-700">{error}</p>}
          <button className="btn-primary w-full py-4" disabled={status === "busy"}>{status === "busy" ? "Submitting…" : "Pledge my support"}</button>
          <p className="text-xs text-muted">We use your details only to count your support and, rarely, to send updates. No spam. See our <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </form>
      )}
    </div>
  );
}
