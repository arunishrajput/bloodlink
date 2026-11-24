import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "FAQs" };

const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@bloodlink.example";

const FAQS: [string, [string, string][]][] = [
  [
    "Donating blood",
    [
      ["What's the minimum age to donate blood?", "You need to be at least 18. The usual upper limit is 65, and first-time donors over 60 may need a doctor's go-ahead."],
      ["I've had alcohol. Can I still donate?", "Wait at least 24 hours after drinking. Alcohol dehydrates you and makes you more likely to feel faint."],
      ["I'm on antibiotics. Can I donate?", "Finish the course and wait until you've been well for at least a week. The screening staff will confirm."],
      ["Are there any side effects?", "Most people feel fine. Some feel light-headed briefly, or get a small bruise where the needle went in. Rest, fluids and a snack help."],
      ["How often can I donate?", "Men can give whole blood every 3 months and women every 4 months. Platelet donation can be more frequent."],
      ["What should I eat before donating?", "A normal, balanced meal 2–3 hours before, plus extra water. Skip very fatty food just before you donate."],
    ],
  ],
  [
    "Finding blood on BloodLink",
    [
      ["How quickly can BloodLink help me find blood?", "Bank results appear instantly. Donor alerts go out as soon as you raise a request, and you'll see a donor's contact details the moment they accept."],
      ["How do I check whether a blood bank has stock right now?", "Use the Blood Bank Directory or Find Blood. Each bank shows units per group and when stock was last updated. Always call to confirm before you travel."],
      ["How do I find the nearest blood bank?", "Allow location access and we'll sort banks by distance. You can also pick a state and district."],
      ["Where can I see upcoming camps?", "On the Camps page. Filter by location or date, and subscribe to hear about new camps in your district."],
      ["Is my number shared with donors?", "Only with donors who accept your request, so they can coordinate with you. Donors' numbers are shared with you only after they accept."],
    ],
  ],
  [
    "About BloodLink",
    [
      ["Is BloodLink free?", "Yes. It's free for patients, donors, blood banks and camp organisers."],
      ["Does BloodLink replace the hospital or blood bank?", "No. We help you find blood faster. Cross-matching, testing and transfusion are always done by the hospital or blood bank."],
      ["Who do I contact if something isn't working?", `Email us at ${SUPPORT} or use the contact form. We read every message.`],
    ],
  ],
];

export default function Page() {
  return (
    <>
      <PageHeader title="Frequently asked questions" sub="What donors and families usually ask us, all in one place." />
      <div className="container-page max-w-3xl space-y-10 py-12">
        {FAQS.map(([section, items]) => (
          <section key={section}>
            <p className="eyebrow">{section}</p>
            <div className="card mt-3 divide-y divide-line">
              {items.map(([q, a]) => (
                <details key={q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {q}
                    <span className="text-xl text-brand-600 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="rounded-2xl bg-brand-50 p-6">
          <p className="font-bold">Still have a question?</p>
          <p className="mt-1 text-sm text-muted">
            <a href={`mailto:${SUPPORT}`} className="text-brand-700 underline">Email us</a> or <Link href="/contact" className="text-brand-700 underline">send a message</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
