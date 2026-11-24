"use client";

import { useState } from "react";
import { api } from "@/lib/client";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setError(null);
    try {
      await api("/api/contact", { body: f });
      setStatus("done");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  if (status === "done")
    return <div className="card p-8"><p className="text-lg font-bold">Message sent</p><p className="mt-2 text-muted">Thanks for reaching out. We&apos;ll reply to {f.email} soon.</p></div>;

  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">Name</span><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="block"><span className="label">Email</span><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      </div>
      <label className="block"><span className="label">Subject</span><input className="input" required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></label>
      <label className="block"><span className="label">Message</span><textarea className="input" rows={6} required minLength={10} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label>
      {error && <p className="text-sm text-brand-700">{error}</p>}
      <button className="btn-primary w-full" disabled={status === "busy"}>{status === "busy" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
