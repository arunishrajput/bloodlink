import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdminEmail } from "@/lib/session";
import { formatDate } from "@/lib/client";
import { ToggleButton, BlogEditor, NoticeEditor, DeleteButton } from "@/components/admin/AdminActions";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const TABS = [["banks", "Blood banks"], ["camps", "Camps"], ["blog", "Blog"], ["notices", "Notifications"], ["pledges", "Pledges"], ["messages", "Messages"], ["subscriptions", "Camp alerts"]] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/organisation/login?next=/admin");
  if (user.role !== "ADMIN" && !isAdminEmail(user.email))
    return <div className="container-page py-20 text-center"><h1 className="text-2xl font-bold">Admins only</h1><p className="mt-2 text-muted">Your account doesn&apos;t have admin access.</p></div>;

  const { tab = "banks", q } = await searchParams;
  const counts = await Promise.all([prisma.bloodBank.count({ where: { verified: false } }), prisma.contactMessage.count(), prisma.pledge.count()]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">Admin</h1>
      <p className="text-sm text-muted">{counts[0]} banks awaiting verification · {counts[1]} messages · {counts[2]} pledges</p>
      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => <Link key={k} href={`/admin?tab=${k}`} className={`chip ${tab === k ? "chip-active" : ""}`}>{l}</Link>)}
      </nav>
      <div className="mt-6">
        {tab === "banks" && <Banks q={q} />}
        {tab === "camps" && <Camps />}
        {tab === "blog" && <Blog />}
        {tab === "notices" && <Notices />}
        {tab === "pledges" && <Pledges />}
        {tab === "messages" && <Messages />}
        {tab === "subscriptions" && <Subscriptions />}
      </div>
    </div>
  );
}

async function Banks({ q }: { q?: string }) {
  const banks = await prisma.bloodBank.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: [{ verified: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { org: { select: { name: true } } },
  });
  return (
    <div>
      <form className="mb-4 flex max-w-md gap-2"><input type="hidden" name="tab" value="banks" /><input name="q" defaultValue={q} className="input" placeholder="Search by name" /><button className="btn-secondary">Search</button></form>
      <div className="card divide-y divide-line">
        {banks.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-xs text-muted">{b.district}, {b.state} · {b.org?.name ?? "No organisation"} · Licence: {b.licenseNo || "—"} · {b.phone}</p>
            </div>
            <div className="flex gap-2">
              <ToggleButton url={`/api/admin/banks/${b.id}`} field="verified" value={b.verified} on="Verified" off="Verify" />
              <ToggleButton url={`/api/admin/banks/${b.id}`} field="active" value={b.active} on="Listed" off="Hidden" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function Camps() {
  const camps = await prisma.camp.findMany({ orderBy: { date: "desc" }, take: 100 });
  return (
    <div className="card divide-y divide-line">
      {camps.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-muted">{formatDate(c.date)} · {c.address}, {c.district} · {c.organisedBy}</p>
          </div>
          <div className="flex gap-2">
            <ToggleButton url={`/api/admin/camps/${c.id}`} field="verified" value={c.verified} on="Verified" off="Verify" />
            <ToggleButton url={`/api/admin/camps/${c.id}`} field="active" value={c.active} on="Listed" off="Hidden" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function Blog() {
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <div className="space-y-6">
      <BlogEditor />
      <div className="card divide-y divide-line">
        {posts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{p.title} {!p.published && <span className="text-xs text-muted">(draft)</span>}</p>
              <p className="text-xs text-muted">/{p.slug} · {formatDate(p.publishedAt)}</p>
            </div>
            <div className="flex gap-2">
              <BlogEditor post={JSON.parse(JSON.stringify(p))} />
              <DeleteButton url={`/api/admin/blog/${p.id}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function Notices() {
  const notices = await prisma.notice.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <div className="space-y-6">
      <NoticeEditor />
      <div className="card divide-y divide-line">
        {notices.map((n) => (
          <div key={n.id} className="flex items-center justify-between gap-3 p-4">
            <div><p className="font-semibold">{n.title}</p><p className="text-xs text-muted">{n.category} · {formatDate(n.publishedAt)}</p></div>
            <DeleteButton url={`/api/admin/notices/${n.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function Pledges() {
  const rows = await prisma.pledge.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-line text-xs uppercase text-muted"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Message</th><th className="p-3">Date</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-line/60"><td className="p-3">{r.name}</td><td className="p-3">{r.email}</td><td className="p-3">{r.phone}</td><td className="p-3 text-muted">{r.message}</td><td className="p-3">{formatDate(r.createdAt)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

async function Messages() {
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-muted">No messages yet.</p>}
      {rows.map((m) => (
        <article key={m.id} className="card p-5">
          <p className="font-semibold">{m.subject}</p>
          <p className="text-xs text-muted">{m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a> · {formatDate(m.createdAt)}</p>
          <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
        </article>
      ))}
    </div>
  );
}

async function Subscriptions() {
  const rows = await prisma.campSubscription.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-line text-xs uppercase text-muted"><th className="p-3">District</th><th className="p-3">State</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Date</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-line/60"><td className="p-3">{r.district}</td><td className="p-3">{r.state}</td><td className="p-3">{r.email}</td><td className="p-3">{r.phone}</td><td className="p-3">{formatDate(r.createdAt)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
