import type { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { CAN_RECEIVE_FROM, isBloodGroup } from "@/lib/blood";
import { boundingBox, distanceKm } from "@/lib/geo";

/**
 * GET /api/banks?group=B%2B&lat=&lng=&radius=50&state=&district=&q=&stock=has|none&compatible=1&limit=50
 * With lat/lng: banks within radius sorted by distance. Otherwise filtered by state/district.
 */
export const GET = handler(async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const group = p.get("group");
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  const hasPoint = p.has("lat") && p.has("lng") && Number.isFinite(lat) && Number.isFinite(lng);
  const radius = Math.min(Number(p.get("radius")) || 50, 500);
  const limit = Math.min(Number(p.get("limit")) || 100, 500);
  const q = p.get("q")?.trim();
  const groups = isBloodGroup(group) ? (p.get("compatible") === "1" ? CAN_RECEIVE_FROM[group] : [group]) : null;

  const where: Prisma.BloodBankWhereInput = { active: true };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (hasPoint) {
    const b = boundingBox(lat, lng, radius);
    where.lat = { gte: b.minLat, lte: b.maxLat };
    where.lng = { gte: b.minLng, lte: b.maxLng };
  } else {
    if (p.get("state")) where.state = p.get("state")!;
    if (p.get("district")) where.district = p.get("district")!;
  }

  const banks = await prisma.bloodBank.findMany({
    where,
    include: { stock: true },
    take: hasPoint ? undefined : 1000,
  });

  let rows = banks.map((b) => {
    const matching = groups ? b.stock.filter((s) => groups.includes(s.bloodGroup as never) && s.units > 0) : b.stock.filter((s) => s.units > 0);
    return {
      id: b.id,
      name: b.name,
      category: b.category,
      address: b.address,
      district: b.district,
      state: b.state,
      phone: b.phone,
      lat: b.lat,
      lng: b.lng,
      verified: b.verified,
      hasComponents: b.hasComponents,
      stockUpdatedAt: b.stockUpdatedAt,
      stockPublished: b.stock.length > 0,
      openingHours: b.openingHours,
      units: matching.reduce((n, s) => n + s.units, 0),
      groupsInStock: matching.map((s) => s.bloodGroup),
      stock: Object.fromEntries(b.stock.map((s) => [s.bloodGroup, s.units])),
      distanceKm: hasPoint ? Math.round(distanceKm(lat, lng, b.lat, b.lng) * 10) / 10 : null,
    };
  });

  if (hasPoint) rows = rows.filter((r) => r.distanceKm! <= radius);
  const stock = p.get("stock");
  if (stock === "has") rows = rows.filter((r) => r.units > 0);
  if (stock === "none") rows = rows.filter((r) => r.units === 0);

  rows.sort((a, b) =>
    hasPoint
      ? stock === "best"
        ? Number(b.units > 0) - Number(a.units > 0) || a.distanceKm! - b.distanceKm!
        : a.distanceKm! - b.distanceKm!
      : b.units - a.units || a.name.localeCompare(b.name),
  );

  return ok({ total: rows.length, banks: rows.slice(0, limit) });
});
