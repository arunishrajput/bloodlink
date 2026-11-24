/** Demo mode: one-click sample accounts and a banner saying some figures are simulated. */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO = {
  donor: { phone: "0000990001" },
  requester: { phone: "0000990002" },
  org: { email: "demo.organiser@example.com", name: "Demo Blood Centre Network" },
  admin: { email: "admin@example.com" },
} as const;
