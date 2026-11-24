import type { Prisma } from "@prisma/client";
import { handler, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { distanceKm } from "@/lib/geo";

/** GET /api/camps?state=&district=&q=&range=upcoming|week|month|all&lat=&lng=&limit= */
export const GET = handler(async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const range = p.get("range") ?? "upcoming";
  const date: Prisma.DateTimeFilter = { gte: today };
  if (range === "week") date.lt = new Date(today.getTime() + 7 * 86400000);
  if (range === "month") date.lt = new Date(today.getTime() + 31 * 86400000);

  const q = p.get("q")?.trim();
  const where: Prisma.CampWhereInput = { active: true, date };
  if (p.get("state")) where.state = p.get("state")!;
  if (p.get("district")) where.district = p.get("district")!;
  if (q)
    where.OR = ["name", "address", "city", "organisedBy", "conductedBy"].map((f) => ({
      [f]: { contains: q, mode: "insensitive" },
    }));

  const camps = await prisma.camp.findMany({ where, orderBy: { date: "asc" }, take: range === "all" ? 500 : 200 });
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  let rows = camps.map((c) => ({
    ...c,
    distanceKm: p.has("lat") && c.lat != null && c.lng != null ? Math.round(distanceKm(lat, lng, c.lat, c.lng)) : null,
  }));
  if (p.get("sort") === "near" && p.has("lat")) rows = rows.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  const limit = Number(p.get("limit")) || rows.length;
  return ok({ total: rows.length, camps: rows.slice(0, limit) });
});
