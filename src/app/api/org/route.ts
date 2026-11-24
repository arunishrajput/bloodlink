import { z } from "zod";
import { handler, ok, parseBody, requireOrgMember } from "@/lib/api";
import { prisma } from "@/lib/db";
import { ensureOrg } from "@/lib/org";

/** GET /api/org — the caller's organisation with members, banks (and stock) and camps. */
export const GET = handler(async () => {
  const { user, membership } = await requireOrgMember();
  if (!membership) return ok({ org: null, email: user.email });
  const org = await prisma.organisation.findUniqueOrThrow({
    where: { id: membership.orgId },
    include: {
      members: { include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" } },
      banks: { include: { stock: true }, orderBy: { createdAt: "desc" } },
      camps: { orderBy: { date: "desc" } },
    },
  });
  return ok({ org, role: membership.role, email: user.email });
});

/** POST /api/org — create an organisation for the caller. */
export const POST = handler(async (req: Request) => {
  const { name } = await parseBody(req, z.object({ name: z.string().trim().min(2, "Add your organisation's name").max(120) }));
  const { org } = await ensureOrg(name);
  return ok({ org }, { status: 201 });
});
