import { z } from "zod";
import { handler, HttpError, ok, parseBody, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/notify";

const schema = z.object({ action: z.enum(["accept", "decline"]) });

/** POST /api/matches/:id — donor accepts or declines a request they were matched to. */
export const POST = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await params;
  const { action } = await parseBody(req, schema);
  const match = await prisma.requestMatch.findUnique({ where: { id }, include: { request: true } });
  if (!match || match.donorId !== user.id) throw new HttpError(404, "Request not found");
  if (match.request.status !== "OPEN") throw new HttpError(409, "This request is no longer open");

  const updated = await prisma.requestMatch.update({
    where: { id },
    data: { status: action === "accept" ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
  });
  if (action === "accept") {
    await sendSms(
      match.request.contactPhone,
      `BloodLink: a ${user.donor?.bloodGroup ?? ""} donor accepted your request for ${match.request.patientName}. Open BloodLink to see their contact details.`,
    ).catch(console.error);
  }
  return ok({ match: updated });
});
