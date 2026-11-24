import { z } from "zod";
import { handler, HttpError, ok, parseBody, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { maybeExpandRequest } from "@/lib/matching";

async function loadOwned(id: string, userId: string) {
  const r = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!r || r.requesterId !== userId) throw new HttpError(404, "Request not found");
  return r;
}

/** GET /api/requests/:id — status, current radius, and accepted donors' shared contact details. */
export const GET = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await params;
  await loadOwned(id, user.id);
  await maybeExpandRequest(id);
  const r = await prisma.bloodRequest.findUniqueOrThrow({
    where: { id },
    include: { matches: { include: { donor: { include: { donor: true } } }, orderBy: { distanceKm: "asc" } } },
  });
  const { matches, ...request } = r;
  return ok({
    request,
    counts: {
      notified: matches.length,
      accepted: matches.filter((m) => m.status === "ACCEPTED").length,
      declined: matches.filter((m) => m.status === "DECLINED").length,
    },
    donors: matches
      .filter((m) => m.status === "ACCEPTED" && m.donor.donor)
      .map((m) => {
        const d = m.donor.donor!;
        return {
          matchId: m.id,
          name: d.name,
          bloodGroup: d.bloodGroup,
          distanceKm: m.distanceKm,
          respondedAt: m.respondedAt,
          phone: m.donor.phone,
          call: d.contactCall,
          sms: d.contactSms,
          whatsapp: d.contactWhatsapp,
        };
      }),
  });
});

const patchSchema = z.object({ status: z.enum(["FULFILLED", "CANCELLED"]).optional(), expand: z.literal(true).optional() });

/** PATCH /api/requests/:id — close the request, or widen the search right away. */
export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await params;
  const existing = await loadOwned(id, user.id);
  const body = await parseBody(req, patchSchema);
  if (existing.status !== "OPEN") throw new HttpError(409, "This request is already closed");
  if (body.expand) return ok({ request: await maybeExpandRequest(id, true) });
  const request = await prisma.bloodRequest.update({ where: { id }, data: { status: body.status } });
  return ok({ request });
});
