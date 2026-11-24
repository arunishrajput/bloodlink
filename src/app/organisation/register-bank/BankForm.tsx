"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LocationFields, type Loc } from "@/components/org/LocationFields";
import { api } from "@/lib/client";

type Bank = {
  id: string;
  name: string;
  category: string;
  address: string;
  state: string;
  district: string;
  pincode: string | null;
  lat: number;
  lng: number;
  phone: string;
  email: string | null;
  licenseNo: string | null;
  hasComponents: boolean;
};

export function BankForm({ needsOrg, bank }: { needsOrg: boolean; bank: Bank | null }) {
  const router = useRouter();
  const [f, setF] = useState({
    orgName: "",
    name: bank?.name ?? "",
    category: bank?.category ?? "GOVERNMENT",
    address: bank?.address ?? "",
    pincode: bank?.pincode ?? "",
    phone: bank?.phone ?? "",
    email: bank?.email ?? "",
    licenseNo: bank?.licenseNo ?? "",
    hasComponents: bank?.hasComponents ?? false,
  });
  const [loc, setLoc] = useState<Loc>({ state: bank?.state ?? "", district: bank?.district ?? "", lat: bank?.lat ?? null, lng: bank?.lng ?? null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onLoc = useCallback((l: Loc) => setLoc(l), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loc.lat == null) return setError("Set the bank's location on the map");
    setBusy(true);
    setError(null);
    try {
      const body = { ...f, ...loc, orgName: needsOrg ? f.orgName : undefined };
      if (bank) await api(`/api/org/banks/${bank.id}`, { method: "PATCH", body });
      else await api("/api/org/banks", { body });
      router.push("/organisation");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      {needsOrg && (
        <label className="block">
          <span className="label">Organisation name</span>
          <input className="input" required placeholder="e.g. City Hospital Trust" value={f.orgName} onChange={(e) => setF({ ...f, orgName: e.target.value })} />
          <span className="mt-1 block text-xs text-muted">Your team, banks and camps will be grouped under this name.</span>
        </label>
      )}
      <label className="block">
        <span className="label">Blood bank name</span>
        <input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">Category</span>
        <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option value="GOVERNMENT">Government</option>
          <option value="PRIVATE">Private</option>
          <option value="CHARITABLE">Charitable / Voluntary</option>
          <option value="RED_CROSS">Red Cross</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Full address</span>
        <textarea className="input" rows={2} required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      </label>
      <LocationFields value={loc} onChange={onLoc} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">PIN code</span><input className="input" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, "") })} /></label>
        <label className="block"><span className="label">Phone (shown to the public)</span><input className="input" type="tel" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <label className="block"><span className="label">Email <span className="font-normal text-muted">(optional)</span></span><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block"><span className="label">Licence number</span><input className="input" value={f.licenseNo} onChange={(e) => setF({ ...f, licenseNo: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={f.hasComponents} onChange={(e) => setF({ ...f, hasComponents: e.target.checked })} />
        This bank has component-separation facilities (red cells, plasma, platelets)
      </label>
      {error && <p className="text-sm text-brand-700" role="alert">{error}</p>}
      <button className="btn-primary w-full py-4" disabled={busy}>{busy ? "Saving…" : bank ? "Save changes" : "Register blood bank"}</button>
      {!bank && <p className="text-center text-xs text-muted">You can publish stock for each blood group from your dashboard once the bank is registered.</p>}
    </form>
  );
}
