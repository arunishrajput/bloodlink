import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { formatDate } from "@/lib/client";
import { ShareButton } from "@/components/ShareButton";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt, openGraph: { images: [post.coverImage] } } : {};
}

export default async function Page({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const more = await prisma.blogPost.findMany({ where: { published: true, id: { not: post.id } }, orderBy: { publishedAt: "desc" }, take: 3 });

  return (
    <article className="container-page max-w-3xl py-10">
      <Link href="/blog" className="btn-ghost -ml-3">← All posts</Link>
      <p className="eyebrow mt-6">{post.tag}</p>
      <h1 className="mt-2 text-3xl leading-tight font-extrabold sm:text-5xl">{post.title}</h1>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{formatDate(post.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</p>
        <ShareButton title={post.title} text={post.excerpt} className="btn-secondary px-4 py-2 text-xs" />
      </div>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image src={post.coverImage} alt={post.coverAlt} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" />
      </div>
      <p className="mt-8 text-lg text-muted">{post.excerpt}</p>
      <Markdown source={post.body} />
      <aside className="mt-16 border-t border-line pt-10">
        <h2 className="text-xl font-bold">Keep reading</h2>
        <ul className="mt-4 space-y-3">
          {more.map((m) => (
            <li key={m.id}><Link href={`/blog/${m.slug}`} className="font-semibold text-brand-700 hover:underline">{m.title}</Link></li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
