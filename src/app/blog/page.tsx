import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { ListFilters } from "@/components/ListFilters";
import { formatDate } from "@/lib/client";

export const metadata: Metadata = { title: "Blog", description: "Stories, awareness and news about blood donation." };
export const dynamic = "force-dynamic";

const CATEGORIES = [["", "All"], ["AWARENESS", "Awareness"], ["NEWS", "BloodLink news"]] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; category?: string }> }) {
  const { q, sort, category } = await searchParams;
  const where: Prisma.BlogPostWhereInput = { published: true };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }];
  if (category === "AWARENESS" || category === "NEWS") where.category = category;
  const orderBy: Prisma.BlogPostOrderByWithRelationInput = sort === "oldest" ? { publishedAt: "asc" } : sort === "title" ? { title: "asc" } : { publishedAt: "desc" };
  const posts = await prisma.blogPost.findMany({ where, orderBy });

  return (
    <>
      <PageHeader title="Blog" sub="Stories, explainers and news about blood donation." />
      <div className="container-page py-10">
        <ListFilters placeholder="Search posts…" categories={CATEGORIES} />
        <p className="mt-6 text-sm font-medium">{posts.length} post{posts.length === 1 ? "" : "s"}</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[16/9]">
                <Image src={p.coverImage} alt={p.coverAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <p className="text-xs text-muted">{p.category === "NEWS" ? "BloodLink news" : "Awareness"} · {formatDate(p.publishedAt, { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="eyebrow mt-3">{p.tag}</p>
                <h2 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-700">{p.title}</h2>
                <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p className="card mt-4 p-10 text-center text-muted">No posts match your search.</p>}
      </div>
    </>
  );
}
