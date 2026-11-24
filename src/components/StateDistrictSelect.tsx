"use client";

import { STATE_NAMES, STATES } from "@/lib/geo";
import { useT } from "./providers";

export function StateDistrictSelect({
  state,
  district,
  onChange,
  required,
  compact,
}: {
  state: string;
  district: string;
  onChange: (state: string, district: string) => void;
  required?: boolean;
  compact?: boolean;
}) {
  const t = useT();
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
      <label className="block">
        <span className="label">{t("common.state")}</span>
        <select className="input" value={state} required={required} onChange={(e) => onChange(e.target.value, "")}>
          <option value="">{t("common.selectState")}</option>
          {STATE_NAMES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">{t("common.district")}</span>
        <select className="input" value={district} required={required} disabled={!state} onChange={(e) => onChange(state, e.target.value)}>
          <option value="">{state ? t("common.selectDistrict") : t("common.selectStateFirst")}</option>
          {(STATES[state] ?? []).map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
