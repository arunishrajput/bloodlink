import type { BankCategory, PrismaClient } from "@prisma/client";
import statesData from "../../src/data/india-states.json";

const STATES = statesData as Record<string, string[]>;
const STATE_NAMES = Object.keys(STATES);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "").replace(/district$/, "");

const STATE_ALIASES: Record<string, string> = {
  damananddiu: "Dadra and Nagar Haveli and Daman and Diu",
  dadraandnagarhaveli: "Dadra and Nagar Haveli and Daman and Diu",
  nctofdelhi: "Delhi",
  orissa: "Odisha",
  pondicherry: "Puducherry",
};

export type BankRow = {
  externalId: string;
  name: string;
  category: BankCategory;
  address: string;
  state: string;
  district: string;
  pincode: string | null;
  lat: number;
  lng: number;
  phone: string;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  hasComponents: boolean;
  verified: boolean;
};

type OsmElement = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

const OVERPASS_QUERY = `[out:json][timeout:120];
area["ISO3166-1"="IN"][admin_level=2]->.a;
(nwr["healthcare"="blood_donation"](area.a);nwr["amenity"="blood_bank"](area.a);nwr["healthcare"="blood_bank"](area.a););
out center tags;`;

const OVERPASS_HOSTS = ["https://overpass-api.de", "https://overpass.private.coffee", "https://overpass.kumi.systems"];

export async function fetchOsmElements(): Promise<OsmElement[]> {
  let lastError = "no response";
  for (let attempt = 0; attempt < 6; attempt++) {
    const host = OVERPASS_HOSTS[attempt % OVERPASS_HOSTS.length];
    try {
      const res = await fetch(`${host}/api/interpreter`, {
        method: "POST",
        headers: { "User-Agent": "BloodLinkImporter/1.0", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: OVERPASS_QUERY }),
      });
      if (res.ok) return ((await res.json()) as { elements: OsmElement[] }).elements;
      lastError = `${host} responded ${res.status}`;
    } catch (e) {
      lastError = `${host}: ${(e as Error).message}`;
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error(`Overpass unavailable (${lastError})`);
}

function cleanPhone(raw?: string): string | null {
  if (!raw) return null;
  const first = raw.split(/[;,/]/)[0];
  let digits = first.replace(/\D/g, "").replace(/^(0091|91)(?=\d{10}$)/, "");
  if (digits.length === 11 && digits.startsWith("0") && /^0[6-9]/.test(digits)) digits = digits.slice(1);
  return digits.length >= 8 && digits.length <= 13 ? digits : null;
}

function categorise(t: Record<string, string>): BankCategory {
  const name = (t.name ?? "").toLowerCase();
  if (/red\s*cross/.test(name) || /red\s*cross/.test(t.operator ?? "")) return "RED_CROSS";
  switch (t["operator:type"]) {
    case "government": return "GOVERNMENT";
    case "private": return "PRIVATE";
    case "charity":
    case "ngo":
    case "community": return "CHARITABLE";
  }
  if (/govt|government|district hospital|civil hospital|medical college|aiims|esi\b|sadar/.test(name)) return "GOVERNMENT";
  if (/trust|foundation|society|charit|voluntary|rotary|lions|sewa|seva/.test(name)) return "CHARITABLE";
  return "PRIVATE";
}

function address(t: Record<string, string>, name: string): string {
  if (t["addr:full"]) return t["addr:full"];
  const parts = [t["addr:housenumber"], t["addr:street"], t["addr:suburb"], t["addr:city"], t["addr:postcode"]].filter(Boolean);
  return parts.length ? parts.join(", ") : name;
}

const cap = (s: string | undefined, n: number) => (s ? s.trim().slice(0, n) || null : null);

/** Turns raw OSM elements into rows with a valid state/district, dropping entries we can't place or call. */
export function normalizeElements(elements: OsmElement[]): BankRow[] {
  type Draft = Omit<BankRow, "state" | "district"> & { state?: string; district?: string };
  const drafts: Draft[] = [];
  for (const e of elements) {
    const t = e.tags ?? {};
    const lat = e.lat ?? e.center?.lat;
    const lng = e.lon ?? e.center?.lon;
    const phone = cleanPhone(t["contact:mobile"]) ?? cleanPhone(t["contact:phone"]) ?? cleanPhone(t.phone) ?? cleanPhone(t["phone:mobile"]);
    const name = cap(t.name, 150);
    if (!name || !phone || lat == null || lng == null) continue;
    const state = t["addr:state"] ? STATE_NAMES.find((s) => norm(s) === norm(t["addr:state"])) ?? STATE_ALIASES[norm(t["addr:state"])] : undefined;
    const districtText = t["addr:district"] ?? t["is_in:district"];
    const district = state && districtText ? STATES[state].find((d) => norm(d) === norm(districtText)) ?? STATES[state].find((d) => norm(d).includes(norm(districtText)) || norm(districtText).includes(norm(d))) : undefined;
    drafts.push({
      externalId: `osm:${e.type}/${e.id}`,
      name,
      category: categorise(t),
      address: cap(address(t, name), 250)!,
      state,
      district,
      pincode: /^\d{6}$/.test(t["addr:postcode"] ?? "") ? t["addr:postcode"] : null,
      lat,
      lng,
      phone,
      email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.email ?? t["contact:email"] ?? "") ? (t.email ?? t["contact:email"]).toLowerCase() : null,
      website: /^https?:\/\//.test(t.website ?? t["contact:website"] ?? "") ? cap(t.website ?? t["contact:website"], 200) : null,
      openingHours: cap(t.opening_hours, 100),
      hasComponents: /component/i.test(name),
      verified: /OpenGovernmentData|NBTC/i.test(t.source ?? ""),
    });
  }

  // Fill a missing state/district from the nearest listing that has one (within 60 km, same state).
  const placed = drafts.filter((d) => d.state && d.district);
  const rows: BankRow[] = [];
  for (const d of drafts) {
    let { state, district } = d;
    if (!state || !district) {
      let best: Draft | undefined;
      let bestD = 60;
      for (const p of placed) {
        if (state && p.state !== state) continue;
        const dist = Math.hypot((p.lat - d.lat) * 111, (p.lng - d.lng) * 111 * Math.cos((d.lat * Math.PI) / 180));
        if (dist < bestD) { bestD = dist; best = p; }
      }
      if (!best) continue;
      state = best.state;
      district = best.district;
    }
    rows.push({ ...d, state: state!, district: district! });
  }
  return rows;
}

export async function upsertBanks(prisma: PrismaClient, rows: BankRow[]) {
  let created = 0;
  let updated = 0;
  for (const r of rows) {
    const exists = await prisma.bloodBank.findUnique({ where: { externalId: r.externalId }, select: { id: true } });
    // Never overwrite stock or the verified/active flags an admin may have changed.
    const { verified, ...fields } = r;
    if (exists) {
      await prisma.bloodBank.update({ where: { id: exists.id }, data: fields });
      updated++;
    } else {
      await prisma.bloodBank.create({ data: { ...fields, verified, source: "osm" } });
      created++;
    }
  }
  return { created, updated };
}
