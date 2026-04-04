"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function Page() {
  const token = getToken();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [canonical, setCanonical] = useState("");

  const save = async () => {
    if (!slug) return alert("Provide product slug");
    const res = await apiPatch(`/products/${slug}/`, { seo: { title, description, canonical } }, token);
    if (!res) return alert("Save failed");
    alert("SEO saved");
  };

  return <AdminShell title="SEO"><div className="max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Product slug" />
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SEO title" />
    <textarea className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="SEO description" />
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="Canonical URL" />
    <button onClick={save} className="w-fit px-4 py-2 rounded bg-brand-yellow text-black">Save</button>
  </div></AdminShell>;
}
