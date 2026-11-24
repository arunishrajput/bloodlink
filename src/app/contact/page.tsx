import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@bloodlink.example";

export default function Page() {
  return (
    <>
      <PageHeader title="Contact us" sub="Questions, feedback, partnership ideas, or something not working? We'd love to hear from you." />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <p className="font-bold">Email</p>
            <a href={`mailto:${SUPPORT}`} className="mt-1 block text-brand-700 underline">{SUPPORT}</a>
            <p className="mt-2 text-sm text-muted">We usually reply within two working days.</p>
          </div>
          <div className="card p-6">
            <p className="font-bold">Blood banks &amp; organisers</p>
            <p className="mt-1 text-sm text-muted">To list your blood bank or camp, use the organisation login. For verification questions, email us with your licence number.</p>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-sm text-brand-900">
            <strong>In a medical emergency</strong>, call your nearest hospital or dial 112. Don&apos;t wait for a reply to this form.
          </div>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
