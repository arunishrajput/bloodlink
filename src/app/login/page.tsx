import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { LoginClient } from "./LoginClient";
import { DemoLogin } from "@/components/DemoLogin";
import { DEMO_MODE } from "@/lib/demo";

export const metadata: Metadata = { title: "Sign In" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/profile";
  if (await getSessionUserId()) redirect(safeNext);
  return (
    <div className="container-page flex max-w-md flex-col py-16">
      <h1 className="text-3xl font-extrabold">Sign in to BloodLink</h1>
      <p className="mt-2 text-muted">Sign in or create an account to manage your donor profile and blood requests.</p>
      <div className="card mt-8 p-6">
        <LoginClient next={safeNext} />
      </div>
      {DEMO_MODE && <DemoLogin only={["donor", "requester"]} />}
      <p className="mt-6 text-sm text-muted">
        Registering as a donor? <Link href="/register" className="font-medium text-brand-700 underline">Start here</Link>; you&apos;ll be signed in automatically.
      </p>
      <p className="mt-2 text-sm text-muted">
        Blood bank or camp organiser? <Link href="/organisation/login" className="font-medium text-brand-700 underline">Organisation login</Link>.
      </p>
    </div>
  );
}
