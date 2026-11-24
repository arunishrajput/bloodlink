import "server-only";
import nodemailer from "nodemailer";

export async function sendSms(phone: string, text: string) {
  // Only real Indian mobile numbers; skips placeholder/seed numbers.
  if (!/^[6-9]\d{9}$/.test(phone)) return;
  const provider = process.env.SMS_PROVIDER ?? "console";
  if (provider === "twilio") {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: `+91${phone}`, From: process.env.TWILIO_FROM!, Body: text }),
    });
    if (!res.ok) throw new Error(`SMS failed: ${res.status} ${await res.text()}`);
    return;
  }
  console.log(`[sms] to ${phone}: ${text}`);
}

let transport: nodemailer.Transporter | null = null;

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[email] to ${to}: ${subject}\n${text}`);
    return;
  }
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}

export function appUrl(path = "") {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "") + path;
}
