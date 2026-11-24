import { revalidatePath } from "next/cache";
import { handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { blogSchema } from "@/lib/content";

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.blogPost.update({ where: { id }, data: await parseBody(req, blogSchema) });
  revalidatePath("/blog");
  return ok({ post });
});

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  return ok({ ok: true });
});
