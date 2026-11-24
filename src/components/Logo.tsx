import Link from "next/link";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2.5c-.6 0-1.1.3-1.5.8C11.2 7.6 6 14.6 6 19.6 6 25.3 10.5 29.5 16 29.5s10-4.2 10-9.9c0-5-5.2-12-8.5-16.3-.4-.5-.9-.8-1.5-.8Z" fill="#c41a33" />
      <path d="M12.2 20.4a2.8 2.8 0 0 1 0-4l1.6-1.6a2.8 2.8 0 0 1 4 0M19.8 18.6a2.8 2.8 0 0 1 0 4l-1.6 1.6a2.8 2.8 0 0 1-4 0M14.4 21.6l3.2-3.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink" aria-label="BloodLink home">
      <LogoMark />
      <span>
        Blood<span className="text-brand-600">Link</span>
      </span>
    </Link>
  );
}
