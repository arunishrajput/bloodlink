"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BloodGroupPicker } from "@/components/BloodGroupPicker";
import { StateDistrictSelect } from "@/components/StateDistrictSelect";
import { Map } from "@/components/Map";
import { BankCard, type Bank } from "@/components/bank/BankCard";
import { useGeolocation } from "@/components/useLocation";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/client";

type Mode = { kind: "point"; lat: number; lng: number } | { kind: "area" };

export function Directory() {
  const [group, setGroup] = useState<string | null>(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [hospital, setHospital] = useState("");
  const [radius, setRadius] = useState(25);
  const [mode, setMode] = useState<Mode>({ kind: "area" });
  const [data, setData] = useState<{ total: number; banks: Bank[] } | null>(null);
  const [help, setHelp] = useState(false);
  const { locate, loading, error } = useGeolocation();

  async function locateNow() {
    const loc = await locate();
    if (!loc) return;
    setMode({ kind: "point", lat: loc.lat, lng: loc.lng });
    setState(loc.state ?? "");
    setDistrict(loc.district ?? "");
  }

  useEffect(() => {
    void locateNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode.kind === "area" && !state) {
      setData(null);
      return;
    }
    const p = new URLSearchParams({ limit: "200" });
    if (group) {
      p.set("group", group);
      p.set("compatible", "1");
    }
    if (hospital.trim()) p.set("q", hospital.trim());
    if (mode.kind === "point") {
      p.set("lat", String(mode.lat));
      p.set("lng", String(mode.lng));
      p.set("radius", String(radius));
      p.set("stock", "best");
    } else {
      p.set("state", state);
      if (district) p.set("district", district);
    }
    const ctrl = setTimeout(() => {
      setData(null);
      api<{ total: number; banks: Bank[] }>(`/api/banks?${p}`).then(setData).catch(() => setData({ total: 0, banks: [] }));
    }, 250);
    return () => clearTimeout(ctrl);
  }, [group, state, district, hospital, radius, mode]);

  const center = mode.kind === "point" ? { lat: mode.lat, lng: mode.lng } : data?.banks[0] ? { lat: data.banks[0].lat, lng: data.banks[0].lng } : { lat: 22.5, lng: 79 };

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-6 p-5">
          <div>
            <p className="label">Filter by blood group</p>
            <BloodGroupPicker value={group} onChange={(g) => setGroup(group === g ? null : g)} />
          </div>
          <StateDistrictSelect
            state={state}
            district={district}
            compact
            onChange={(s, d) => { setState(s); setDistrict(d); setMode({ kind: "area" }); }}
          />
          <label className="block">
            <span className="label">Hospital or bank name <span className="font-normal text-muted">(optional)</span></span>
            <div className="relative">
              <input className="input pr-10" placeholder="e.g. Civil Hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} />
              {hospital && (
                <button className="absolute top-1/2 right-3 -translate-y-1/2 text-muted" onClick={() => setHospital("")} aria-label="Clear hospital">×</button>
              )}
            </div>
          </label>
          <button onClick={locateNow} disabled={loading} className={`btn w-full ${mode.kind === "point" ? "bg-green-50 text-ok" : "btn-secondary"}`}>
            {loading ? "Locating…" : mode.kind === "point" ? "✓ Using your location" : "Use my current location"}
          </button>
          {error && <p className="text-sm text-warn">{error}</p>}
        </div>
        <button className="text-sm font-medium text-brand-700 underline" onClick={() => setHelp(true)}>How this search works</button>
      </aside>

      <section>
        {mode.kind === "point" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {[25, 50, 100].map((r) => (
              <button key={r} onClick={() => setRadius(r)} className={`chip ${radius === r ? "chip-active" : ""}`}>{r} km</button>
            ))}
          </div>
        )}
        {mode.kind === "area" && !state ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold">Where should we look?</p>
            <p className="mt-2 text-muted">Allow location access, or pick a state and district to see blood banks and their stock.</p>
          </div>
        ) : (
          <>
            <Map
              center={center}
              zoom={mode.kind === "point" ? (radius > 50 ? 8 : radius > 25 ? 9 : 10) : district ? 10 : 7}
              you={mode.kind === "point" ? { lat: mode.lat, lng: mode.lng } : null}
              radiusKm={mode.kind === "point" ? radius : undefined}
              className="h-80"
              pins={(data?.banks ?? []).slice(0, 100).map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, label: b.name, sub: b.stockPublished ? `${b.units} units in stock` : "Stock not published", tone: b.units ? "brand" : "muted" }))}
            />
            <p className="mt-5 text-sm font-medium" aria-live="polite">
              {data ? `${data.total} bank(s) ${mode.kind === "point" ? "near you" : `in ${district || state}`}` : "Searching…"}
            </p>
            <div className="mt-3 grid gap-3">
              {data == null && [0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-line/60" />)}
              {data?.banks.map((b) => <BankCard key={b.id} bank={b} showGroups={!!group} />)}
              {data && data.total === 0 && <div className="card p-8 text-center text-muted">No blood banks match these filters. Try a wider radius or another district.</div>}
            </div>
          </>
        )}
      </section>

      <Modal open={help} onClose={() => setHelp(false)} title="How this search works">
        <div className="space-y-3 text-sm text-muted">
          <p>Pick a blood group and confirm your location. We check the stock each blood bank has published and sort by distance, so the closest bank with matching stock is at the top.</p>
          <p>When you pick a group, we also count stock of every compatible group: an A+ patient can receive A+, A−, O+ and O−.</p>
          <p>Stock is updated by the blood banks themselves, so always call to confirm before you travel. If nothing turns up nearby, use <Link className="text-brand-700 underline" href="/request">Find Blood</Link> to alert registered donors directly.</p>
        </div>
      </Modal>
    </div>
  );
}
