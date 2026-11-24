import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = await prisma.notice.findUnique({ where: { id } });
  if (!n) notFound();
  return (
    <article className="container-page max-w-3xl py-10">
      <Link href="/notifications" className="btn-ghost -ml-3">← All notifications</Link>
      <h1 className="mt-6 text-3xl font-extrabold">{n.title}</h1>
      <p className="mt-2 text-sm text-muted">Published {formatDate(n.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</p>
      {n.body && <div className="card prose-bl mt-8 p-6"><p>{n.body}</p></div>}
      {n.fileUrl && <a href={n.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">Download document</a>}
    </article>
  );
}
