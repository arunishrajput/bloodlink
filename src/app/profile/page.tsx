import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Profile } from "./Profile";

export const metadata: Metadata = { title: "Your Profile" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  if (!user)
    return (
      <div className="container-page max-w-md py-20 text-center">
        <h1 className="text-2xl font-extrabold">You&apos;re not signed in</h1>
        <p className="mt-2 text-muted">Sign in to see your profile, requests and donor status.</p>
        <Link href="/login" className="btn-primary mt-6">Sign in</Link>
      </div>
    );
  const { welcome } = await searchParams;
  return <Profile user={JSON.parse(JSON.stringify(user))} welcome={!!welcome} />;
}
