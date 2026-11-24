"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { useT } from "./providers";

type VerifiedUser = { id: string; phone: string | null; email: string | null; isDonor: boolean };

/** Two-step OTP sign-in: enter phone/email → enter 6-digit code. Calls onVerified once a session exists. */
export function OtpForm({
  channel = "phone",
  onVerified,
  cta,
}: {
  channel?: "phone" | "email";
  onVerified: (user: VerifiedUser) => void;
  cta?: string;
}) {
  const t = useT();
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"target" | "code">("target");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const normalized = channel === "phone" ? target.replace(/\D/g, "").slice(-10) : target.trim().toLowerCase();

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ devCode?: string }>("/api/auth/otp/send", { body: { channel, target: normalized } });
      setDevCode(r.devCode ?? null);
      setStep("code");
      setCooldown(30);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ user: VerifiedUser }>("/api/auth/otp/verify", { body: { target: normalized, code } });
      onVerified(r.user);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (step === "target")
    return (
      <form onSubmit={send} className="space-y-3">
        <label className="block">
          <span className="label">{channel === "phone" ? t("common.mobile") : "Email address"}</span>
          {channel === "phone" ? (
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-line bg-paper px-3 text-sm text-muted">+91</span>
              <input
                className="input rounded-l-none"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={target}
                onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                required
              />
            </div>
          ) : (
            <input className="input" type="email" autoComplete="email" placeholder="you@organisation.org" value={target} onChange={(e) => setTarget(e.target.value)} required />
          )}
        </label>
        {error && <p className="text-sm text-brand-700" role="alert">{error}</p>}
        <button className="btn-primary w-full" disabled={busy || (channel === "phone" ? normalized.length !== 10 : !target.includes("@"))}>
          {busy ? "Sending…" : cta ?? (channel === "phone" ? t("common.sendOtp") : "Send code")}
        </button>
      </form>
    );

  return (
    <form onSubmit={verify} className="space-y-3">
      <p className="text-sm text-muted">
        We sent a 6-digit code to <strong className="text-ink">{channel === "phone" ? `+91 ${normalized}` : normalized}</strong>.{" "}
        <button type="button" className="font-medium text-brand-700 underline" onClick={() => { setStep("target"); setCode(""); }}>
          Change
        </button>
      </p>
      {devCode && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Development mode: your code is <strong className="font-mono tracking-widest">{devCode}</strong>
        </p>
      )}
      <input
        className="input text-center font-mono text-2xl tracking-[0.5em]"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="••••••"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        autoFocus
        required
      />
      {error && <p className="text-sm text-brand-700" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy || code.length !== 6}>
        {busy ? "Verifying…" : t("common.verify")}
      </button>
      <button type="button" className="w-full text-sm text-muted disabled:opacity-50" disabled={cooldown > 0 || busy} onClick={() => send()}>
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </form>
  );
}
