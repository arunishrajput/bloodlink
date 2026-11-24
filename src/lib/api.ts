import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { getCurrentUser, isAdminEmail } from "./session";
import { prisma } from "./db";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(raw);
}

/** Wraps a route handler so thrown HttpError/ZodError become JSON error responses. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError)
        return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid input", issues: e.issues }, { status: 422 });
      console.error(e);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please sign in first");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && !isAdminEmail(user.email)) throw new HttpError(403, "Admins only");
  return user;
}

/** Returns the caller's organisation membership, or throws if they don't belong to one. */
export async function requireOrgMember() {
  const user = await requireUser();
  if (!user.email) throw new HttpError(403, "Sign in with your organisation email");
  const membership = await prisma.orgMember.findFirst({ where: { userId: user.id }, include: { org: true } });
  return { user, membership };
}
