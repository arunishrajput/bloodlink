import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentUser } from "./session";

/** For organisation pages: requires an email-signed-in user, returns them with their membership (if any). */
export async function requireOrgPage(path: string) {
  const user = await getCurrentUser();
  if (!user?.email) redirect(`/organisation/login?next=${encodeURIComponent(path)}`);
  const membership = await prisma.orgMember.findFirst({ where: { userId: user.id }, include: { org: true } });
  return { user, membership };
}
