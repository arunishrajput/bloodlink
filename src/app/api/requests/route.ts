import { z } from "zod";
import { handler, HttpError, ok, parseBody, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { BLOOD_GROUPS } from "@/lib/blood";
import { isValidLocation } from "@/lib/geo";
import { notifyDonorsForRequest, RADIUS_STEPS, REQUEST_TTL_MS } from "@/lib/matching";

const schema = z
  .object({
    patientName: z.string().trim().min(2, "Add the patient's name").max(80),
    bloodGroup: z.enum(BLOOD_GROUPS),
    units: z.number().int().min(1).max(20),
    urgency: z.enum(["CRITICAL", "URGENT", "PLANNED"]),
    hospitalName: z.string().trim().min(2, "Add the hospital").max(160),
    bankId: z.string().optional().nullable(),
    state: z.string(),
    district: z.string(),
    lat: z.number().min(6).max(38),
    lng: z.number().min(68).max(98),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit contact number"),
    note: z.string().trim().max(500).optional(),
    recurring: z.boolean().default(false),
    intervalDays: z.number().int().min(7).max(90).optional().nullable(),
  })
  .refine((v) => isValidLocation(v.state, v.district), "Pick the patient's state and district");

/** POST /api/requests — create a blood request and notify compatible donors at the first radius step. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const data = await parseBody(req, schema);
  const open = await prisma.bloodRequest.count({ where: { requesterId: user.id, status: "OPEN" } });
  if (open >= 3) throw new HttpError(429, "You already have 3 open requests. Close one before starting another.");

  const request = await prisma.bloodRequest.create({
    data: {
      ...data,
      intervalDays: data.recurring ? data.intervalDays ?? 21 : null,
      requesterId: user.id,
      radiusKm: RADIUS_STEPS[0],
      expiresAt: new Date(Date.now() + REQUEST_TTL_MS),
    },
  });
  const notified = await notifyDonorsForRequest(request.id);
  return ok({ request, notified }, { status: 201 });
});

/** GET /api/requests — the signed-in user's own requests. */
export const GET = handler(async () => {
  const user = await requireUser();
  const requests = await prisma.bloodRequest.findMany({
    where: { requesterId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { matches: true } }, matches: { where: { status: "ACCEPTED" }, select: { id: true } } },
    take: 50,
  });
  return ok({
    requests: requests.map(({ matches, _count, ...r }) => ({ ...r, notified: _count.matches, accepted: matches.length })),
  });
});
