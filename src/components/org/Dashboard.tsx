"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, formatDate, formatTime, timeAgo } from "@/lib/client";
import { BLOOD_GROUPS } from "@/lib/blood";

type Bank = { id: string; name: string; district: string; state: string; verified: boolean; active: boolean; stockUpdatedAt: string; stock: { bloodGroup: string; units: number }[] };
type Camp = { id: string; name: string; address: string; date: string; startTime: string; endTime: string; verified: boolean };
type Member = { id: string; role: "OWNER" | "MEMBER"; user: { email: string | null } };
type Org = { id: string; name: string; banks: Bank[]; camps: Camp[]; members: Member[] };

export function Dashboard({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<{ org: Org | null; role?: "OWNER" | "MEMBER" } | null>(null);
  const [tab, setTab] = useState<"banks" | "camps" | "team">("banks");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => api<{ org: Org | null; role?: "OWNER" | "MEMBER" }>("/api/org").then(setData).catch((e) => setError(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/organisation/login");
    router.refresh();
  }

  if (!data) return <div className="container-page py-12"><div className="h-64 animate-pulse rounded-2xl bg-line/60" /></div>;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Organisation dashboard</p>
          <h1 className="mt-1 text-3xl font-extrabold">{data.org?.name ?? "Welcome"}</h1>
          <p className="text-sm text-muted">Signed in as {email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <Link href="/admin" className="btn-secondary">Admin panel</Link>}
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-brand-700">{error}</p>}

      {!data.org ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <p className="text-muted md:col-span-2">You haven&apos;t listed anything yet. Start by registering a blood bank or a camp; we&apos;ll set up your organisation along the way.</p>
          {[
            ["/organisation/register-bank", "Register a blood bank", "List your bank and publish live stock for every blood group."],
            ["/organisation/register-camp", "Register a blood camp", "List a voluntary donation drive so nearby donors can find it."],
          ].map(([href, t, s]) => (
            <Link key={href} href={href} className="card p-6 hover:border-brand-300">
              <p className="text-lg font-bold">{t}</p>
              <p className="mt-1 text-sm text-muted">{s}</p>
              <p className="mt-4 text-sm font-semibold text-brand-700">Get started →</p>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 flex gap-2 border-b border-line" role="tablist">
            {([["banks", `Blood banks (${data.org.banks.length})`], ["camps", `Camps (${data.org.camps.length})`], ["team", `Team (${data.org.members.length})`]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold ${tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-muted hover:text-ink"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="mt-6">
            {tab === "banks" && <Banks banks={data.org.banks} reload={load} />}
            {tab === "camps" && <Camps camps={data.org.camps} reload={load} />}
            {tab === "team" && <Team members={data.org.members} isOwner={data.role === "OWNER"} reload={load} />}
          </div>
        </>
      )}
    </div>
  );
}

function Banks({ banks, reload }: { banks: Bank[]; reload: () => void }) {
  return (
    <div className="space-y-4">
      <Link href="/organisation/register-bank" className="btn-primary">+ Register a blood bank</Link>
      {banks.length === 0 && <p className="text-sm text-muted">No blood banks yet.</p>}
      {banks.map((b) => <StockEditor key={b.id} bank={b} reload={reload} />)}
    </div>
  );
}

function StockEditor({ bank, reload }: { bank: Bank; reload: () => void }) {
  const initial = Object.fromEntries(BLOOD_GROUPS.map((g) => [g, bank.stock.find((s) => s.bloodGroup === g)?.units ?? 0]));
  const [stock, setStock] = useState<Record<string, number>>(initial);
  const [status, setStatus] = useState<string | null>(null);
  const dirty = BLOOD_GROUPS.some((g) => stock[g] !== initial[g]);

  async function save() {
    setStatus("Saving…");
    try {
      await api(`/api/org/banks/${bank.id}/stock`, { method: "PUT", body: { stock } });
      setStatus("Stock published");
      reload();
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  async function remove() {
    if (!confirm(`Delete ${bank.name}? This removes it from search for everyone.`)) return;
    await api(`/api/org/banks/${bank.id}`, { method: "DELETE" });
    reload();
  }

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{bank.name}</h3>
          <p className="text-sm text-muted">
            {bank.district}, {bank.state} · {bank.verified ? <span className="text-sky-700">Verified</span> : "Awaiting verification"}
            {!bank.active && " · Hidden by admin"} · Stock updated {timeAgo(bank.stockUpdatedAt)}
          </p>
        </div>
        <div className="flex gap-1">
          <Link href={`/organisation/register-bank?id=${bank.id}`} className="btn-ghost py-2 text-xs">Edit details</Link>
          <button onClick={remove} className="btn-ghost py-2 text-xs">Delete</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {BLOOD_GROUPS.map((g) => (
          <label key={g} className="block text-center">
            <span className="mb-1 block text-xs font-bold text-brand-700">{g}</span>
            <input
              className="input px-2 text-center"
              type="number"
              min={0}
              inputMode="numeric"
              value={stock[g]}
              onChange={(e) => setStock({ ...stock, [g]: Math.max(0, Number(e.target.value) || 0) })}
              aria-label={`${g} units`}
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-primary py-2.5" disabled={!dirty} onClick={save}>Publish stock</button>
        {status && <span className="text-sm text-muted">{status}</span>}
      </div>
    </article>
  );
}

function Camps({ camps, reload }: { camps: Camp[]; reload: () => void }) {
  async function remove(c: Camp) {
    if (!confirm(`Delete ${c.name}?`)) return;
    await api(`/api/org/camps/${c.id}`, { method: "DELETE" });
    reload();
  }
  return (
    <div className="space-y-4">
      <Link href="/organisation/register-camp" className="btn-primary">+ Register a camp</Link>
      {camps.length === 0 && <p className="text-sm text-muted">No camps yet.</p>}
      {camps.map((c) => (
        <article key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h3 className="font-bold">{c.name}</h3>
            <p className="text-sm text-muted">{formatDate(c.date)} · {formatTime(c.startTime)} – {formatTime(c.endTime)} · {c.address}</p>
            {new Date(c.date) < new Date(new Date().toDateString()) && <p className="text-xs text-muted">This camp has passed.</p>}
          </div>
          <div className="flex gap-1">
            <Link href={`/organisation/register-camp?id=${c.id}`} className="btn-ghost py-2 text-xs">Edit</Link>
            <button onClick={() => remove(c)} className="btn-ghost py-2 text-xs">Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Team({ members, isOwner, reload }: { members: Member[]; isOwner: boolean; reload: () => void }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await api("/api/org/members", { body: { email } });
      setEmail("");
      setMsg("Teammate added. They can sign in with this email.");
      reload();
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this teammate?")) return;
    try {
      await api(`/api/org/members/${id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      {isOwner && (
        <form onSubmit={add} className="card flex flex-col gap-3 p-5 sm:flex-row">
          <input className="input" type="email" required placeholder="teammate@organisation.org" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-primary shrink-0">Add teammate</button>
        </form>
      )}
      {msg && <p className="text-sm text-muted">{msg}</p>}
      <ul className="card divide-y divide-line">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-4">
            <span className="text-sm">{m.user.email} {m.role === "OWNER" && <span className="ml-2 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">Owner</span>}</span>
            {isOwner && m.role !== "OWNER" && <button onClick={() => remove(m.id)} className="text-xs text-muted underline">Remove</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
