import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { RegisterClient } from "./RegisterClient";

export const metadata: Metadata = { title: "Register as a Donor" };

export default async function Page() {
  const user = await getCurrentUser();
  if (user?.donor) redirect("/profile");
  return (
    <>
      <PageHeader title="Register as a donor" sub="Requesters see your details only after you accept their request, never before." />
      <div className="container-page max-w-2xl py-10">
        <RegisterClient verifiedPhone={user?.phone ?? null} />
        <p className="mt-6 text-center text-sm text-muted">
          Already registered? <Link href="/login" className="font-medium text-brand-700 underline">Sign in instead</Link>.
        </p>
      </div>
    </>
  );
}
