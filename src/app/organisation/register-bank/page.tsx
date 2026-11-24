import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOrgPage } from "@/lib/org-guard";
import { PageHeader } from "@/components/PageHeader";
import { BankForm } from "./BankForm";

export const metadata: Metadata = { title: "Register a Blood Bank" };

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const { membership } = await requireOrgPage(`/organisation/register-bank${id ? `?id=${id}` : ""}`);
  const bank = id ? await prisma.bloodBank.findFirst({ where: { id, orgId: membership?.orgId ?? "__none__" } }) : null;
  if (id && !bank) notFound();
  return (
    <>
      <PageHeader title={bank ? "Edit blood bank" : "Register a blood bank"} sub="Listed banks appear in search straight away. Our team verifies licence details and adds a verified badge." crumbs={[["/organisation", "Organisation"]]} />
      <div className="container-page max-w-2xl py-10">
        <BankForm needsOrg={!membership} bank={bank ? JSON.parse(JSON.stringify(bank)) : null} />
      </div>
    </>
  );
}
