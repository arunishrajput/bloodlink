"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatDate, formatTime } from "@/lib/client";

type Camp = { id: string; name: string; address: string; city: string; date: string; startTime: string; endTime: string; imageUrl: string | null; distanceKm: number | null };

export function NearbyCamps({ initial }: { initial: Camp[] }) {
  const [camps, setCamps] = useState(initial);
  const [status, setStatus] = useState<"locating" | "near" | "all">("locating");

  useEffect(() => {
    if (!("geolocation" in navigator)) return setStatus("all");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await api<{ camps: Camp[] }>(`/api/camps?range=month&sort=near&limit=3&lat=${coords.latitude}&lng=${coords.longitude}`);
          if (r.camps.length) setCamps(r.camps);
          setStatus("near");
        } catch {
          setStatus("all");
        }
      },
      () => setStatus("all"),
      { timeout: 8000, maximumAge: 600000 },
    );
  }, []);

  return (
    <>
      <p className="mt-1 text-sm text-muted">
        {status === "locating" ? "Finding camps near you…" : status === "near" ? "Closest to you this month" : "Coming up soon"}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {camps.map((c) => (
          <Link key={c.id} href="/camps" className="card group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative aspect-[16/9] bg-brand-50">
              <Image src={c.imageUrl ?? "/camps/camp-1.svg"} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="p-5">
              <p className="font-bold leading-snug group-hover:text-brand-700">{c.name}</p>
              <p className="mt-1 text-sm text-muted">
                {c.address}
                {c.distanceKm != null && ` · ${c.distanceKm} km`}
              </p>
              <p className="mt-3 text-sm font-medium text-brand-700">
                {formatDate(c.date)} · {formatTime(c.startTime)} – {formatTime(c.endTime)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
