import { z } from "zod";
import { handler, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { isValidLocation } from "@/lib/geo";

const schema = z
  .object({
    state: z.string(),
    district: z.string(),
    email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number").optional().or(z.literal("")),
  })
  .refine((v) => isValidLocation(v.state, v.district), "Pick a state and district")
  .refine((v) => v.email || v.phone, "Leave an email or a mobile number");

export const POST = handler(async (req: Request) => {
  const v = await parseBody(req, schema);
  await prisma.campSubscription.create({
    data: { state: v.state, district: v.district, email: v.email || null, phone: v.phone || null },
  });
  return ok({ ok: true });
});
