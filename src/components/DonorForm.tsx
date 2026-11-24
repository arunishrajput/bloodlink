"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BloodGroupPicker } from "./BloodGroupPicker";
import { StateDistrictSelect } from "./StateDistrictSelect";
import { OtpForm } from "./OtpForm";
import { Map } from "./Map";
import { geocodeDistrict, reverseGeocode, useGeolocation } from "./useLocation";
import { api } from "@/lib/client";

export type DonorValues = {
  name: string;
  dob: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER";
  bloodGroup: string | null;
  weightKg: string;
  heightCm: string;
  state: string;
  district: string;
  lat: number | null;
  lng: number | null;
  contactCall: boolean;
  contactSms: boolean;
  contactWhatsapp: boolean;
  radiusKm: number;
};

const ELIGIBILITY = [
  "No doctor has told me I should not donate blood",
  "I do not take regular medicine for a long-term condition",
  "In the last 12 months I have not had surgery, a blood transfusion, a tattoo, or a piercing",
];
const RADII = [10, 25, 50];

const EMPTY: DonorValues = {
  name: "",
  dob: "",
  gender: "",
  bloodGroup: null,
  weightKg: "",
  heightCm: "",
  state: "",
  district: "",
  lat: null,
  lng: null,
  contactCall: true,
  contactSms: false,
  contactWhatsapp: false,
  radiusKm: 10,
};

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <h2 className="flex items-center gap-3 text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${active ? "border-brand-600 bg-brand-50" : "border-line hover:border-brand-300"}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-card"}`}>
        {active && <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" /></svg>}
      </span>
      <span>{children}</span>
    </button>
  );
}

export function DonorForm({
  mode,
  initial,
  verifiedPhone,
  onSaved,
}: {
  mode: "register" | "edit";
  initial?: Partial<DonorValues>;
  verifiedPhone: string | null;
  onSaved: () => void;
}) {
  const [v, setV] = useState<DonorValues>({ ...EMPTY, ...initial });
  const [phone, setPhone] = useState(verifiedPhone);
  const [elig, setElig] = useState([false, false, false]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locate, loading, error: geoError } = useGeolocation();
  const set = (patch: Partial<DonorValues>) => setV((x) => ({ ...x, ...patch }));

  async function useGps() {
    const loc = await locate();
    if (loc) set({ lat: loc.lat, lng: loc.lng, state: loc.state ?? v.state, district: loc.district ?? v.district });
  }

  // Picking a district by hand moves the map pin to that district.
  useEffect(() => {
    if (!v.state || !v.district || v.lat != null) return;
    geocodeDistrict(v.state, v.district).then((c) => c && set({ lat: c.lat, lng: c.lng }));
  }, [v.state, v.district, v.lat]);

  async function onPick(lat: number, lng: number) {
    set({ lat, lng });
    const m = await reverseGeocode(lat, lng);
    if (m.state && m.district) set({ state: m.state, district: m.district });
  }

  const missing = [
    mode === "register" && !phone && "Verify your number",
    v.name.trim().length < 2 && "Add your name",
    !v.dob && "Add your date of birth",
    !v.gender && "Select a gender",
    !v.bloodGroup && "Select your blood group",
    (!v.district || v.lat == null) && "Add your location",
    mode === "register" && !elig.every(Boolean) && "Confirm the eligibility statements",
    !(v.contactCall || v.contactSms || v.contactWhatsapp) && "Pick how requesters can reach you",
    mode === "register" && !consent && "Agree to share your contact details",
  ].filter(Boolean) as string[];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (missing.length) return;
    setBusy(true);
    setError(null);
    const payload = {
      name: v.name,
      dob: v.dob,
      gender: v.gender,
      bloodGroup: v.bloodGroup,
      weightKg: v.weightKg ? Number(v.weightKg) : null,
      heightCm: v.heightCm ? Number(v.heightCm) : null,
      state: v.state,
      district: v.district,
      lat: v.lat,
      lng: v.lng,
      contactCall: v.contactCall,
      contactSms: v.contactSms,
      contactWhatsapp: v.contactWhatsapp,
      radiusKm: v.radiusKm,
    };
    try {
      if (mode === "register") await api("/api/donor", { body: { ...payload, eligibility: elig, consent } });
      else await api("/api/donor", { method: "PATCH", body: payload });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const maxDob = new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().slice(0, 10);
  const minDob = new Date(Date.now() - 65 * 365.25 * 86400000).toISOString().slice(0, 10);
  let n = 0;

  return (
    <div className="space-y-5">
      {mode === "register" && (
        <Section n={++n} title="Verify your number">
          {phone ? (
            <p className="flex items-center gap-2 text-sm font-medium text-ok">✓ +91 {phone} verified</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">We only use your number to reach you when someone nearby needs your blood group, and to check it&apos;s really you.</p>
              <OtpForm onVerified={(u) => { if (u.isDonor) window.location.href = "/profile"; setPhone(u.phone); }} />
            </>
          )}
        </Section>
      )}

      <form onSubmit={submit} className="space-y-5">
      <Section n={++n} title="About you">
        <div className="space-y-5">
          <label className="block">
            <span className="label">Full name</span>
            <input className="input" autoComplete="name" placeholder="e.g. Priya Sharma" value={v.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Date of birth</span>
              <input className="input" type="date" min={minDob} max={maxDob} value={v.dob} onChange={(e) => set({ dob: e.target.value })} />
            </label>
            <fieldset>
              <legend className="label">Gender</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                  <button type="button" key={g} onClick={() => set({ gender: g })} className={`chip justify-center py-3 ${v.gender === g ? "chip-active" : ""}`}>
                    {g[0] + g.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div>
            <p className="label">Blood group</p>
            <BloodGroupPicker value={v.bloodGroup} onChange={(bloodGroup) => set({ bloodGroup })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="label">Weight (kg)</span>
              <input className="input" type="number" min={30} max={250} placeholder="e.g. 65" value={v.weightKg} onChange={(e) => set({ weightKg: e.target.value })} />
            </label>
            <label className="block">
              <span className="label">Height (cm)</span>
              <input className="input" type="number" min={100} max={250} placeholder="e.g. 170" value={v.heightCm} onChange={(e) => set({ heightCm: e.target.value })} />
            </label>
          </div>
          <p className="-mt-2 text-xs text-muted">Approximate is fine. You need to weigh at least 45 kg to donate.</p>
        </div>
      </Section>

      <Section n={++n} title="Where you're based">
        <button type="button" onClick={useGps} disabled={loading} className="btn-secondary w-full">
          {loading ? "Finding your location…" : "Use my current location"}
        </button>
        {geoError && <p className="mt-2 text-sm text-warn">{geoError}</p>}
        <div className="mt-4">
          <StateDistrictSelect state={v.state} district={v.district} onChange={(state, district) => set({ state, district, lat: null, lng: null })} />
        </div>
        {v.lat != null && v.lng != null && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted">Fine-tune on the map: drag the pin or tap to set your home location. Only your approximate distance is ever shown to requesters.</p>
            <Map center={{ lat: v.lat, lng: v.lng }} zoom={12} you={{ lat: v.lat, lng: v.lng }} editable onPick={onPick} className="h-64" />
          </div>
        )}
      </Section>

      {mode === "register" && (
        <Section n={++n} title="Eligibility check">
          <p className="mb-4 text-sm text-muted">Standard donor screening. Please answer honestly; it keeps every donation safe.</p>
          <div className="space-y-2">
            {ELIGIBILITY.map((label, i) => (
              <Toggle key={label} active={elig[i]} onClick={() => setElig(elig.map((x, j) => (j === i ? !x : x)))}>{label}</Toggle>
            ))}
          </div>
        </Section>
      )}

      <Section n={++n} title="Availability & consent">
        <p className="label">How can requesters reach you?</p>
        <div className="grid grid-cols-3 gap-2">
          {([["contactCall", "Call"], ["contactSms", "SMS"], ["contactWhatsapp", "WhatsApp"]] as const).map(([k, l]) => (
            <button type="button" key={k} onClick={() => set({ [k]: !v[k] })} aria-pressed={v[k]} className={`chip justify-center py-3 ${v[k] ? "chip-active" : ""}`}>{l}</button>
          ))}
        </div>
        <p className="label mt-6">Match me with requests within</p>
        <div className="grid grid-cols-3 gap-2">
          {RADII.map((r) => (
            <button type="button" key={r} onClick={() => set({ radiusKm: r })} className={`chip justify-center py-3 ${v.radiusKm === r ? "chip-active" : ""}`}>{r} km</button>
          ))}
        </div>
        {mode === "register" && (
          <div className="mt-6">
            <Toggle active={consent} onClick={() => setConsent(!consent)}>
              I agree BloodLink can share my name, blood group, approximate distance, and the contact method(s) above with a requester <strong>only after I accept their request</strong>, and I accept the{" "}
              <Link href="/terms" className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Terms &amp; Conditions</Link> and{" "}
              <Link href="/privacy" className="text-brand-700 underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
            </Toggle>
          </div>
        )}
      </Section>

      {missing.length > 0 && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-sm font-semibold">Before you submit</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {missing.map((m) => <li key={m}>○ {m}</li>)}
          </ul>
        </div>
      )}
      {error && <p className="text-sm text-brand-700" role="alert">{error}</p>}
      <button className="btn-primary w-full py-4 text-base" disabled={busy || missing.length > 0}>
        {busy ? "Saving…" : mode === "register" ? "Confirm & register" : "Save changes"}
      </button>
      </form>
    </div>
  );
}
