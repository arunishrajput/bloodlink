import { handler, ok, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await params;
  await prisma.notice.delete({ where: { id } });
  return ok({ ok: true });
});
