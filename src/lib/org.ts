import "server-only";
import { z } from "zod";
import { prisma } from "./db";
import { HttpError, requireOrgMember } from "./api";
import { BLOOD_GROUPS } from "./blood";
import { isValidLocation } from "./geo";

/** The caller's organisation; creates one (with them as owner) if they pass a name and have none yet. */
export async function ensureOrg(orgName?: string) {
  const { user, membership } = await requireOrgMember();
  if (membership) return { user, org: membership.org, role: membership.role };
  if (!orgName?.trim()) throw new HttpError(400, "Add your organisation's name");
  const org = await prisma.organisation.create({
    data: { name: orgName.trim(), members: { create: { userId: user.id, role: "OWNER" } } },
  });
  return { user, org, role: "OWNER" as const };
}

export async function requireOrg() {
  const { user, membership } = await requireOrgMember();
  if (!membership) throw new HttpError(403, "Register a blood bank or camp first to create your organisation");
  return { user, org: membership.org, role: membership.role };
}

const phone = z.string().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number");
const located = <T extends { state: string; district: string }>(v: T) => isValidLocation(v.state, v.district);

export const bankSchema = z
  .object({
    orgName: z.string().optional(),
    name: z.string().trim().min(3, "Add the blood bank's name").max(160),
    category: z.enum(["GOVERNMENT", "PRIVATE", "CHARITABLE", "RED_CROSS"]),
    address: z.string().trim().min(5, "Add the full address").max(300),
    state: z.string(),
    district: z.string(),
    pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit PIN code").optional().or(z.literal("")),
    lat: z.number().min(6).max(38),
    lng: z.number().min(68).max(98),
    phone,
    email: z.string().email().optional().or(z.literal("")),
    licenseNo: z.string().trim().max(60).optional(),
    hasComponents: z.boolean().default(false),
  })
  .refine(located, "Pick a state and district");

export const stockSchema = z.object({
  stock: z.record(z.enum(BLOOD_GROUPS), z.number().int().min(0).max(10000)),
});

export const campSchema = z
  .object({
    orgName: z.string().optional(),
    name: z.string().trim().min(3, "Add the camp's name").max(160),
    address: z.string().trim().min(3, "Add the venue").max(300),
    city: z.string().trim().min(2, "Add the city").max(80),
    state: z.string(),
    district: z.string(),
    lat: z.number().min(6).max(38).nullable().optional(),
    lng: z.number().min(68).max(98).nullable().optional(),
    date: z.coerce.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    organisedBy: z.string().trim().min(2, "Who is organising it?").max(120),
    conductedBy: z.string().trim().min(2, "Which blood bank is conducting it?").max(120),
    contactPhone: phone,
    expectedUnits: z.number().int().min(1).max(10000).nullable().optional(),
  })
  .refine(located, "Pick a state and district")
  .refine((v) => v.startTime < v.endTime, "The camp must end after it starts");
