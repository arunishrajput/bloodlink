import Link from "next/link";
import { Logo } from "./Logo";
import { getT } from "@/lib/i18n-server";
import type { TKey } from "@/lib/i18n";

const COLS: { key: TKey; links: [string, TKey][] }[] = [
  { key: "nav.findBlood", links: [["/request", "nav.findNow"], ["/directory", "nav.directory"], ["/thalassemia", "nav.thalassemia"]] },
  { key: "nav.donate", links: [["/register", "nav.becomeDonor"], ["/camps", "nav.camps"], ["/donate", "nav.aboutDonating"]] },
  { key: "nav.org", links: [["/organisation/login", "nav.orgLogin"], ["/organisation/register-bank", "nav.registerBank"], ["/organisation/register-camp", "nav.registerCamp"]] },
  { key: "nav.resources", links: [["/blog", "nav.blog"], ["/about", "nav.about"], ["/faqs", "nav.faqs"], ["/notifications", "nav.notifications"]] },
  { key: "nav.legal", links: [["/terms", "nav.terms"], ["/privacy", "nav.privacy"], ["/accessibility", "nav.accessibility"], ["/contact", "nav.contact"], ["/sitemap", "nav.sitemap"]] },
];

export async function Footer() {
  const t = await getT();
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.2fr_3fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
          <p className="mt-6 text-xs text-muted">© {new Date().getFullYear()} BloodLink</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLS.map((c) => (
            <div key={c.key}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t(c.key)}</p>
              <ul className="mt-3 space-y-2.5">
                {c.links.map(([href, key]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-ink/80 hover:text-brand-700">{t(key)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page space-y-1.5 py-5 text-xs text-muted">
          <p>{t("footer.disclaimer")}</p>
          <p>
            Blood bank directory data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap contributors</a> (ODbL), including India&apos;s open government data on licensed blood banks. Map tiles © OpenStreetMap.
          </p>
        </div>
      </div>
    </footer>
  );
}
