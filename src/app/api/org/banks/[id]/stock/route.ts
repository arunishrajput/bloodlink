import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireOrg, stockSchema } from "@/lib/org";

/** PUT /api/org/banks/:id/stock — publish current units per blood group. */
export const PUT = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { org } = await requireOrg();
  const bank = await prisma.bloodBank.findUnique({ where: { id } });
  if (!bank || bank.orgId !== org.id) throw new HttpError(404, "Blood bank not found");
  const { stock } = await parseBody(req, stockSchema);
  await prisma.$transaction([
    ...Object.entries(stock).map(([bloodGroup, units]) =>
      prisma.stock.upsert({
        where: { bankId_bloodGroup: { bankId: id, bloodGroup } },
        create: { bankId: id, bloodGroup, units },
        update: { units },
      }),
    ),
    prisma.bloodBank.update({ where: { id }, data: { stockUpdatedAt: new Date() } }),
  ]);
  return ok({ ok: true });
});
