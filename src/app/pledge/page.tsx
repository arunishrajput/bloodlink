import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PledgeForm } from "./PledgeForm";

export const metadata: Metadata = { title: "Pledge your support" };
export const dynamic = "force-dynamic";

const GOAL = Number(process.env.NEXT_PUBLIC_PLEDGE_GOAL ?? 10000);

export default async function Page() {
  const count = await prisma.pledge.count();
  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="eyebrow">Pledge</p>
        <h1 className="mt-2 text-4xl font-extrabold">Pledge your support for voluntary blood donation</h1>
        <p className="mt-4 text-muted">
          Add your name to the people who believe no patient should ever wait for blood. Every pledge shows hospitals, blood banks and local authorities that their community is ready to help.
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {["You believe a faster, connected blood network is worth building", "It's free and you aren't committing to anything", "We may send you occasional updates on camps and drives near you"].map((x) => (
            <li key={x} className="flex gap-3"><span className="text-brand-600">✓</span>{x}</li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">
          Ready to do more? <Link href="/register" className="text-brand-700 underline">Register as a donor</Link>.
        </p>
      </div>
      <PledgeForm initialCount={count} goal={GOAL} />
    </div>
  );
}
