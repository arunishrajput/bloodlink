import { handler, ok, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";

/** GET /api/donor/requests — requests this donor has been matched to. Requester contact appears only after acceptance. */
export const GET = handler(async () => {
  const user = await requireUser();
  const matches = await prisma.requestMatch.findMany({
    where: { donorId: user.id },
    include: { request: true },
    orderBy: { notifiedAt: "desc" },
    take: 50,
  });
  return ok({
    matches: matches.map((m) => ({
      id: m.id,
      status: m.status,
      distanceKm: m.distanceKm,
      notifiedAt: m.notifiedAt,
      request: {
        id: m.request.id,
        bloodGroup: m.request.bloodGroup,
        units: m.request.units,
        urgency: m.request.urgency,
        hospitalName: m.request.hospitalName,
        district: m.request.district,
        state: m.request.state,
        status: m.request.status,
        note: m.request.note,
        createdAt: m.request.createdAt,
        patientName: m.status === "ACCEPTED" ? m.request.patientName : null,
        contactPhone: m.status === "ACCEPTED" ? m.request.contactPhone : null,
      },
    })),
  });
});
