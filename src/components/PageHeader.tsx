import Link from "next/link";

export function PageHeader({ title, sub, crumbs = [] }: { title: string; sub?: string; crumbs?: [string, string][] }) {
  return (
    <div className="border-b border-line bg-card">
      <div className="container-page py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          {crumbs.map(([href, label]) => (
            <span key={href}> / <Link href={href} className="hover:text-brand-700">{label}</Link></span>
          ))}
          <span> / <span className="text-ink">{title}</span></span>
        </nav>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-muted">{sub}</p>}
      </div>
    </div>
  );
}
