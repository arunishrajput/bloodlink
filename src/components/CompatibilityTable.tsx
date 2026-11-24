import { BLOOD_GROUPS, CAN_DONATE_TO, CAN_RECEIVE_FROM, formatGroupList } from "@/lib/blood";

export function CompatibilityTable({ highlight }: { highlight?: string | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <th className="py-2 pr-4 font-semibold">Type</th>
            <th className="py-2 pr-4 font-semibold">Can donate to</th>
            <th className="py-2 font-semibold">Can receive from</th>
          </tr>
        </thead>
        <tbody>
          {BLOOD_GROUPS.map((g) => (
            <tr key={g} className={`border-b border-line/70 last:border-0 ${highlight === g ? "bg-brand-50" : ""}`}>
              <td className="py-2.5 pr-4 font-bold text-brand-700">{g}</td>
              <td className="py-2.5 pr-4">{formatGroupList(CAN_DONATE_TO[g])}</td>
              <td className="py-2.5">{formatGroupList(CAN_RECEIVE_FROM[g])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">
        General guidance only. The blood bank&apos;s medical team confirms final compatibility (cross-matching) before any transfusion.
      </p>
    </div>
  );
}
