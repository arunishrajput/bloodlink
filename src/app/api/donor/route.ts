import { z } from "zod";
import { handler, HttpError, ok, parseBody, requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { BLOOD_GROUPS } from "@/lib/blood";
import { isValidLocation } from "@/lib/geo";

const base = {
  name: z.string().trim().min(2, "Add your name").max(80),
  dob: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Select a gender" }),
  bloodGroup: z.enum(BLOOD_GROUPS, { message: "Select your blood group" }),
  weightKg: z.number().int().min(30).max(250).nullable().optional(),
  heightCm: z.number().int().min(100).max(250).nullable().optional(),
  state: z.string(),
  district: z.string(),
  lat: z.number().min(6).max(38),
  lng: z.number().min(68).max(98),
  contactCall: z.boolean(),
  contactSms: z.boolean(),
  contactWhatsapp: z.boolean(),
  radiusKm: z.number().int().min(1).max(100),
};

function age(dob: Date) {
  const diff = Date.now() - dob.getTime();
  return diff / (365.25 * 86400000);
}

const registerSchema = z
  .object({
    ...base,
    eligibility: z.array(z.boolean()).length(3),
    consent: z.literal(true, { errorMap: () => ({ message: "Agree to share your contact details" }) }),
  })
  .refine((v) => isValidLocation(v.state, v.district), "Add your location")
  .refine((v) => age(v.dob) >= 18 && age(v.dob) <= 65, "Donors must be between 18 and 65 years old")
  .refine((v) => v.contactCall || v.contactSms || v.contactWhatsapp, "Pick at least one way to be reached")
  .refine((v) => v.eligibility.every(Boolean), "You need to confirm every eligibility statement to register");

const updateSchema = z
  .object({ ...base, available: z.boolean(), lastDonatedAt: z.coerce.date().nullable() })
  .partial()
  .refine((v) => !v.state || !v.district || isValidLocation(v.state, v.district), "Invalid location");

/** POST /api/donor — register the signed-in user as a donor. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  if (!user.phone) throw new HttpError(403, "Donors sign in with a mobile number");
  if (user.donor) throw new HttpError(409, "You're already registered as a donor");
  const { eligibility: _e, consent: _c, ...data } = await parseBody(req, registerSchema);
  const donor = await prisma.donorProfile.create({ data: { ...data, userId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { name: data.name } });
  return ok({ donor }, { status: 201 });
});

/** PATCH /api/donor — update profile fields, availability or last donation date. */
export const PATCH = handler(async (req: Request) => {
  const user = await requireUser();
  if (!user.donor) throw new HttpError(404, "You're not registered as a donor");
  const data = await parseBody(req, updateSchema);
  const donor = await prisma.donorProfile.update({ where: { userId: user.id }, data });
  if (data.name) await prisma.user.update({ where: { id: user.id }, data: { name: data.name } });
  return ok({ donor });
});

/** DELETE /api/donor — remove the donor profile (the account stays). */
export const DELETE = handler(async () => {
  const user = await requireUser();
  await prisma.donorProfile.deleteMany({ where: { userId: user.id } });
  await prisma.requestMatch.updateMany({ where: { donorId: user.id, status: "NOTIFIED" }, data: { status: "DECLINED" } });
  return ok({ ok: true });
});
