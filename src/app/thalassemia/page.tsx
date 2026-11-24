import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Thalassemia & Recurring Requests" };

export default function Page() {
  return (
    <>
      <PageHeader title="Thalassemia & recurring requests" sub="For patients who need blood every few weeks, BloodLink makes the regular search predictable." />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-ink/85">
          <h2 className="text-2xl font-extrabold">What is thalassemia?</h2>
          <p>Thalassemia is an inherited blood disorder in which the body can&apos;t make enough healthy haemoglobin. People with thalassemia major usually need a red cell transfusion every two to four weeks, for life.</p>
          <h2 className="pt-4 text-2xl font-extrabold">How recurring requests work</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Start a request on <Link href="/request" className="text-brand-700 underline">Find Blood</Link> as usual.</li>
            <li>On the last step, tick <strong>This is a recurring need</strong> and set how often the patient needs blood.</li>
            <li>Donors nearby see that it&apos;s a long-term need, so willing donors can plan their donations around it.</li>
            <li>Raise a new request each cycle from your profile. Donors who helped before can be called directly.</li>
          </ol>
          <h2 className="pt-4 text-2xl font-extrabold">Carrier screening</h2>
          <p>A simple blood test shows whether you carry the thalassemia trait. If both parents are carriers, each pregnancy has a one-in-four chance of thalassemia major, so screening before marriage or pregnancy matters.</p>
        </div>
        <aside className="space-y-4">
          <div className="card p-6">
            <p className="font-bold">Need blood for a thalassemia patient?</p>
            <Link href="/request" className="btn-primary mt-4 w-full">Start a recurring request</Link>
          </div>
          <div className="card p-6">
            <p className="font-bold">Want to help regularly?</p>
            <p className="mt-1 text-sm text-muted">Register as a donor and keep your availability on.</p>
            <Link href="/register" className="btn-secondary mt-4 w-full">Become a donor</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
