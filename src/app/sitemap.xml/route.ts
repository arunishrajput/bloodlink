import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATIC = ["", "/request", "/directory", "/camps", "/register", "/donate", "/blog", "/about", "/faqs", "/notifications", "/thalassemia", "/pledge", "/contact", "/terms", "/privacy", "/accessibility", "/sitemap", "/organisation/login"];

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const posts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, publishedAt: true } });
  const urls = [
    ...STATIC.map((p) => `<url><loc>${base}${p}</loc></url>`),
    ...posts.map((p) => `<url><loc>${base}/blog/${p.slug}</loc><lastmod>${p.publishedAt.toISOString()}</lastmod></url>`),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`, {
    headers: { "Content-Type": "application/xml" },
  });
}
