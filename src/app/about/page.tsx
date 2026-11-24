import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "About Us" };

const OBJECTIVES = [
  ["Faster response when it matters", "Get a patient's family from \"we need blood\" to a confirmed source in minutes, not hours of phone calls."],
  ["A search that keeps widening", "If nobody nearby responds, the search radius grows step by step until someone does."],
  ["Live blood bank stock", "Banks publish units for every blood group, with the time they last updated it."],
  ["A real donor network", "Every donor is verified with a one-time code and chooses how and how far they're willing to help."],
  ["Compatibility first, then distance", "Donors are matched by blood-group compatibility, then sorted by real distance, not by who signed up first."],
  ["Private by default", "A donor's name and number are shared only after they accept a request."],
];

export default function Page() {
  return (
    <>
      <PageHeader title="About us" sub="BloodLink connects people who need blood with the nearest compatible donor or blood bank that can actually help, right when they need it." />
      <div className="container-page space-y-16 py-12">
        <section className="max-w-3xl space-y-4 text-lg text-ink/85">
          <p>
            In most cities, blood exists. It&apos;s on a shelf at a blood bank across town, or it runs in the veins of a willing donor two streets away. The hard part is finding it fast enough, and families end up making dozens of calls and forwarding messages while the clock runs.
          </p>
          <p>
            BloodLink brings both sources into one search. Tell us the blood group and where the patient is. We check live stock at nearby banks, and if they can&apos;t help, we alert compatible donors around the patient and keep widening the search until someone says yes.
          </p>
        </section>
        <section>
          <p className="eyebrow">Our objectives</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OBJECTIVES.map(([t, s]) => (
              <div key={t} className="card p-6">
                <p className="font-bold">{t}</p>
                <p className="mt-2 text-sm text-muted">{s}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="card grid gap-6 p-6 sm:p-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">Built for everyone involved</p>
            <h2 className="mt-2 text-2xl font-extrabold">Patients, donors, blood banks and camp organisers</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted">
            <li><strong className="text-ink">Families</strong> raise one request and see banks and donors together.</li>
            <li><strong className="text-ink">Donors</strong> decide their availability, contact methods and travel distance.</li>
            <li><strong className="text-ink">Blood banks</strong> publish live stock from a simple dashboard shared by their team.</li>
            <li><strong className="text-ink">Organisers</strong> list donation camps so donors nearby can plan to come.</li>
          </ul>
        </section>
        <div className="flex flex-wrap gap-3">
          <Link href="/faqs" className="btn-secondary">Read the FAQs</Link>
          <Link href="/contact" className="btn-ghost">Contact us</Link>
        </div>
      </div>
    </>
  );
}
