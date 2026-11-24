import "server-only";
import { prisma } from "./db";
import { CAN_RECEIVE_FROM, DONATION_GAP_DAYS, type BloodGroup } from "./blood";
import { boundingBox, distanceKm } from "./geo";
import { appUrl, sendSms } from "./notify";

/** Radius steps a request walks through when nobody has accepted yet. */
export const RADIUS_STEPS = [10, 25, 50, 100];
/** How long to wait at one radius before widening. */
export const EXPAND_AFTER_MS = 10 * 60 * 1000;
export const REQUEST_TTL_MS = 3 * 24 * 60 * 60 * 1000;

type Point = { lat: number; lng: number };

/** Available, compatible donors within radiusKm who are also willing to travel that far. */
export async function findCompatibleDonors(group: BloodGroup, at: Point, radiusKm: number, excludeUserId?: string) {
  const box = boundingBox(at.lat, at.lng, radiusKm);
  const gapCutoff = new Date(Date.now() - DONATION_GAP_DAYS * 86400000);
  const donors = await prisma.donorProfile.findMany({
    where: {
      bloodGroup: { in: CAN_RECEIVE_FROM[group] },
      available: true,
      lat: { gte: box.minLat, lte: box.maxLat },
      lng: { gte: box.minLng, lte: box.maxLng },
      OR: [{ lastDonatedAt: null }, { lastDonatedAt: { lt: gapCutoff } }],
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    include: { user: { select: { phone: true } } },
  });
  return donors
    .map((d) => ({ ...d, distanceKm: distanceKm(at.lat, at.lng, d.lat, d.lng) }))
    .filter((d) => d.distanceKm <= radiusKm && d.distanceKm <= d.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Notifies every compatible donor in the request's current radius who hasn't been asked yet. */
export async function notifyDonorsForRequest(requestId: string) {
  const req = await prisma.bloodRequest.findUniqueOrThrow({ where: { id: requestId }, include: { matches: true } });
  const already = new Set(req.matches.map((m) => m.donorId));
  const donors = (await findCompatibleDonors(req.bloodGroup as BloodGroup, req, req.radiusKm, req.requesterId)).filter(
    (d) => !already.has(d.userId),
  );
  if (!donors.length) return 0;

  await prisma.requestMatch.createMany({
    data: donors.map((d) => ({ requestId, donorId: d.userId, distanceKm: Math.round(d.distanceKm * 10) / 10 })),
    skipDuplicates: true,
  });

  const text = `BloodLink: ${req.units} unit(s) of ${req.bloodGroup} needed at ${req.hospitalName}. Can you help? ${appUrl("/profile")}`;
  await Promise.allSettled(donors.filter((d) => d.user.phone && d.contactSms).map((d) => sendSms(d.user.phone!, text)));
  return donors.length;
}

/**
 * Widens an open request to the next radius step if nobody has accepted and it has waited long enough.
 * Safe to call often: from the status page, and from the cron endpoint.
 */
export async function maybeExpandRequest(requestId: string, force = false) {
  const req = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: { matches: { where: { status: "ACCEPTED" }, select: { id: true } } },
  });
  if (!req || req.status !== "OPEN") return req;
  if (req.expiresAt < new Date()) {
    return prisma.bloodRequest.update({ where: { id: requestId }, data: { status: "EXPIRED" } });
  }
  if (req.matches.length) return req;
  const waited = Date.now() - req.lastExpandedAt.getTime();
  const next = RADIUS_STEPS.find((r) => r > req.radiusKm);
  if (!next || (!force && waited < EXPAND_AFTER_MS)) return req;

  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { radiusKm: next, lastExpandedAt: new Date() },
  });
  await notifyDonorsForRequest(requestId);
  return updated;
}
