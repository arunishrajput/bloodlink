"use client";

import { useCallback, useState } from "react";
import { matchStateDistrict } from "@/lib/geo";

export type Located = { lat: number; lng: number; state?: string; district?: string };

/** Reverse-geocodes a point to one of our state/district names (free, keyless BigDataCloud endpoint). */
export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    const j = await res.json();
    const admin: { name: string; adminLevel?: number }[] = j.localityInfo?.administrative ?? [];
    const candidates = [...admin.filter((a) => a.adminLevel === 5).map((a) => a.name), j.city, j.locality];
    for (const c of candidates) {
      const m = matchStateDistrict(j.principalSubdivision, c);
      if (m.district) return m;
    }
    return matchStateDistrict(j.principalSubdivision);
  } catch {
    return { state: undefined, district: undefined };
  }
}

/** Forward-geocodes a district to a map centre via OpenStreetMap Nominatim. */
export async function geocodeDistrict(state: string, district: string) {
  try {
    const q = encodeURIComponent(`${district.replace(/\s*\(.*\)/, "")}, ${state}, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, { headers: { "Accept-Language": "en" } });
    const [hit] = await res.json();
    return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
  } catch {
    return null;
  }
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(
    () =>
      new Promise<Located | null>((resolve) => {
        if (!("geolocation" in navigator)) {
          setError("Location isn't available on this device. Pick your state and district instead.");
          return resolve(null);
        }
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            const m = await reverseGeocode(lat, lng);
            setLoading(false);
            resolve({ lat, lng, state: m.state, district: m.district });
          },
          (err) => {
            setLoading(false);
            setError(err.code === 1 ? "Location permission was denied. Pick your state and district instead." : "We couldn't get your location. Try again or pick manually.");
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
        );
      }),
    [],
  );

  return { locate, loading, error };
}
