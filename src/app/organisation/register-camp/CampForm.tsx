"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LocationFields, type Loc } from "@/components/org/LocationFields";
import { api } from "@/lib/client";

type Camp = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  district: string;
  lat: number | null;
  lng: number | null;
  date: string;
  startTime: string;
  endTime: string;
  organisedBy: string;
  conductedBy: string;
  contactPhone: string;
  expectedUnits: number | null;
};

export function CampForm({ needsOrg, camp }: { needsOrg: boolean; camp: Camp | null }) {
  const router = useRouter();
  const [f, setF] = useState({
    orgName: "",
    name: camp?.name ?? "",
    address: camp?.address ?? "",
    city: camp?.city ?? "",
    date: camp?.date.slice(0, 10) ?? "",
    startTime: camp?.startTime ?? "09:00",
    endTime: camp?.endTime ?? "14:00",
    organisedBy: camp?.organisedBy ?? "",
    conductedBy: camp?.conductedBy ?? "",
    contactPhone: camp?.contactPhone ?? "",
    expectedUnits: camp?.expectedUnits?.toString() ?? "",
  });
  const [loc, setLoc] = useState<Loc>({ state: camp?.state ?? "", district: camp?.district ?? "", lat: camp?.lat ?? null, lng: camp?.lng ?? null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onLoc = useCallback((l: Loc) => setLoc(l), []);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...f, ...loc, expectedUnits: f.expectedUnits ? Number(f.expectedUnits) : null, orgName: needsOrg ? f.orgName : undefined };
      if (camp) await api(`/api/org/camps/${camp.id}`, { method: "PATCH", body });
      else await api("/api/org/camps", { body });
      router.push("/organisation");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      {needsOrg && (
        <label className="block">
          <span className="label">Organisation name</span>
          <input className="input" required placeholder="e.g. Rotary Club of Pune" value={f.orgName} onChange={set("orgName")} />
        </label>
      )}
      <label className="block"><span className="label">Camp name</span><input className="input" required placeholder="e.g. Founders' Day Blood Donation Camp" value={f.name} onChange={set("name")} /></label>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="block"><span className="label">Venue</span><input className="input" required placeholder="Hall, building, street" value={f.address} onChange={set("address")} /></label>
        <label className="block"><span className="label">City / town</span><input className="input" required value={f.city} onChange={set("city")} /></label>
      </div>
      <LocationFields value={loc} onChange={onLoc} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block"><span className="label">Date</span><input className="input" type="date" required min={camp ? undefined : today} value={f.date} onChange={set("date")} /></label>
        <label className="block"><span className="label">Starts</span><input className="input" type="time" required value={f.startTime} onChange={set("startTime")} /></label>
        <label className="block"><span className="label">Ends</span><input className="input" type="time" required value={f.endTime} onChange={set("endTime")} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">Organised by</span><input className="input" required placeholder="Club, company, college…" value={f.organisedBy} onChange={set("organisedBy")} /></label>
        <label className="block"><span className="label">Conducted by (blood bank)</span><input className="input" required value={f.conductedBy} onChange={set("conductedBy")} /></label>
        <label className="block"><span className="label">Contact phone</span><input className="input" type="tel" required value={f.contactPhone} onChange={set("contactPhone")} /></label>
        <label className="block"><span className="label">Target units <span className="font-normal text-muted">(optional)</span></span><input className="input" type="number" min={1} value={f.expectedUnits} onChange={set("expectedUnits")} /></label>
      </div>
      {error && <p className="text-sm text-brand-700" role="alert">{error}</p>}
      <button className="btn-primary w-full py-4" disabled={busy}>{busy ? "Saving…" : camp ? "Save changes" : "Register camp"}</button>
    </form>
  );
}
