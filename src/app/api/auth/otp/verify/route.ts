import { z } from "zod";
import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { OtpError, verifyOtp } from "@/lib/otp";
import { createSession, isAdminEmail } from "@/lib/session";

const schema = z.object({
  target: z.string().trim().toLowerCase().min(5),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const POST = handler(async (req: Request) => {
  const { target, code } = await parseBody(req, schema);
  try {
    await verifyOtp(target, code);
  } catch (e) {
    if (e instanceof OtpError) throw new HttpError(400, e.message);
    throw e;
  }
  const isEmail = target.includes("@");
  const where = isEmail ? { email: target } : { phone: target };
  const user = await prisma.user.upsert({
    where,
    create: { ...where, role: isEmail && isAdminEmail(target) ? "ADMIN" : "USER" },
    update: isEmail && isAdminEmail(target) ? { role: "ADMIN" } : {},
    include: { donor: { select: { id: true } } },
  });
  await createSession(user.id);
  return ok({ user: { id: user.id, phone: user.phone, email: user.email, isDonor: !!user.donor } });
});
