import { z } from "zod";
import { handler, HttpError, ok, parseBody } from "@/lib/api";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { DEMO, DEMO_MODE } from "@/lib/demo";

const schema = z.object({ role: z.enum(["donor", "requester", "organiser", "admin"]) });

const TARGET = {
  donor: { phone: DEMO.donor.phone, home: "/profile" },
  requester: { phone: DEMO.requester.phone, home: "/profile" },
  organiser: { email: DEMO.org.email, home: "/organisation" },
  admin: { email: DEMO.admin.email, home: "/admin" },
} as const;

/** POST /api/demo/login {role}: signs in as a seeded sample account. Only available when NEXT_PUBLIC_DEMO_MODE="true". */
export const POST = handler(async (req: Request) => {
  if (!DEMO_MODE) throw new HttpError(404, "Not found");
  const { role } = await parseBody(req, schema);
  const t = TARGET[role];
  const user = await prisma.user.findUnique({ where: "phone" in t ? { phone: t.phone } : { email: t.email } });
  if (!user) throw new HttpError(409, "Demo data isn't loaded. Run `npm run seed` first.");
  await createSession(user.id);
  return ok({ redirect: t.home });
});
