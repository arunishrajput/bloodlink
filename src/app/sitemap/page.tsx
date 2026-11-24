import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Sitemap" };

const GROUPS: [string, [string, string][]][] = [
  ["Looking for blood", [["/request", "Find Blood Now"], ["/directory", "Blood Bank Directory"], ["/thalassemia", "Thalassemia & Recurring Requests"]]],
  ["Donate blood", [["/register", "Become a Donor"], ["/camps", "Upcoming Camps"], ["/donate", "About Donating"], ["/pledge", "Pledge your support"]]],
  ["Your account", [["/login", "Sign in"], ["/profile", "Your profile"]]],
  ["Organisation", [["/organisation/login", "Organisation login"], ["/organisation", "Dashboard"], ["/organisation/register-bank", "Register a Bank"], ["/organisation/register-camp", "Register a Camp"]]],
  ["Resources", [["/blog", "Stories & Awareness"], ["/about", "About Us"], ["/faqs", "FAQs"], ["/notifications", "Notifications"]]],
  ["Legal", [["/terms", "Terms & Conditions"], ["/privacy", "Privacy Policy"], ["/accessibility", "Accessibility Statement"], ["/contact", "Contact Us"]]],
];

export default function Page() {
  return (
    <>
      <PageHeader title="Sitemap" />
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map(([g, links]) => (
          <section key={g}>
            <h2 className="text-lg font-bold">{g}</h2>
            <ul className="mt-3 space-y-2">
              {links.map(([href, l]) => <li key={href}><Link href={href} className="text-brand-700 hover:underline">{l}</Link></li>)}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
