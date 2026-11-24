import { handler, HttpError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import { maybeExpandRequest } from "@/lib/matching";

/** Widens stale open requests and expires old ones. Call every few minutes from a scheduler. */
export const GET = handler(async (req: Request) => {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) throw new HttpError(401, "Unauthorized");
  const open = await prisma.bloodRequest.findMany({ where: { status: "OPEN" }, select: { id: true } });
  for (const r of open) await maybeExpandRequest(r.id);
  return ok({ checked: open.length });
});
