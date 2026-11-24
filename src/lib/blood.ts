export const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const RARE_GROUPS: BloodGroup[] = ["B-", "AB+", "AB-"];

/** Which donor groups a patient of the given group can receive red cells from. */
export const CAN_RECEIVE_FROM: Record<BloodGroup, BloodGroup[]> = {
  "O+": ["O+", "O-"],
  "O-": ["O-"],
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
};

export const CAN_DONATE_TO: Record<BloodGroup, BloodGroup[]> = Object.fromEntries(
  BLOOD_GROUPS.map((g) => [g, BLOOD_GROUPS.filter((r) => CAN_RECEIVE_FROM[r].includes(g))]),
) as Record<BloodGroup, BloodGroup[]>;

export function isBloodGroup(v: unknown): v is BloodGroup {
  return typeof v === "string" && (BLOOD_GROUPS as readonly string[]).includes(v);
}

export function formatGroupList(groups: BloodGroup[]): string {
  return groups.length === BLOOD_GROUPS.length ? "Everyone" : groups.join(" ");
}

/** Minimum gap between whole-blood donations. */
export const DONATION_GAP_DAYS = 90;
