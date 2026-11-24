import { z } from "zod";
import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/notify";
import { requireOrg } from "@/lib/org";

/** POST /api/org/members — add a teammate by email; they sign in with an email code. */
export const POST = handler(async (req: Request) => {
  const { org, role, user } = await requireOrg();
  if (role !== "OWNER") throw new HttpError(403, "Only the organisation owner can add teammates");
  const { email } = await parseBody(req, z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email") }));
  const teammate = await prisma.user.upsert({ where: { email }, create: { email }, update: {} });
  const other = await prisma.orgMember.findFirst({ where: { userId: teammate.id, orgId: { not: org.id } } });
  if (other) throw new HttpError(409, "That email already belongs to another organisation");
  const member = await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: org.id, userId: teammate.id } },
    create: { orgId: org.id, userId: teammate.id },
    update: {},
  });
  await sendEmail(
    email,
    `You've been added to ${org.name} on BloodLink`,
    `${user.email} added you to ${org.name} on BloodLink. Sign in with this email address at ${appUrl("/organisation/login")}`,
  ).catch(console.error);
  return ok({ member }, { status: 201 });
});
