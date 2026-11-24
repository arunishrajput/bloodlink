import { z } from "zod";
import { handler, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2, "Add your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number").optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional(),
  website: z.string().optional(), // honeypot: real users never fill this in
});

export const GET = handler(async () => ok({ count: await prisma.pledge.count() }));

export const POST = handler(async (req: Request) => {
  const v = await parseBody(req, schema);
  if (v.website) return ok({ ok: true, count: await prisma.pledge.count() });
  await prisma.pledge.upsert({
    where: { email: v.email },
    create: { name: v.name, email: v.email, phone: v.phone || null, message: v.message || null },
    update: { name: v.name, phone: v.phone || null, message: v.message || null },
  });
  return ok({ ok: true, count: await prisma.pledge.count() });
});
