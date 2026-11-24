"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useLang, useT } from "./providers";
import type { TKey } from "@/lib/i18n";

type Item = { href: string; key: TKey };
const MENUS: { key: TKey; items: Item[] }[] = [
  {
    key: "nav.findBlood",
    items: [
      { href: "/request", key: "nav.findNow" },
      { href: "/directory", key: "nav.directory" },
      { href: "/thalassemia", key: "nav.thalassemia" },
    ],
  },
  {
    key: "nav.donate",
    items: [
      { href: "/register", key: "nav.becomeDonor" },
      { href: "/camps", key: "nav.camps" },
      { href: "/donate", key: "nav.aboutDonating" },
    ],
  },
  {
    key: "nav.resources",
    items: [
      { href: "/blog", key: "nav.blog" },
      { href: "/about", key: "nav.about" },
      { href: "/faqs", key: "nav.faqs" },
      { href: "/notifications", key: "nav.notifications" },
      { href: "/organisation/login", key: "nav.orgLogin" },
    ],
  },
];

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Language" className="flex rounded-lg border border-line p-0.5 text-xs font-semibold">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2.5 py-1 ${lang === l ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}

export function Header({ signedIn }: { signedIn: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => !navRef.current?.contains(e.target as Node) && setOpen(null);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const account = (
    <Link href={signedIn ? "/profile" : "/login"} className="btn-primary px-4 py-2.5">
      {signedIn ? t("nav.profile") : t("nav.login")}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {MENUS.map((m) => (
            <div key={m.key} className="relative">
              <button
                className="btn-ghost text-ink"
                aria-expanded={open === m.key}
                onClick={() => setOpen(open === m.key ? null : m.key)}
              >
                {t(m.key)}
                <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open === m.key ? "rotate-180" : ""}`} fill="currentColor"><path d="M5.2 7.2a1 1 0 0 1 1.4 0L10 10.6l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L5.2 8.6a1 1 0 0 1 0-1.4Z" /></svg>
              </button>
              {open === m.key && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-line bg-card p-2 shadow-xl">
                  {m.items.map((i) => (
                    <Link key={i.href} href={i.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-brand-50 hover:text-brand-700">
                      {t(i.key)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LangToggle />
          {account}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LangToggle />
          <button className="rounded-lg p-2 hover:bg-brand-50" aria-label={t("nav.menu")} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobile ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {mobile && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper lg:hidden">
          <div className="container-page space-y-5 py-5">
            {account}
            {MENUS.map((m) => (
              <div key={m.key}>
                <p className="eyebrow mb-1">{t(m.key)}</p>
                {m.items.map((i) => (
                  <Link key={i.href} href={i.href} className="block border-b border-line py-3 font-medium last:border-0">
                    {t(i.key)}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
