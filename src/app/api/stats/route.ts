import { handler, ok } from "@/lib/api";
import { getStats } from "@/lib/queries";

export const GET = handler(async () => ok(await getStats()));
