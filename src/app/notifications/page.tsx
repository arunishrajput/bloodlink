import type { Metadata } from "next";
import Link from "next/link";
import type { NoticeCategory, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { ListFilters } from "@/components/ListFilters";
import { formatDate } from "@/lib/client";

export const metadata: Metadata = { title: "Notifications", description: "Newsletters, guidelines, circulars and updates on blood donation." };
export const dynamic = "force-dynamic";

const CATEGORIES = [["", "All"], ["NEWSLETTER", "Newsletter"], ["GUIDELINES", "Guidelines & circulars"], ["CHARGES", "Charges & fees"], ["UPDATES", "Updates"]] as const;
const LABEL = Object.fromEntries(CATEGORIES) as Record<string, string>;

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; category?: string }> }) {
  const { q, sort, category } = await searchParams;
  const where: Prisma.NoticeWhereInput = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (category && category in LABEL && category) where.category = category as NoticeCategory;
  const orderBy: Prisma.NoticeOrderByWithRelationInput = sort === "oldest" ? { publishedAt: "asc" } : sort === "title" ? { title: "asc" } : { publishedAt: "desc" };
  const notices = await prisma.notice.findMany({ where, orderBy });
  const latestId = (await prisma.notice.findFirst({ orderBy: { publishedAt: "desc" }, select: { id: true } }))?.id;

  return (
    <>
      <PageHeader title="Notifications" sub="Newsletters, guidelines, circulars and updates on blood donation." />
      <div className="container-page py-10">
        <ListFilters placeholder="Search notifications…" categories={CATEGORIES} />
        <p className="mt-6 text-sm font-medium">{notices.length} notification{notices.length === 1 ? "" : "s"}</p>
        <ul className="card mt-4 divide-y divide-line">
          {notices.map((n) => (
            <li key={n.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-paper px-2 py-0.5 text-xs font-semibold text-muted">{LABEL[n.category]}</span>
                  {n.id === latestId && <span className="rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">Latest</span>}
                </div>
                <p className="mt-2 font-semibold">{n.title}</p>
                <p className="text-sm text-muted">Published {formatDate(n.publishedAt, { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
              {n.fileUrl ? (
                <a href={n.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary shrink-0 py-2 text-xs">Download</a>
              ) : (
                <Link href={`/notifications/${n.id}`} className="btn-secondary shrink-0 py-2 text-xs">View details</Link>
              )}
            </li>
          ))}
          {notices.length === 0 && <li className="p-10 text-center text-muted">No notifications match your search.</li>}
        </ul>
      </div>
    </>
  );
}
