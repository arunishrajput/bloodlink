import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export const getStats = unstable_cache(
  async () => {
    const [donors, banks, camps, states] = await Promise.all([
      prisma.donorProfile.count(),
      prisma.bloodBank.count({ where: { active: true } }),
      prisma.camp.count(),
      prisma.bloodBank.groupBy({ by: ["state"], where: { active: true } }),
    ]);
    return { donors, banks, camps, states: states.length };
  },
  ["stats"],
  { revalidate: 300 },
);

export function upcomingCamps(take = 3) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.camp.findMany({ where: { active: true, date: { gte: today } }, orderBy: { date: "asc" }, take });
}
