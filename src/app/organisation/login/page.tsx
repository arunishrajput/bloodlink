import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { OrgLoginClient } from "./OrgLoginClient";
import { DemoLogin } from "@/components/DemoLogin";
import { DEMO_MODE } from "@/lib/demo";

export const metadata: Metadata = { title: "Organisation Login" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/organisation";
  const user = await getCurrentUser();
  if (user?.email) redirect(safeNext);
  return (
    <div className="container-page flex max-w-md flex-col py-16">
      <p className="eyebrow">For blood banks &amp; camp organisers</p>
      <h1 className="mt-2 text-3xl font-extrabold">Organisation login</h1>
      <p className="mt-2 text-muted">One login for your whole team. Register your blood bank, add a donation camp, or manage teammates from your dashboard.</p>
      <div className="card mt-8 p-6">
        <OrgLoginClient next={safeNext} />
      </div>
      {DEMO_MODE && <DemoLogin only={["organiser", "admin"]} />}
      <p className="mt-6 text-sm text-muted">
        Looking to donate or find blood? That&apos;s a separate account: <Link href="/login" className="font-medium text-brand-700 underline">donor login is here</Link>.
      </p>
    </div>
  );
}
