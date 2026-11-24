"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "../Modal";
import { api } from "@/lib/client";

export function ToggleButton({ url, field, value, on, off }: { url: string; field: string; value: boolean; on: string; off: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      className={`chip ${value ? "chip-active" : ""}`}
      onClick={async () => {
        setBusy(true);
        await api(url, { method: "PATCH", body: { [field]: !value } }).catch((e) => alert(e.message));
        router.refresh();
        setBusy(false);
      }}
    >
      {value ? on : off}
    </button>
  );
}

export function DeleteButton({ url }: { url: string }) {
  const router = useRouter();
  return (
    <button
      className="btn-ghost py-1.5 text-xs"
      onClick={async () => {
        if (!confirm("Delete this permanently?")) return;
        await api(url, { method: "DELETE" });
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}

type Post = { id: string; slug: string; title: string; excerpt: string; tag: string; category: "AWARENESS" | "NEWS"; coverImage: string; coverAlt: string; body: string; published: boolean };

export function BlogEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Omit<Post, "id">>(post ?? { slug: "", title: "", excerpt: "", tag: "", category: "AWARENESS", coverImage: "/covers/first-donation.svg", coverAlt: "", body: "", published: true });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (post) await api(`/api/admin/blog/${post.id}`, { method: "PATCH", body: f });
      else await api("/api/admin/blog", { body: f });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <button className={post ? "btn-ghost py-1.5 text-xs" : "btn-primary"} onClick={() => setOpen(true)}>{post ? "Edit" : "+ New post"}</button>
      <Modal open={open} onClose={() => setOpen(false)} title={post ? "Edit post" : "New post"} wide>
        <form onSubmit={save} className="space-y-3">
          <input className="input" placeholder="Title" required value={f.title} onChange={set("title")} />
          <input className="input" placeholder="slug-like-this" required value={f.slug} onChange={set("slug")} />
          <textarea className="input" placeholder="Excerpt" rows={2} required value={f.excerpt} onChange={set("excerpt")} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Tag (e.g. Eligibility)" required value={f.tag} onChange={set("tag")} />
            <select className="input" value={f.category} onChange={set("category")}><option value="AWARENESS">Awareness</option><option value="NEWS">News</option></select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Cover image URL" required value={f.coverImage} onChange={set("coverImage")} />
            <input className="input" placeholder="Cover alt text" required value={f.coverAlt} onChange={set("coverAlt")} />
          </div>
          <textarea className="input font-mono text-xs" rows={12} placeholder={"Body. Use ## for headings, - for bullet points, **bold**."} required value={f.body} onChange={set("body")} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Published</label>
          {error && <p className="text-sm text-brand-700">{error}</p>}
          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </>
  );
}

export function NoticeEditor() {
  const router = useRouter();
  const [f, setF] = useState({ title: "", category: "UPDATES", fileUrl: "", body: "" });
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/admin/notices", { body: f });
      setF({ title: "", category: "UPDATES", fileUrl: "", body: "" });
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={save} className="card grid gap-3 p-5 md:grid-cols-2">
      <p className="font-bold md:col-span-2">Publish a notification</p>
      <input className="input md:col-span-2" placeholder="Title" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
        <option value="NEWSLETTER">Newsletter</option><option value="GUIDELINES">Guidelines & circulars</option><option value="CHARGES">Charges & fees</option><option value="UPDATES">Updates</option>
      </select>
      <input className="input" type="url" placeholder="Document URL (PDF), optional" value={f.fileUrl} onChange={(e) => setF({ ...f, fileUrl: e.target.value })} />
      <textarea className="input md:col-span-2" rows={3} placeholder="Text (used when there's no document)" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      {error && <p className="text-sm text-brand-700 md:col-span-2">{error}</p>}
      <button className="btn-primary md:col-span-2">Publish</button>
    </form>
  );
}
