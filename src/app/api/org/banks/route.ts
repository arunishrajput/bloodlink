import { handler, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { BLOOD_GROUPS } from "@/lib/blood";
import { bankSchema, ensureOrg } from "@/lib/org";

/** POST /api/org/banks — register a blood bank under the caller's organisation. */
export const POST = handler(async (req: Request) => {
  const { orgName, ...data } = await parseBody(req, bankSchema);
  const { org } = await ensureOrg(orgName);
  const bank = await prisma.bloodBank.create({
    data: {
      ...data,
      pincode: data.pincode || null,
      email: data.email || null,
      orgId: org.id,
      stock: { create: BLOOD_GROUPS.map((g) => ({ bloodGroup: g, units: 0 })) },
    },
  });
  return ok({ bank }, { status: 201 });
});
