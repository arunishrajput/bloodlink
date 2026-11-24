"use client";

import { useRouter } from "next/navigation";
import { DonorForm } from "@/components/DonorForm";

export function RegisterClient({ verifiedPhone }: { verifiedPhone: string | null }) {
  const router = useRouter();
  return (
    <DonorForm
      mode="register"
      verifiedPhone={verifiedPhone}
      onSaved={() => {
        router.push("/profile?welcome=1");
        router.refresh();
      }}
    />
  );
}
