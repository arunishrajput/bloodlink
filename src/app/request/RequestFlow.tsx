"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BloodGroupPicker } from "@/components/BloodGroupPicker";
import { StateDistrictSelect } from "@/components/StateDistrictSelect";
import { CompatibilityTable } from "@/components/CompatibilityTable";
import { OtpForm } from "@/components/OtpForm";
import { Map } from "@/components/Map";
import { BankCard, type Bank } from "@/components/bank/BankCard";
import { geocodeDistrict, useGeolocation } from "@/components/useLocation";
import { useT } from "@/components/providers";
import { api } from "@/lib/client";
import { CAN_RECEIVE_FROM, type BloodGroup } from "@/lib/blood";

type Draft = {
  step: number;
  group: string | null;
  state: string;
  district: string;
  lat: number | null;
  lng: number | null;
  autoLocated: boolean;
  hospital: string;
  bankId: string | null;
};

const EMPTY: Draft = { step: 1, group: null, state: "", district: "", lat: null, lng: null, autoLocated: false, hospital: "", bankId: null };
const STORAGE_KEY = "bl_request_draft";
const TOTAL = 5;

export function RequestFlow() {
  const [d, setD] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Keep the draft across OTP sign-in and refreshes.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setD({ ...EMPTY, ...JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch {}
  }, [d, hydrated]);

  const update = useCallback((patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch })), []);
  const go = (step: number) => {
    update({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) return <div className="container-page py-20" />;

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        {d.step > 1 ? (
          <button className="btn-ghost -ml-3" onClick={() => go(d.step - 1)}>← Back</button>
        ) : (
          <Link href="/" className="btn-ghost -ml-3">← Home</Link>
        )}
        <span className="text-sm font-medium text-muted">Step {d.step} of {TOTAL}</span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${(d.step / TOTAL) * 100}%` }} />
      </div>

      {d.step === 1 && <StepGroup d={d} update={update} next={() => go(2)} />}
      {d.step === 2 && <StepLocation d={d} update={update} next={() => go(3)} />}
      {d.step === 3 && <StepHospital d={d} update={update} next={() => go(4)} />}
      {d.step === 4 && <StepBanks d={d} next={() => go(5)} />}
      {d.step === 5 && <StepDonors d={d} onDone={() => sessionStorage.removeItem(STORAGE_KEY)} />}
    </div>
  );
}

type StepProps = { d: Draft; update: (p: Partial<Draft>) => void; next: () => void };

function StepGroup({ d, update, next }: StepProps) {
  const t = useT();
  return (
    <section>
      <h1 className="text-3xl font-extrabold sm:text-4xl">What is the patient&apos;s blood group?</h1>
      <p className="mt-2 text-muted">We&apos;ll search banks and donors with a matching or compatible group.</p>
      <div className="mt-8">
        <BloodGroupPicker value={d.group} onChange={(group) => update({ group })} size="lg" showRarity />
      </div>
      {d.group && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          A <strong>{d.group}</strong> patient can receive from: <strong>{CAN_RECEIVE_FROM[d.group as BloodGroup].join(", ")}</strong>
        </p>
      )}
      <button className="btn-primary mt-8 w-full py-4 text-base" disabled={!d.group} onClick={next}>{t("common.continue")}</button>
      <details className="card mt-10 p-5">
        <summary className="cursor-pointer font-semibold">Blood type compatibility chart</summary>
        <div className="mt-4"><CompatibilityTable highlight={d.group} /></div>
      </details>
    </section>
  );
}

function StepLocation({ d, update, next }: StepProps) {
  const t = useT();
  const { locate, loading, error } = useGeolocation();
  const [busy, setBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const locateNow = useCallback(async () => {
    const loc = await locate();
    if (loc) update({ lat: loc.lat, lng: loc.lng, state: loc.state ?? "", district: loc.district ?? "", autoLocated: true });
  }, [locate, update]);

  useEffect(() => {
    if (d.lat == null) void locateNow();
    // Only try automatically on first arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirm() {
    if (d.lat == null || !d.autoLocated) {
      setBusy(true);
      const c = await geocodeDistrict(d.state, d.district);
      setBusy(false);
      if (!c) return setGeoError("We couldn't find that district on the map. Try using your current location.");
      update({ lat: c.lat, lng: c.lng });
    }
    next();
  }

  return (
    <section>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Where is the patient?</h1>
      <p className="mt-2 text-muted">We use this only to find blood banks and donors within range. It isn&apos;t stored unless you raise a request.</p>
      <button onClick={locateNow} disabled={loading} className="card mt-8 flex w-full items-center gap-4 p-4 text-left hover:border-brand-300">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="7" /></svg>
        </span>
        <span>
          <span className="block font-semibold">{loading ? "Finding your location…" : t("common.useLocation")}</span>
          <span className="text-sm text-muted">Faster and more accurate than picking manually</span>
        </span>
      </button>
      {(error || geoError) && <p className="mt-3 text-sm text-warn">{error || geoError}</p>}
      {d.autoLocated && d.state && <p className="mt-3 text-sm text-ok">We&apos;ve filled in your state and district from your location. Change them if the patient is somewhere else.</p>}
      <div className="mt-6">
        <StateDistrictSelect
          state={d.state}
          district={d.district}
          onChange={(state, district) => update({ state, district, autoLocated: false, lat: null, lng: null })}
        />
      </div>
      <button className="btn-primary mt-8 w-full py-4 text-base" disabled={!d.state || !d.district || busy} onClick={confirm}>
        {busy ? "Locating district…" : t("common.confirm")}
      </button>
    </section>
  );
}

function StepHospital({ d, update, next }: StepProps) {
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    api<{ banks: Bank[] }>(`/api/banks?lat=${d.lat}&lng=${d.lng}&radius=50&limit=60`).then((r) => setBanks(r.banks)).catch(() => setBanks([]));
  }, [d.lat, d.lng]);

  const filtered = useMemo(() => (banks ?? []).filter((b) => b.name.toLowerCase().includes(q.toLowerCase())).slice(0, 12), [banks, q]);

  return (
    <section>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Which hospital is the patient at?</h1>
      <p className="mt-2 text-muted">Donors will see this so they know where to go.</p>
      <input className="input mt-6" placeholder="Search hospital by name" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 space-y-2" role="radiogroup">
        {banks == null && <div className="h-40 animate-pulse rounded-2xl bg-line/60" />}
        {filtered.map((b) => {
          const active = d.bankId === b.id;
          return (
            <button
              key={b.id}
              role="radio"
              aria-checked={active}
              onClick={() => { update({ bankId: b.id, hospital: b.name }); setCustom(false); }}
              className={`card flex w-full items-start justify-between gap-3 p-4 text-left ${active ? "border-brand-600 ring-4 ring-brand-100" : "hover:border-brand-300"}`}
            >
              <span>
                <span className="block font-semibold">{b.name}</span>
                <span className="text-sm text-muted">{b.address}</span>
              </span>
              <span className="shrink-0 text-sm text-muted">{b.distanceKm} km</span>
            </button>
          );
        })}
        <button
          onClick={() => { setCustom(true); update({ bankId: null, hospital: q }); }}
          className={`card w-full p-4 text-left text-sm font-semibold ${custom ? "border-brand-600" : "text-brand-700 hover:border-brand-300"}`}
        >
          + The hospital isn&apos;t listed
        </button>
        {custom && (
          <input className="input" autoFocus placeholder="Hospital name and area" value={d.hospital} onChange={(e) => update({ hospital: e.target.value })} />
        )}
      </div>
      <button className="btn-primary mt-8 w-full py-4 text-base" disabled={d.hospital.trim().length < 2} onClick={next}>Confirm</button>
    </section>
  );
}

const FILTERS = [
  ["best", "Best match"],
  ["has", "Has stock"],
  ["none", "No stock"],
] as const;

function StepBanks({ d, next }: { d: Draft; next: () => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("best");
  const [radius, setRadius] = useState(25);
  const [data, setData] = useState<{ total: number; banks: Bank[] } | null>(null);

  useEffect(() => {
    setData(null);
    const g = encodeURIComponent(d.group!);
    api<{ total: number; banks: Bank[] }>(`/api/banks?group=${g}&compatible=1&lat=${d.lat}&lng=${d.lng}&radius=${radius}&stock=${filter}&limit=100`)
      .then(setData)
      .catch(() => setData({ total: 0, banks: [] }));
  }, [d.group, d.lat, d.lng, radius, filter]);

  return (
    <section>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Blood banks near the patient</h1>
      <p className="mt-2 text-muted">Showing <strong>{d.group}</strong> and compatible groups. Call ahead to confirm stock before you travel.</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? "chip-active" : ""}`}>{label}</button>
        ))}
        <span className="mx-1 h-6 w-px bg-line" />
        {[25, 50, 100].map((r) => (
          <button key={r} onClick={() => setRadius(r)} className={`chip ${radius === r ? "chip-active" : ""}`}>{r} km</button>
        ))}
      </div>
      <div className="mt-5">
        <Map
          center={{ lat: d.lat!, lng: d.lng! }}
          zoom={radius > 50 ? 8 : radius > 25 ? 9 : 10}
          you={{ lat: d.lat!, lng: d.lng! }}
          radiusKm={radius}
          pins={(data?.banks ?? []).slice(0, 60).map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, label: b.name, sub: `${b.stockPublished ? `${b.units} units` : "Stock not published"} · ${b.distanceKm} km`, tone: b.units ? "brand" : "muted" }))}
        />
      </div>
      <p className="mt-5 text-sm font-medium">{data ? `${data.total} bank(s) within ${radius} km` : "Searching…"}</p>
      <div className="mt-3 space-y-3">
        {data == null && [0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-line/60" />)}
        {data?.banks.map((b) => <BankCard key={b.id} bank={b} />)}
        {data && data.total === 0 && (
          <div className="card p-6 text-center text-muted">No banks found in this range. Try a wider radius, or ask donors directly below.</div>
        )}
      </div>
      <div className="mt-8 rounded-2xl bg-ink p-5 text-white shadow-2xl sm:sticky sm:bottom-4">
        <p className="font-semibold">Banks not answering, or out of stock?</p>
        <p className="mt-1 text-sm text-white/70">We&apos;ll alert compatible registered donors near the patient.</p>
        <button className="btn mt-4 w-full bg-white text-ink hover:bg-white/90" onClick={next}>Search donors near you</button>
      </div>
    </section>
  );
}

function StepDonors({ d, onDone }: { d: Draft; onDone: () => void }) {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [me, setMe] = useState<{ phone: string | null } | null | undefined>(undefined);
  const [form, setForm] = useState({ patientName: "", units: 1, urgency: "URGENT", contactPhone: "", note: "", recurring: false, intervalDays: 21 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ count: number }>(`/api/donors/count?group=${encodeURIComponent(d.group!)}&lat=${d.lat}&lng=${d.lng}&radius=100`).then((r) => setCount(r.count)).catch(() => setCount(0));
    api<{ user: { phone: string | null } | null }>("/api/me").then((r) => {
      setMe(r.user);
      if (r.user?.phone) setForm((f) => ({ ...f, contactPhone: f.contactPhone || r.user!.phone! }));
    });
  }, [d.group, d.lat, d.lng]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ request: { id: string } }>("/api/requests", {
        body: {
          ...form,
          intervalDays: form.recurring ? form.intervalDays : null,
          note: form.note || undefined,
          bloodGroup: d.group,
          hospitalName: d.hospital,
          bankId: d.bankId,
          state: d.state,
          district: d.district,
          lat: d.lat,
          lng: d.lng,
        },
      });
      onDone();
      router.push(`/request/${r.request.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        {count == null ? "Looking for donors…" : count > 0 ? `We found ${count} donor${count === 1 ? "" : "s"}` : "Let's reach out to donors"}
      </h1>
      <p className="mt-2 text-muted">
        {count === 0
          ? "No compatible donors are registered close by yet. Raise the request anyway: new donors who sign up nearby will be alerted, and the search keeps widening."
          : `Registered ${d.group} and compatible donors within 100 km. We'll alert the closest ones first.`}
      </p>

      {me === undefined ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-line/60" />
      ) : !me ? (
        <div className="card mt-8 p-6">
          <p className="font-semibold">Verify your number to send requests to donors</p>
          <p className="mt-1 mb-4 text-sm text-muted">This keeps requests genuine. Donors who accept will see this number.</p>
          <OtpForm onVerified={(u) => { setMe({ phone: u.phone }); setForm((f) => ({ ...f, contactPhone: u.phone ?? "" })); }} />
        </div>
      ) : (
        <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
          <div className="rounded-xl bg-paper p-4 text-sm">
            <p><span className="text-muted">Blood group:</span> <strong>{d.group}</strong></p>
            <p className="mt-1"><span className="text-muted">Hospital:</span> <strong>{d.hospital}</strong>, {d.district}, {d.state}</p>
          </div>
          <label className="block">
            <span className="label">Patient&apos;s name</span>
            <input className="input" required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Units needed</span>
              <input className="input" type="number" min={1} max={20} required value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="label">Contact number for donors</span>
              <input className="input" type="tel" inputMode="numeric" required value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
            </label>
          </div>
          <fieldset>
            <legend className="label">How urgent is it?</legend>
            <div className="grid grid-cols-3 gap-2">
              {[["CRITICAL", "Critical", "Within hours"], ["URGENT", "Urgent", "Within a day"], ["PLANNED", "Planned", "Surgery / scheduled"]].map(([v, l, s]) => (
                <button type="button" key={v} onClick={() => setForm({ ...form, urgency: v })} className={`rounded-xl border p-3 text-left ${form.urgency === v ? "border-brand-600 bg-brand-50" : "border-line"}`}>
                  <span className="block text-sm font-bold">{l}</span>
                  <span className="text-xs text-muted">{s}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="label">Anything donors should know? <span className="font-normal text-muted">(optional)</span></span>
            <textarea className="input" rows={3} maxLength={500} placeholder="e.g. ward number, who to ask for at the hospital" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-line p-4">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-600" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
            <span>
              <span className="block text-sm font-semibold">This is a recurring need (e.g. thalassemia)</span>
              <span className="text-sm text-muted">Donors will see that the patient needs blood regularly.</span>
              {form.recurring && (
                <span className="mt-3 flex items-center gap-2 text-sm">
                  Every
                  <input type="number" min={7} max={90} className="input w-20 py-2" value={form.intervalDays} onChange={(e) => setForm({ ...form, intervalDays: Number(e.target.value) })} />
                  days
                </span>
              )}
            </span>
          </label>
          {error && <p className="text-sm text-brand-700" role="alert">{error}</p>}
          <button className="btn-primary w-full py-4 text-base" disabled={busy}>{busy ? "Sending…" : "Send request to donors"}</button>
          <p className="text-center text-xs text-muted">
            Donors see the blood group, units, hospital and urgency. Their number is shared with you only once they accept.
          </p>
        </form>
      )}
    </section>
  );
}
