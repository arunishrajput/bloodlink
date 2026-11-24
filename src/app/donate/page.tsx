import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CompatibilityTable } from "@/components/CompatibilityTable";

export const metadata: Metadata = { title: "About Donating", description: "Why donate blood, who can donate, and how a donation works." };

const ELIGIBILITY = [
  ["At least 45 kg", "The minimum body weight for a safe donation."],
  ["18 to 65 years old", "The usual age range for whole-blood donors."],
  ["Generally healthy", "Feeling well on the day, with no fever, cold or infection."],
  ["Tell staff about health concerns", "Medicines, recent surgery, anything else. The blood bank will confirm you're clear to donate."],
];

const STEPS = [
  ["Registration", "Sign up with your blood group and basic details. Bring a photo ID on the day."],
  ["Health screening", "A short questionnaire, plus a quick check of pulse, blood pressure and haemoglobin."],
  ["Donation", "One unit takes about 6–10 minutes, using a new, sterile, single-use kit."],
  ["Aftercare", "Rest for 10–15 minutes with a snack, skip heavy lifting for the day, and drink plenty of fluids."],
];

export default function Page() {
  return (
    <>
      <PageHeader title="About donating" sub="Blood can't be manufactured. Every unit on a blood bank's shelf was given by someone like you." />
      <div className="container-page space-y-16 py-12">
        <section>
          <p className="eyebrow">Why donate</p>
          <h2 className="mt-2 text-3xl font-extrabold">One donation, several lives</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Accident and surgery patients, new mothers, people with cancer, and patients with thalassemia or haemophilia all depend on blood being there when they need it.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[["Up to 3", "patients helped by one donation, once it's separated into components"], ["~10 min", "is all the donation itself takes"], ["Every 3 months", "is how often men can donate (every 4 months for women)"]].map(([v, l]) => (
              <div key={l} className="card p-6">
                <p className="font-display text-3xl font-extrabold text-brand-700">{v}</p>
                <p className="mt-2 text-sm text-muted">{l}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow">Who can donate</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="mt-2 text-3xl font-extrabold">Are you eligible?</h2>
            <Link href="/#eligibility" className="text-sm font-semibold text-brand-700 hover:underline">Take the quick eligibility check →</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ELIGIBILITY.map(([t, s]) => (
              <div key={t} className="card p-6">
                <p className="font-bold">{t}</p>
                <p className="mt-2 text-sm text-muted">{s}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow">For donors</p>
          <h2 className="mt-2 text-3xl font-extrabold">How a donation works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {STEPS.map(([t, s], i) => (
              <li key={t} className="card p-6">
                <span className="font-display text-4xl font-extrabold text-brand-200">0{i + 1}</span>
                <p className="mt-2 font-bold">{t}</p>
                <p className="mt-2 text-sm text-muted">{s}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="card p-6 sm:p-8">
          <p className="eyebrow">Know your type</p>
          <h2 className="mt-2 mb-6 text-3xl font-extrabold">Blood type compatibility</h2>
          <CompatibilityTable />
        </section>

        <section className="flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary">Register as a donor</Link>
          <Link href="/camps" className="btn-secondary">Find a camp near you</Link>
        </section>
      </div>
    </>
  );
}
