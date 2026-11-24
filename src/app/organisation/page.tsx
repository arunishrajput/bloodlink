import type { Metadata } from "next";
import { requireOrgPage } from "@/lib/org-guard";
import { isAdminEmail } from "@/lib/session";
import { Dashboard } from "@/components/org/Dashboard";

export const metadata: Metadata = { title: "Organisation Dashboard" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { user } = await requireOrgPage("/organisation");
  return <Dashboard email={user.email!} isAdmin={user.role === "ADMIN" || isAdminEmail(user.email)} />;
}
