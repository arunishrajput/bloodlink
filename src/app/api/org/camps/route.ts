import { handler, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { campSchema, ensureOrg } from "@/lib/org";

/** POST /api/org/camps — list a voluntary blood donation camp. */
export const POST = handler(async (req: Request) => {
  const { orgName, ...data } = await parseBody(req, campSchema);
  const { org } = await ensureOrg(orgName);
  const camp = await prisma.camp.create({ data: { ...data, orgId: org.id } });
  return ok({ camp }, { status: 201 });
});
