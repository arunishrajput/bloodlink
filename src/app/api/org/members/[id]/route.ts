import { handler, HttpError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrg } from "@/lib/org";

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { org, role, user } = await requireOrg();
  const member = await prisma.orgMember.findUnique({ where: { id } });
  if (!member || member.orgId !== org.id) throw new HttpError(404, "Teammate not found");
  if (role !== "OWNER" && member.userId !== user.id) throw new HttpError(403, "Only the owner can remove teammates");
  if (member.role === "OWNER") throw new HttpError(400, "The owner can't be removed");
  await prisma.orgMember.delete({ where: { id } });
  return ok({ ok: true });
});
