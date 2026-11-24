"use client";

import Link from "next/link";
import { QrCode } from "../QrCode";
import { useT } from "../providers";

export function EmergencyCard() {
  const t = useT();
  return (
    <div className="card relative overflow-hidden p-6 shadow-xl shadow-brand-900/5 sm:p-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" /></span>
        {t("home.emergency")}
      </span>
      <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">{t("home.findInMinutes")}</h2>
      <p className="mt-2 text-sm text-muted">{t("home.findSub")}</p>
      <Link href="/request" className="btn-primary mt-6 w-full py-4 text-base">{t("nav.findNow")}</Link>
      <div className="mt-6 hidden items-center gap-4 border-t border-line pt-6 sm:flex">
        <QrCode path="/request" size={96} />
        <p className="text-sm text-muted">
          <strong className="block text-ink">On the move?</strong>
          Scan with your phone to continue there. Calling banks and donors is quicker from a phone.
        </p>
      </div>
    </div>
  );
}
