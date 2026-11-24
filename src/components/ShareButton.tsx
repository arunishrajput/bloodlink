"use client";

import { useState } from "react";

export function ShareButton({ title, text, url, className = "btn-ghost text-xs" }: { title: string; text: string; url?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const link = url ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
      } catch {}
      return;
    }
    await navigator.clipboard.writeText(`${text}\n${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" onClick={share} className={className} aria-label={`Share ${title}`}>
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13.5 6.5 6.5 10l7 3.5M15 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /></svg>
      {copied ? "Copied" : "Share"}
    </button>
  );
}
