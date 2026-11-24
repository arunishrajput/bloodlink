import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStats, upcomingCamps } from "@/lib/queries";
import { getT } from "@/lib/i18n-server";
import { compactNumber, formatDate } from "@/lib/client";
import { Carousel } from "@/components/home/Carousel";
import { NearbyCamps } from "@/components/home/NearbyCamps";
import { EmergencyCard } from "@/components/home/EmergencyCard";
import { EligibilitySection } from "@/components/home/EligibilitySection";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "1", title: "Share the blood group and location", body: "One screen: the patient's blood group and where they are, using GPS or state and district." },
  { n: "2", title: "We check live bank stock", body: "We search blood banks nearby for the group you need and every compatible group, sorted by distance." },
  { n: "3", title: "Banks short? We ask donors", body: "If banks can't help, we alert compatible donors nearby and keep widening the search until someone says yes." },
];

export default async function Home() {
  const t = await getT();
  const [stats, camps, posts] = await Promise.all([
    getStats(),
    upcomingCamps(3),
    prisma.blogPost.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_10%,var(--color-brand-100),transparent)]" />
        <div className="container-page relative grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-card px-3 py-1 text-xs font-semibold text-brand-700">
              ● {t("home.badge")}
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold sm:text-6xl">
              {t("home.title1")}
              <br />
              <span className="text-brand-600">{t("home.title2")}</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">{t("home.sub")}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/register" className="btn-primary px-7 py-4 text-base">{t("home.registerCta")}</Link>
              <Link href="/directory" className="text-sm font-medium text-ink underline decoration-brand-300 underline-offset-4 hover:text-brand-700">
                {t("home.walkIn")} →
              </Link>
            </div>
          </div>
          <EmergencyCard />
        </div>
      </section>

      <section className="border-y border-line bg-card">
        <dl className="container-page grid grid-cols-2 divide-line py-8 sm:grid-cols-4 sm:divide-x">
          {[
            [compactNumber(stats.donors), t("home.stats.donors")],
            [compactNumber(stats.banks), t("home.stats.banks")],
            [compactNumber(stats.camps), t("home.stats.camps")],
            [String(stats.states), t("home.stats.states")],
          ].map(([v, l]) => (
            <div key={l} className="px-4 py-3 text-center">
              <dt className="sr-only">{l}</dt>
              <dd className="font-display text-3xl font-extrabold text-brand-700 sm:text-4xl">{v}</dd>
              <dd className="mt-1 text-sm text-muted">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="container-page space-y-20 py-16">
        <Carousel />

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold">{t("home.camps")}</h2>
            <Link href="/camps" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">{t("home.viewCamps")} →</Link>
          </div>
          <NearbyCamps initial={JSON.parse(JSON.stringify(camps.map((c) => ({ ...c, distanceKm: null }))))} />
        </section>

        <section className="grid gap-6 rounded-2xl bg-ink p-6 text-white sm:p-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">{t("home.orgEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{t("home.orgTitle")}</h2>
            <Link href="/organisation/login" className="mt-4 inline-block text-sm font-semibold text-brand-200 hover:underline">{t("home.orgLink")} →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["/organisation/register-bank", "Register a blood bank", "List your bank and keep its stock up to date."],
              ["/organisation/register-camp", "Register a blood camp", "Tell donors nearby about your donation drive."],
            ].map(([href, title, body]) => (
              <Link key={href} href={href} className="group rounded-xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/10">
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm text-white/70">{body}</p>
                <p className="mt-4 text-sm font-semibold text-brand-200 group-hover:underline">Get started →</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow">{t("home.howEyebrow")}</p>
          <h2 className="mt-2 text-3xl font-extrabold">{t("home.howTitle")}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{s.n}</span>
                <p className="mt-4 text-lg font-bold">{s.title}</p>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <EligibilitySection />

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.blogEyebrow")}</p>
              <h2 className="mt-2 text-3xl font-extrabold">{t("home.blogTitle")}</h2>
            </div>
            <Link href="/blog" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">{t("home.viewPosts")} →</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/9]">
                  <Image src={p.coverImage} alt={p.coverAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <p className="eyebrow">{p.tag}</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug group-hover:text-brand-700">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                  <p className="mt-3 text-xs text-muted">{formatDate(p.publishedAt, { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start gap-6 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">{t("home.pledgeEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{t("home.pledgeTitle")}</h2>
            <p className="mt-2 max-w-xl text-muted">{t("home.pledgeSub")}</p>
          </div>
          <Link href="/pledge" className="btn-primary shrink-0">{t("home.pledgeCta")}</Link>
        </section>
      </div>
    </>
  );
}
