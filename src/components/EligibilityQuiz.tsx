"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "./Modal";

/** `pass` is the answer that keeps you eligible. Wording follows common donor-selection criteria. */
const QUESTIONS: { q: string; hint?: string; pass: boolean }[] = [
  { q: "Are you between 18 and 65 years old?", pass: true },
  { q: "Do you weigh at least 45 kg?", pass: true },
  { q: "Are you feeling healthy today — no fever, cold, cough or infection?", pass: true },
  { q: "Has it been at least 3 months since your last blood donation?", hint: "4 months for women. Choose Yes if you've never donated.", pass: true },
  { q: "In the last 12 months, have you had a tattoo, piercing, or acupuncture?", pass: false },
  { q: "In the last 12 months, have you had major surgery or received a blood transfusion?", pass: false },
  { q: "Are you currently taking antibiotics or being treated for an infection?", pass: false },
  { q: "Are you pregnant, or have you given birth or breastfed in the last 12 months?", hint: "Choose No if this doesn't apply to you.", pass: false },
  { q: "Has a doctor ever told you not to donate blood — for example because of heart disease, hepatitis, HIV, or a bleeding disorder?", pass: false },
];

export function EligibilityQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const i = answers.length;
  const done = i === QUESTIONS.length;
  const passed = answers.filter((a, idx) => a === QUESTIONS[idx].pass).length;
  const score = Math.round((passed / QUESTIONS.length) * 100);
  const eligible = done && passed === QUESTIONS.length;

  function close() {
    setAnswers([]);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="Quick eligibility check">
      {!done ? (
        <div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${(i / QUESTIONS.length) * 100}%` }} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Question {i + 1} of {QUESTIONS.length}</p>
          <p className="mt-2 text-lg font-semibold leading-snug">{QUESTIONS[i].q}</p>
          {QUESTIONS[i].hint && <p className="mt-1 text-sm text-muted">{QUESTIONS[i].hint}</p>}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="btn-secondary py-4 text-base" onClick={() => setAnswers([...answers, true])}>Yes</button>
            <button className="btn-secondary py-4 text-base" onClick={() => setAnswers([...answers, false])}>No</button>
          </div>
          {i > 0 && (
            <button className="mt-4 text-sm text-muted underline" onClick={() => setAnswers(answers.slice(0, -1))}>
              Previous question
            </button>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold ${eligible ? "bg-green-50 text-ok" : "bg-amber-50 text-warn"}`}>
            {score}%
          </div>
          <p className="mt-4 text-lg font-bold">{eligible ? "You're likely eligible to donate!" : "You may need to wait before donating"}</p>
          <p className="mt-2 text-sm text-muted">
            {eligible
              ? "Great news. The blood bank will do a quick health check (haemoglobin, pulse, blood pressure) on the day to confirm."
              : "One or more of your answers usually means a temporary deferral. The blood bank's doctor makes the final call, so speak to them if you're unsure."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {eligible && <Link href="/register" className="btn-primary" onClick={close}>Register as a donor</Link>}
            <Link href="/donate" className="btn-secondary" onClick={close}>Read more about donating</Link>
            <button className="text-sm text-muted underline" onClick={() => setAnswers([])}>Retake the check</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
