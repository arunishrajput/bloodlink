"use client";

import { useState } from "react";
import { BLOOD_GROUPS, RARE_GROUPS } from "@/lib/blood";
import { Modal } from "./Modal";
import { CompatibilityTable } from "./CompatibilityTable";
import { useT } from "./providers";

export function BloodGroupPicker({
  value,
  onChange,
  size = "md",
  showRarity,
  showHelp = true,
}: {
  value: string | null;
  onChange: (g: string) => void;
  size?: "md" | "lg";
  showRarity?: boolean;
  showHelp?: boolean;
}) {
  const t = useT();
  const [help, setHelp] = useState(false);
  return (
    <div>
      <div role="radiogroup" aria-label={t("common.bloodGroup")} className="grid grid-cols-4 gap-2">
        {BLOOD_GROUPS.map((g) => {
          const active = value === g;
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(g)}
              className={`flex flex-col items-center justify-center rounded-xl border font-bold transition-colors ${
                size === "lg" ? "py-4 text-xl" : "py-2.5 text-base"
              } ${active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-card text-ink hover:border-brand-300"}`}
            >
              {g}
              {showRarity && (
                <span className={`mt-0.5 text-[10px] font-medium uppercase tracking-wide ${active ? "text-white/80" : "text-muted"}`}>
                  {RARE_GROUPS.includes(g) ? "Rare" : "Common"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showHelp && (
        <button type="button" onClick={() => setHelp(true)} className="mt-2 text-sm font-medium text-brand-700 underline underline-offset-2">
          {t("common.notSure")}
        </button>
      )}
      <Modal open={help} onClose={() => setHelp(false)} title="Who can donate to whom" wide>
        <p className="mb-4 text-sm text-muted">
          If you don&apos;t know the patient&apos;s group, ask the treating doctor or hospital lab, which will have tested it. Use the table below to see compatible groups.
        </p>
        <CompatibilityTable highlight={value} />
      </Modal>
    </div>
  );
}
