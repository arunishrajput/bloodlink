import "server-only";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "./db";
import { sendEmail, sendSms } from "./notify";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_WINDOW = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

const hash = (target: string, code: string) =>
  createHash("sha256").update(`${target}:${code}:${process.env.SESSION_SECRET}`).digest("hex");

export class OtpError extends Error {}

export async function issueOtp(target: string, channel: "phone" | "email") {
  const recent = await prisma.otp.findMany({
    where: { target, createdAt: { gt: new Date(Date.now() - TTL_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent.length >= MAX_SENDS_PER_WINDOW) throw new OtpError("Too many codes requested. Try again in a few minutes.");
  if (recent[0] && Date.now() - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS)
    throw new OtpError("Please wait 30 seconds before requesting another code.");

  const code = String(randomInt(100000, 1000000));
  await prisma.otp.create({ data: { target, codeHash: hash(target, code), expiresAt: new Date(Date.now() + TTL_MS) } });

  const text = `${code} is your BloodLink verification code. It expires in 10 minutes. Do not share it with anyone.`;
  if (channel === "phone") await sendSms(target, text);
  else await sendEmail(target, "Your BloodLink sign-in code", text);

  return process.env.DEV_SHOW_OTP === "true" ? code : undefined;
}

export async function verifyOtp(target: string, code: string) {
  const otp = await prisma.otp.findFirst({
    where: { target, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) throw new OtpError("Code expired. Request a new one.");
  if (otp.attempts >= MAX_ATTEMPTS) throw new OtpError("Too many wrong attempts. Request a new code.");

  const a = Buffer.from(otp.codeHash, "hex");
  const b = Buffer.from(hash(target, code), "hex");
  if (!timingSafeEqual(a, b)) {
    await prisma.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new OtpError("That code isn't right. Check and try again.");
  }
  await prisma.otp.deleteMany({ where: { target } });
}
