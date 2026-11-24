import { handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { noticeSchema } from "@/lib/content";

export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const v = await parseBody(req, noticeSchema);
  const notice = await prisma.notice.create({ data: { ...v, fileUrl: v.fileUrl || null, body: v.body || null } });
  return ok({ notice }, { status: 201 });
});
