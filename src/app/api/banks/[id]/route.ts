import { handler, HttpError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";

export const GET = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const bank = await prisma.bloodBank.findFirst({ where: { id, active: true }, include: { stock: true } });
  if (!bank) throw new HttpError(404, "Blood bank not found");
  return ok({ bank });
});
