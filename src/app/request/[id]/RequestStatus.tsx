"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, formatDate, timeAgo } from "@/lib/client";

type Data = {
  request: {
    id: string;
    patientName: string;
    bloodGroup: string;
    units: number;
    urgency: string;
    hospitalName: string;
    district: string;
    state: string;
    status: "OPEN" | "FULFILLED" | "CANCELLED" | "EXPIRED";
    radiusKm: number;
    recurring: boolean;
    intervalDays: number | null;
    createdAt: string;
    expiresAt: string;
  };
  counts: { notified: number; accepted: number; declined: number };
  donors: { matchId: string; name: string; bloodGroup: string; distanceKm: number; respondedAt: string; phone: string | null; call: boolean; sms: boolean; whatsapp: boolean }[];
};

const STATUS: Record<Data["request"]["status"], [string, string]> = {
  OPEN: ["Searching", "bg-brand-50 text-brand-700"],
  FULFILLED: ["Fulfilled", "bg-green-50 text-ok"],
  CANCELLED: ["Cancelled", "bg-paper text-muted"],
  EXPIRED: ["Expired", "bg-paper text-muted"],
};

export function RequestStatus({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<Data>(`/api/requests/${id}`).then(setData).catch((e) => setError(e.message)), [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  async function patch(body: object) {
    setBusy(true);
    try {
      await api(`/api/requests/${id}`, { method: "PATCH", body });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !data)
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <h1 className="text-2xl font-bold">We couldn&apos;t open this request</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Link href="/profile" className="btn-primary mt-6">Go to your profile</Link>
      </div>
    );
  if (!data) return <div className="container-page max-w-3xl py-12"><div className="h-64 animate-pulse rounded-2xl bg-line/60" /></div>;

  const { request: r, counts, donors } = data;
  const [label, tone] = STATUS[r.status];
  const open = r.status === "OPEN";

  return (
    <div className="container-page max-w-3xl space-y-6 py-8 sm:py-12">
      <Link href="/profile" className="btn-ghost -ml-3">← My requests</Link>
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{label}</span>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              {r.units} unit{r.units > 1 ? "s" : ""} of {r.bloodGroup} for {r.patientName}
            </h1>
            <p className="mt-1 text-muted">{r.hospitalName}, {r.district}, {r.state}</p>
            {r.recurring && <p className="mt-1 text-sm text-muted">Recurring: every {r.intervalDays} days</p>}
          </div>
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 font-display text-2xl font-extrabold text-white">{r.bloodGroup}</span>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[["Donors alerted", counts.notified], ["Accepted", counts.accepted], ["Search radius", `${r.radiusKm} km`]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-paper p-3">
              <dd className="font-display text-2xl font-extrabold">{v}</dd>
              <dt className="text-xs text-muted">{l}</dt>
            </div>
          ))}
        </dl>
        {open && (
          <p className="mt-4 text-sm text-muted">
            {counts.accepted
              ? "A donor has accepted. Call them now to arrange the donation."
              : r.radiusKm < 100
                ? "If nobody accepts within about 10 minutes, we automatically widen the search and alert more donors."
                : "We're searching at the maximum radius. Keep this page open; it updates by itself."}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">Raised {timeAgo(r.createdAt)} · Expires {formatDate(r.expiresAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
      </div>

      <section>
        <h2 className="text-xl font-bold">Donors who accepted</h2>
        {donors.length === 0 ? (
          <div className="card mt-3 flex items-center gap-4 p-6">
            {open && <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-brand-500" />}
            <p className="text-sm text-muted">
              {open ? "Waiting for donors to respond. Their contact details appear here once they accept." : "No donor accepted this request."}
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {donors.map((dn) => (
              <li key={dn.matchId} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-bold">{dn.name} <span className="ml-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{dn.bloodGroup}</span></p>
                  <p className="text-sm text-muted">{dn.distanceKm} km away · accepted {timeAgo(dn.respondedAt)}</p>
                </div>
                {dn.phone && (
                  <div className="flex flex-wrap gap-2">
                    {dn.call && <a href={`tel:+91${dn.phone}`} className="btn-primary px-4 py-2">Call</a>}
                    {dn.sms && <a href={`sms:+91${dn.phone}`} className="btn-secondary px-4 py-2">SMS</a>}
                    {dn.whatsapp && <a href={`https://wa.me/91${dn.phone}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2">WhatsApp</a>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {open && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {r.radiusKm < 100 && counts.accepted === 0 && (
            <button className="btn-secondary flex-1" disabled={busy} onClick={() => patch({ expand: true })}>Widen search now</button>
          )}
          <button className="btn-primary flex-1" disabled={busy} onClick={() => patch({ status: "FULFILLED" })}>Mark as fulfilled</button>
          <button className="btn-ghost flex-1" disabled={busy} onClick={() => confirm("Cancel this request? Donors will no longer see it.") && patch({ status: "CANCELLED" })}>
            Cancel request
          </button>
        </div>
      )}
      {error && <p className="text-sm text-brand-700">{error}</p>}
    </div>
  );
}
