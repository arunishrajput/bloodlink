import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { campSchema, requireOrg } from "@/lib/org";

async function ownedCamp(id: string) {
  const { org } = await requireOrg();
  const camp = await prisma.camp.findUnique({ where: { id } });
  if (!camp || camp.orgId !== org.id) throw new HttpError(404, "Camp not found");
  return camp;
}

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await ownedCamp(id);
  const { orgName: _o, ...data } = await parseBody(req, campSchema);
  return ok({ camp: await prisma.camp.update({ where: { id }, data }) });
});

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await ownedCamp(id);
  await prisma.camp.delete({ where: { id } });
  return ok({ ok: true });
});
