"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    eyebrow: "1 October",
    title: "National Voluntary Blood Donation Day",
    sub: "One unit can help up to three patients. Find a camp near you and give this October.",
    href: "/camps",
    cta: "Find a camp",
    tone: "from-brand-700 to-brand-500",
  },
  {
    eyebrow: "For organisers",
    title: "Run a blood donation drive at your workplace or college",
    sub: "List it on BloodLink in a few minutes so donors nearby can find it.",
    href: "/organisation/register-camp",
    cta: "List your camp",
    tone: "from-sky-800 to-sky-600",
  },
  {
    eyebrow: "Make it a habit",
    title: "Donate every three months, save lives all year",
    sub: "Register once and we'll only reach out when someone near you needs your blood group.",
    href: "/register",
    cta: "Become a donor",
    tone: "from-emerald-800 to-emerald-600",
  },
  {
    eyebrow: "Thalassemia care",
    title: "Some patients need blood every few weeks, for life",
    sub: "Regular donors make transfusions predictable for families living with thalassemia.",
    href: "/thalassemia",
    cta: "Learn how to help",
    tone: "from-violet-800 to-violet-600",
  },
];

export function Carousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Campaigns"
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {SLIDES.map((s, idx) => (
          <div
            key={s.title}
            aria-hidden={idx !== i}
            className={`relative flex min-h-[220px] w-full shrink-0 flex-col justify-center bg-gradient-to-br ${s.tone} px-6 py-10 text-white sm:px-12`}
          >
            <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-10 -bottom-16 h-72 w-72 opacity-15" aria-hidden="true">
              <path d="M100 10C88 30 40 90 40 125a60 60 0 0 0 120 0c0-35-48-95-60-115Z" fill="#fff" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{s.eyebrow}</p>
            <h2 className="mt-2 max-w-xl text-2xl font-extrabold sm:text-3xl">{s.title}</h2>
            <p className="mt-2 max-w-lg text-white/85">{s.sub}</p>
            <Link href={s.href} tabIndex={idx === i ? 0 : -1} className="btn mt-5 w-fit bg-white text-ink hover:bg-white/90">
              {s.cta}
            </Link>
          </div>
        ))}
      </div>
      <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.title}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === i}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
