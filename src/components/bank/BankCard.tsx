"use client";

import { useState } from "react";
import { ShareButton } from "../ShareButton";
import { timeAgo } from "@/lib/client";

export type Bank = {
  id: string;
  name: string;
  category: "GOVERNMENT" | "PRIVATE" | "CHARITABLE" | "RED_CROSS";
  address: string;
  district: string;
  state: string;
  phone: string;
  lat: number;
  lng: number;
  verified: boolean;
  hasComponents: boolean;
  stockUpdatedAt: string;
  stockPublished: boolean;
  openingHours: string | null;
  units: number;
  groupsInStock: string[];
  stock: Record<string, number>;
  distanceKm: number | null;
};

export const CATEGORY_LABEL: Record<Bank["category"], string> = {
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  CHARITABLE: "Charitable / Voluntary",
  RED_CROSS: "Red Cross",
};

export function BankCard({ bank, showGroups = true }: { bank: Bank; showGroups?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const groups = expanded ? bank.groupsInStock : bank.groupsInStock.slice(0, 2);
  const more = bank.groupsInStock.length - groups.length;
  return (
    <article className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-bold leading-snug">
            {bank.name}
            {bank.verified && (
              <span title="Verified listing" className="ml-1.5 inline-flex translate-y-0.5 text-sky-600">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor"><path d="M10 1.5 12.3 3l2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L10 18.5 7.7 17l-2.7.2-.9-2.6L1.9 13l.9-2.6-.9-2.6 2.2-1.6.9-2.6L7.7 3 10 1.5Zm3.2 6.2a.9.9 0 0 0-1.3 0L9 10.6 7.9 9.5a.9.9 0 1 0-1.3 1.3l1.8 1.8c.4.3.9.3 1.3 0l3.5-3.6a.9.9 0 0 0 0-1.3Z" /></svg>
              </span>
            )}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {bank.district}
            {bank.distanceKm != null && `, ${bank.distanceKm} km`} · {CATEGORY_LABEL[bank.category]}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {bank.stockPublished ? (
            <>
              <p className={`font-display text-xl font-extrabold ${bank.units > 0 ? "text-ok" : "text-muted"}`}>{bank.units}</p>
              <p className="text-xs text-muted">units in stock</p>
            </>
          ) : (
            <p className="max-w-24 text-xs font-medium text-muted">Stock not published</p>
          )}
        </div>
      </div>
      {showGroups && bank.groupsInStock.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {groups.map((g) => (
            <span key={g} className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
              {g} · {bank.stock[g]}
            </span>
          ))}
          {more > 0 && (
            <button onClick={() => setExpanded(true)} className="rounded-md bg-paper px-2 py-0.5 text-xs font-semibold text-muted hover:text-ink">
              +{more} more
            </button>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <p className="text-xs text-muted">
          {bank.stockPublished ? `Stock updated ${timeAgo(bank.stockUpdatedAt)}` : bank.openingHours ? `Open ${bank.openingHours}` : "Call to confirm availability"}
        </p>
        <div className="flex items-center gap-1">
          <ShareButton
            title={bank.name}
            text={`${bank.name}, ${bank.address}. Phone: ${bank.phone}`}
            url={`https://www.openstreetmap.org/?mlat=${bank.lat}&mlon=${bank.lng}#map=16/${bank.lat}/${bank.lng}`}
          />
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
            Directions
          </a>
          <a href={`tel:${bank.phone}`} className="btn-primary px-4 py-2 text-xs">Call</a>
        </div>
      </div>
    </article>
  );
}
