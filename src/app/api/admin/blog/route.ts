import { revalidatePath } from "next/cache";
import { handler, ok, parseBody, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { blogSchema } from "@/lib/content";

export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const post = await prisma.blogPost.create({ data: await parseBody(req, blogSchema) });
  revalidatePath("/blog");
  return ok({ post }, { status: 201 });
});
