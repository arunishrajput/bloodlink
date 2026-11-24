"use client";

import { useRouter } from "next/navigation";
import { OtpForm } from "@/components/OtpForm";

export function OrgLoginClient({ next }: { next: string }) {
  const router = useRouter();
  return <OtpForm channel="email" onVerified={() => { router.push(next); router.refresh(); }} />;
}
