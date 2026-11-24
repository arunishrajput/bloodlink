"use client";

import { useRouter } from "next/navigation";
import { OtpForm } from "@/components/OtpForm";

export function LoginClient({ next }: { next: string }) {
  const router = useRouter();
  return (
    <OtpForm
      cta="Send code"
      onVerified={() => {
        router.push(next);
        router.refresh();
      }}
    />
  );
}
