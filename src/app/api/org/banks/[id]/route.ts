import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { bankSchema, requireOrg } from "@/lib/org";

async function ownedBank(id: string) {
  const { org } = await requireOrg();
  const bank = await prisma.bloodBank.findUnique({ where: { id } });
  if (!bank || bank.orgId !== org.id) throw new HttpError(404, "Blood bank not found");
  return bank;
}

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await ownedBank(id);
  const { orgName: _o, ...data } = await parseBody(req, bankSchema);
  const bank = await prisma.bloodBank.update({
    where: { id },
    data: { ...data, pincode: data.pincode || null, email: data.email || null },
  });
  return ok({ bank });
});

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await ownedBank(id);
  await prisma.bloodBank.delete({ where: { id } });
  return ok({ ok: true });
});
