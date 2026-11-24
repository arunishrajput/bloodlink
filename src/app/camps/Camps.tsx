"use client";

import { useEffect, useState } from "react";
import { StateDistrictSelect } from "@/components/StateDistrictSelect";
import { useGeolocation } from "@/components/useLocation";
import { ShareButton } from "@/components/ShareButton";
import { api, formatDate, formatTime } from "@/lib/client";

type Camp = {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  date: string;
  startTime: string;
  endTime: string;
  organisedBy: string;
  conductedBy: string;
  contactPhone: string;
  lat: number | null;
  lng: number | null;
};

const RANGES = [
  ["upcoming", "Upcoming"],
  ["week", "This week"],
  ["month", "This month"],
  ["all", "All"],
] as const;

export function Camps() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("upcoming");
  const [data, setData] = useState<{ total: number; camps: Camp[] } | null>(null);
  const { locate, loading, error } = useGeolocation();

  useEffect(() => {
    const p = new URLSearchParams({ range });
    if (state) p.set("state", state);
    if (district) p.set("district", district);
    if (q.trim()) p.set("q", q.trim());
    const t = setTimeout(() => {
      setData(null);
      api<{ total: number; camps: Camp[] }>(`/api/camps?${p}`).then(setData).catch(() => setData({ total: 0, camps: [] }));
    }, 250);
    return () => clearTimeout(t);
  }, [state, district, q, range]);

  async function locateNow() {
    const loc = await locate();
    if (loc?.state) {
      setState(loc.state);
      setDistrict(loc.district ?? "");
    }
  }

  return (
    <div className="container-page py-10">
      <div className="card grid gap-4 p-5 lg:grid-cols-[2fr_1.3fr_auto] lg:items-end">
        <StateDistrictSelect state={state} district={district} onChange={(s, d) => { setState(s); setDistrict(d); }} />
        <label className="block">
          <span className="label">Search</span>
          <input className="input" placeholder="Camp, area, organiser…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="btn-secondary" onClick={locateNow} disabled={loading}>{loading ? "Locating…" : "Use my location"}</button>
      </div>
      {error && <p className="mt-2 text-sm text-warn">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {RANGES.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={range === k} onClick={() => setRange(k)} className={`chip ${range === k ? "chip-active" : ""}`}>{l}</button>
          ))}
        </div>
        <p className="text-sm font-medium" aria-live="polite">{data ? `${data.total} camp${data.total === 1 ? "" : "s"} found` : "Loading…"}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {data == null && [0, 1, 2, 3].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-line/60" />)}
        {data?.camps.map((c) => (
          <article key={c.id} className="card flex gap-4 p-5">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-600 text-white">
              <span className="text-xs font-semibold uppercase">{formatDate(c.date, { month: "short" })}</span>
              <span className="font-display text-2xl leading-none font-extrabold">{formatDate(c.date, { day: "numeric" })}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-brand-700">{formatDate(c.date, { weekday: "long" })} · {formatTime(c.startTime)} – {formatTime(c.endTime)}</p>
              <h3 className="mt-1 font-bold leading-snug">{c.name}</h3>
              <p className="text-sm text-muted">{c.address}, {c.district}</p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div><dt className="font-semibold uppercase tracking-wider text-muted">Organised by</dt><dd className="mt-0.5 text-ink">{c.organisedBy}</dd></div>
                <div><dt className="font-semibold uppercase tracking-wider text-muted">Conducted by</dt><dd className="mt-0.5 text-ink">{c.conductedBy}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`tel:${c.contactPhone}`} className="btn-primary px-4 py-2 text-xs">Call</a>
                {c.lat != null && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2 text-xs">Directions</a>
                )}
                <ShareButton title={c.name} text={`${c.name} — ${formatDate(c.date)}, ${formatTime(c.startTime)} at ${c.address}`} className="btn-ghost px-3 py-2 text-xs" />
              </div>
            </div>
          </article>
        ))}
        {data && data.total === 0 && (
          <div className="card p-10 text-center text-muted md:col-span-2">No camps match these filters yet. Subscribe below and we&apos;ll tell you when one is listed near you.</div>
        )}
      </div>

      <Subscribe />
    </div>
  );
}

function Subscribe() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setError(null);
    try {
      await api("/api/camps/subscribe", { body: { state, district, email, phone } });
      setStatus("done");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  return (
    <section className="mt-16 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-10">
      <h2 className="text-2xl font-extrabold">Get notified about camps near you</h2>
      <p className="mt-2 text-muted">Pick a state and district and leave an email or mobile number. We&apos;ll let you know when a camp is listed there.</p>
      {status === "done" ? (
        <p className="mt-6 rounded-xl bg-card p-4 font-medium text-ok">You&apos;re subscribed. We&apos;ll be in touch when a camp comes up in {district}.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
          <StateDistrictSelect state={state} district={district} onChange={(s, d) => { setState(s); setDistrict(d); }} required />
          <label className="block"><span className="label">Email</span><input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block"><span className="label">Mobile number</span><input className="input" inputMode="numeric" placeholder="98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></label>
          <button className="btn-primary" disabled={status === "busy"}>Subscribe</button>
          {error && <p className="text-sm text-brand-700 lg:col-span-4">{error}</p>}
        </form>
      )}
    </section>
  );
}
