import statesData from "@/data/india-states.json";

export const STATES: Record<string, string[]> = statesData;
export const STATE_NAMES = Object.keys(STATES);

export function isValidLocation(state: string, district: string) {
  return STATES[state]?.includes(district) ?? false;
}

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Lat/lng bounding box that fully contains a circle of radiusKm — used to prefilter in SQL. */
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.max(Math.cos(rad(lat)), 0.01));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng };
}

/** Best-effort match of a free-text state/district (e.g. from reverse geocoding) to our list. */
export function matchStateDistrict(stateText?: string, districtText?: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "").replace(/district$/, "");
  const state = stateText ? STATE_NAMES.find((s) => norm(s) === norm(stateText)) : undefined;
  if (!state || !districtText) return { state, district: undefined };
  const d = norm(districtText);
  const district = STATES[state].find((x) => norm(x) === d) ?? STATES[state].find((x) => norm(x).includes(d) || d.includes(norm(x)));
  return { state, district };
}
