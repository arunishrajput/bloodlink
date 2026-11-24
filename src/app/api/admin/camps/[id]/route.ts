import { z } from "zod";
import { handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";

const schema = z.object({ verified: z.boolean().optional(), active: z.boolean().optional() });

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await params;
  return ok({ camp: await prisma.camp.update({ where: { id }, data: await parseBody(req, schema) }) });
});
