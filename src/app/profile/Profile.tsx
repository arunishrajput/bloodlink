"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DonorForm } from "@/components/DonorForm";
import { api, formatDate, timeAgo } from "@/lib/client";
import { DONATION_GAP_DAYS } from "@/lib/blood";

type Donor = {
  name: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  bloodGroup: string;
  weightKg: number | null;
  heightCm: number | null;
  state: string;
  district: string;
  lat: number;
  lng: number;
  contactCall: boolean;
  contactSms: boolean;
  contactWhatsapp: boolean;
  radiusKm: number;
  available: boolean;
  lastDonatedAt: string | null;
};
type User = { id: string; phone: string | null; email: string | null; name: string | null; donor: Donor | null };
type Match = {
  id: string;
  status: "NOTIFIED" | "ACCEPTED" | "DECLINED";
  distanceKm: number;
  notifiedAt: string;
  request: { id: string; bloodGroup: string; units: number; urgency: string; hospitalName: string; district: string; status: string; note: string | null; patientName: string | null; contactPhone: string | null };
};
type MyRequest = { id: string; patientName: string; bloodGroup: string; units: number; hospitalName: string; status: string; createdAt: string; notified: number; accepted: number };

const URGENCY: Record<string, string> = { CRITICAL: "Critical", URGENT: "Urgent", PLANNED: "Planned" };

export function Profile({ user, welcome }: { user: User; welcome: boolean }) {
  const router = useRouter();
  const [donor, setDonor] = useState(user.donor);
  const [editing, setEditing] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [requests, setRequests] = useState<MyRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (user.donor) api<{ matches: Match[] }>("/api/donor/requests").then((r) => setMatches(r.matches));
    api<{ requests: MyRequest[] }>("/api/requests").then((r) => setRequests(r.requests));
  }, [user.donor]);
  useEffect(load, [load]);

  async function patchDonor(body: Partial<Donor>) {
    setError(null);
    try {
      const r = await api<{ donor: Donor }>("/api/donor", { method: "PATCH", body });
      setDonor(r.donor);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function respond(id: string, action: "accept" | "decline") {
    try {
      await api(`/api/matches/${id}`, { body: { action } });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function deleteDonor() {
    if (!confirm("Remove your donor profile? You'll stop receiving requests. You can register again any time.")) return;
    await api("/api/donor", { method: "DELETE" });
    setDonor(null);
    router.refresh();
  }

  const nextEligible = donor?.lastDonatedAt ? new Date(new Date(donor.lastDonatedAt).getTime() + DONATION_GAP_DAYS * 86400000) : null;
  const canDonateNow = !nextEligible || nextEligible <= new Date();
  const pending = matches?.filter((m) => m.status === "NOTIFIED" && m.request.status === "OPEN") ?? [];
  const past = matches?.filter((m) => !(m.status === "NOTIFIED" && m.request.status === "OPEN")) ?? [];

  return (
    <div className="container-page max-w-4xl space-y-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Your profile</p>
          <h1 className="mt-1 text-3xl font-extrabold">{donor?.name ?? user.name ?? (user.phone ? `+91 ${user.phone}` : user.email)}</h1>
          <p className="text-sm text-muted">{user.phone ? `+91 ${user.phone}` : user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.email && <Link href="/organisation" className="btn-secondary">Organisation dashboard</Link>}
          <button onClick={signOut} className="btn-ghost">Sign out</button>
        </div>
      </div>
      {welcome && donor && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900">
          <strong>Welcome to BloodLink!</strong> You&apos;re registered as a {donor.bloodGroup} donor. We&apos;ll alert you when someone within {donor.radiusKm} km needs your blood group.
        </div>
      )}
      {error && <p className="text-sm text-brand-700">{error}</p>}

      {donor ? (
        editing ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit donor details</h2>
              <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
            <DonorForm
              mode="edit"
              verifiedPhone={user.phone}
              initial={{ ...donor, dob: donor.dob.slice(0, 10), weightKg: donor.weightKg?.toString() ?? "", heightCm: donor.heightCm?.toString() ?? "" }}
              onSaved={() => { setEditing(false); router.refresh(); window.location.reload(); }}
            />
          </div>
        ) : (
          <section className="card grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600 font-display text-3xl font-extrabold text-white">{donor.bloodGroup}</span>
            <div>
              <p className="font-bold">{donor.available ? "Available for requests" : "Not taking requests right now"}</p>
              <p className="mt-1 text-sm text-muted">
                {donor.district}, {donor.state} · within {donor.radiusKm} km ·{" "}
                {[donor.contactCall && "Call", donor.contactSms && "SMS", donor.contactWhatsapp && "WhatsApp"].filter(Boolean).join(", ")}
              </p>
              <p className="mt-1 text-sm text-muted">
                {donor.lastDonatedAt ? `Last donated ${formatDate(donor.lastDonatedAt, { day: "numeric", month: "short", year: "numeric" })}. ` : "No donation recorded yet. "}
                {canDonateNow ? <span className="font-medium text-ok">You can donate now.</span> : `You can donate again from ${formatDate(nextEligible!, { day: "numeric", month: "short" })}.`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-2.5 text-sm font-medium">
                Available
                <input type="checkbox" role="switch" className="h-5 w-9 accent-brand-600" checked={donor.available} onChange={(e) => patchDonor({ available: e.target.checked })} />
              </label>
              <button className="btn-secondary py-2.5" onClick={() => patchDonor({ lastDonatedAt: new Date().toISOString() })}>I donated today</button>
              <button className="btn-ghost py-2" onClick={() => setEditing(true)}>Edit details</button>
            </div>
          </section>
        )
      ) : (
        <section className="flex flex-col items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">You&apos;re not registered as a donor yet</p>
            <p className="text-sm text-muted">It takes two minutes, and we only reach out when someone near you needs your group.</p>
          </div>
          {user.phone ? <Link href="/register" className="btn-primary">Become a donor</Link> : <p className="text-sm text-muted">Sign in with a mobile number to register as a donor.</p>}
        </section>
      )}

      {donor && (
        <section>
          <h2 className="text-xl font-bold">Requests for you {pending.length > 0 && <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{pending.length}</span>}</h2>
          <p className="text-sm text-muted">People nearby who need a group you can give to. Your number is shared only if you accept.</p>
          <div className="mt-4 space-y-3">
            {matches == null && <div className="h-28 animate-pulse rounded-2xl bg-line/60" />}
            {matches && pending.length === 0 && <div className="card p-6 text-sm text-muted">No open requests right now. Thank you for being ready.</div>}
            {pending.map((m) => (
              <article key={m.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{m.request.units} unit(s) of {m.request.bloodGroup} needed</p>
                    <p className="text-sm text-muted">{m.request.hospitalName}, {m.request.district} · {m.distanceKm} km away · {timeAgo(m.notifiedAt)}</p>
                    {m.request.note && <p className="mt-2 text-sm">“{m.request.note}”</p>}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.request.urgency === "CRITICAL" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`}>{URGENCY[m.request.urgency]}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-primary flex-1" onClick={() => respond(m.id, "accept")}>I can donate</button>
                  <button className="btn-secondary flex-1" onClick={() => respond(m.id, "decline")}>Not this time</button>
                </div>
              </article>
            ))}
            {past.filter((m) => m.status === "ACCEPTED").map((m) => (
              <article key={m.id} className="card border-green-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ok">You accepted</p>
                <p className="mt-1 font-bold">{m.request.units} unit(s) of {m.request.bloodGroup} for {m.request.patientName}</p>
                <p className="text-sm text-muted">{m.request.hospitalName}, {m.request.district}</p>
                {m.request.contactPhone && m.request.status === "OPEN" && (
                  <div className="mt-3 flex gap-2">
                    <a href={`tel:+91${m.request.contactPhone}`} className="btn-primary px-4 py-2">Call requester</a>
                    <a href={`https://wa.me/91${m.request.contactPhone}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4 py-2">WhatsApp</a>
                  </div>
                )}
                {m.request.status !== "OPEN" && <p className="mt-2 text-xs text-muted">This request is now {m.request.status.toLowerCase()}.</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your blood requests</h2>
          <Link href="/request" className="text-sm font-semibold text-brand-700 hover:underline">+ New request</Link>
        </div>
        <div className="mt-4 space-y-3">
          {requests == null && <div className="h-20 animate-pulse rounded-2xl bg-line/60" />}
          {requests?.length === 0 && <div className="card p-6 text-sm text-muted">You haven&apos;t raised any requests.</div>}
          {requests?.map((r) => (
            <Link key={r.id} href={`/request/${r.id}`} className="card flex items-center justify-between gap-4 p-5 hover:border-brand-300">
              <div>
                <p className="font-bold">{r.units} × {r.bloodGroup} for {r.patientName}</p>
                <p className="text-sm text-muted">{r.hospitalName} · {timeAgo(r.createdAt)} · {r.notified} alerted, {r.accepted} accepted</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.status === "OPEN" ? "bg-brand-50 text-brand-700" : r.status === "FULFILLED" ? "bg-green-50 text-ok" : "bg-paper text-muted"}`}>
                {r.status[0] + r.status.slice(1).toLowerCase()}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {donor && (
        <section className="border-t border-line pt-6">
          <button onClick={deleteDonor} className="text-sm text-muted underline hover:text-brand-700">Remove my donor profile</button>
        </section>
      )}
    </div>
  );
}
