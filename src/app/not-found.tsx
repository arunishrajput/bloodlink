import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-md py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">It may have moved, or the link might be wrong.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/request" className="btn-secondary">Find blood</Link>
      </div>
    </div>
  );
}
