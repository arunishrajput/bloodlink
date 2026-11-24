import { z } from "zod";
import { handler, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2, "Add your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  subject: z.string().trim().min(2, "Add a subject").max(140),
  message: z.string().trim().min(10, "Tell us a little more").max(4000),
  website: z.string().optional(),
});

export const POST = handler(async (req: Request) => {
  const { website, ...v } = await parseBody(req, schema);
  if (!website) await prisma.contactMessage.create({ data: v });
  return ok({ ok: true });
});
