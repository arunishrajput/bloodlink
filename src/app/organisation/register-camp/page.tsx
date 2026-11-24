import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOrgPage } from "@/lib/org-guard";
import { PageHeader } from "@/components/PageHeader";
import { CampForm } from "./CampForm";

export const metadata: Metadata = { title: "Register a Blood Camp" };

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const { membership } = await requireOrgPage(`/organisation/register-camp${id ? `?id=${id}` : ""}`);
  const camp = id ? await prisma.camp.findFirst({ where: { id, orgId: membership?.orgId ?? "__none__" } }) : null;
  if (id && !camp) notFound();
  return (
    <>
      <PageHeader title={camp ? "Edit camp" : "Register a blood camp"} sub="List a voluntary blood donation drive so donors nearby can find it and plan to come." crumbs={[["/organisation", "Organisation"]]} />
      <div className="container-page max-w-2xl py-10">
        <CampForm needsOrg={!membership} camp={camp ? JSON.parse(JSON.stringify(camp)) : null} />
      </div>
    </>
  );
}
