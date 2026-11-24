"use client";

import { useEffect } from "react";
import { StateDistrictSelect } from "../StateDistrictSelect";
import { Map } from "../Map";
import { geocodeDistrict, reverseGeocode, useGeolocation } from "../useLocation";

export type Loc = { state: string; district: string; lat: number | null; lng: number | null };

/** State/district + GPS + draggable map pin, shared by the bank and camp forms. */
export function LocationFields({ value, onChange }: { value: Loc; onChange: (l: Loc) => void }) {
  const { locate, loading, error } = useGeolocation();

  useEffect(() => {
    if (!value.state || !value.district || value.lat != null) return;
    geocodeDistrict(value.state, value.district).then((c) => c && onChange({ ...value, ...c }));
  }, [value, onChange]);

  async function gps() {
    const l = await locate();
    if (l) onChange({ state: l.state ?? value.state, district: l.district ?? value.district, lat: l.lat, lng: l.lng });
  }

  async function pick(lat: number, lng: number) {
    const m = await reverseGeocode(lat, lng);
    onChange({ state: m.state ?? value.state, district: m.district ?? value.district, lat, lng });
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={gps} disabled={loading} className="btn-secondary w-full">{loading ? "Locating…" : "Use my current location"}</button>
      {error && <p className="text-sm text-warn">{error}</p>}
      <StateDistrictSelect state={value.state} district={value.district} onChange={(state, district) => onChange({ state, district, lat: null, lng: null })} />
      {value.lat != null && value.lng != null && (
        <>
          <p className="text-sm text-muted">Drag the pin or tap the map to mark the exact spot.</p>
          <Map center={{ lat: value.lat, lng: value.lng }} zoom={13} you={{ lat: value.lat, lng: value.lng }} editable onPick={pick} className="h-64" />
        </>
      )}
    </div>
  );
}
