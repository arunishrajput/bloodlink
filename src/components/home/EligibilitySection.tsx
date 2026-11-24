"use client";

import { useState } from "react";
import { EligibilityQuiz } from "../EligibilityQuiz";
import { useT } from "../providers";

export function EligibilitySection() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <section id="eligibility" className="card grid items-center gap-8 overflow-hidden p-6 sm:p-10 md:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="eyebrow">{t("home.eligEyebrow")}</p>
        <h2 className="mt-2 text-3xl font-extrabold">{t("home.eligTitle")}</h2>
        <p className="mt-3 max-w-lg text-muted">{t("home.eligSub")}</p>
        <button className="btn-primary mt-6" onClick={() => setOpen(true)}>{t("home.eligCta")}</button>
      </div>
      <ul className="grid grid-cols-2 gap-3 text-sm">
        {[["18–65", "years old"], ["45 kg+", "body weight"], ["12.5+", "g/dL haemoglobin"], ["3 months", "between donations"]].map(([v, l]) => (
          <li key={l} className="rounded-xl bg-paper p-4">
            <p className="font-display text-xl font-extrabold text-brand-700">{v}</p>
            <p className="text-muted">{l}</p>
          </li>
        ))}
      </ul>
      <EligibilityQuiz open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
