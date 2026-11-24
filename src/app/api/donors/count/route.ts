import { handler, HttpError, ok } from "@/lib/api";
import { isBloodGroup } from "@/lib/blood";
import { findCompatibleDonors } from "@/lib/matching";

/** GET /api/donors/count?group=&lat=&lng=&radius= — how many compatible donors are reachable (no personal data). */
export const GET = handler(async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const group = p.get("group");
  const lat = Number(p.get("lat"));
  const lng = Number(p.get("lng"));
  if (!isBloodGroup(group) || !Number.isFinite(lat) || !Number.isFinite(lng)) throw new HttpError(400, "group, lat and lng are required");
  const radius = Math.min(Number(p.get("radius")) || 100, 100);
  const donors = await findCompatibleDonors(group, { lat, lng }, radius);
  return ok({ count: donors.length, radiusKm: radius });
});
