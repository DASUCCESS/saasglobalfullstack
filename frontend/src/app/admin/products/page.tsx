"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiPatch, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";

type Product = {
  slug: string;
  name: string;
  tagline: string;
  short_description?: string;
  downloadable_zip_url?: string;
  price_usd: string | number;
  status: "published" | "hidden" | "upcoming";
  is_visible: boolean;
};

export default function Page() {
  const token = getToken();
  const { data, page, setPage, reload } = usePaginatedResource<Product>((p, s) => `/products/?page=${p}&page_size=${s}`, token, 10);
  const [selected, setSelected] = useState<Product | null>(null);
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10));

  const onSave = async () => {
    if (!selected) return;
    const res = await apiPatch<Product>(`/products/${selected.slug}/`, selected, token);
    if (!res) return alert("Save failed");
    alert("Product updated");
    reload();
  };

  const create = async () => {
    const now = Date.now();
    const payload = { name: "New Product", slug: `new-product-${now}`, tagline: "Add tagline", price_usd: 0, status: "hidden", is_visible: false };
    const res = await apiPost<Product>("/products/", payload, token);
    if (!res) return alert("Create failed");
    reload();
  };

  return (
    <AdminShell title="Products Management">
      <div className="grid xl:grid-cols-[320px_1fr] gap-6">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Products</h3><button onClick={create} className="px-3 py-1.5 rounded bg-brand-yellow text-black text-xs">New</button></div>
          <div className="mt-4 space-y-2 max-h-[520px] overflow-auto">
            {(data?.results || []).map((p) => (
              <button key={p.slug} onClick={() => setSelected({ ...p })} className="w-full text-left rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2">
                <p className="font-medium">{p.name}</p><p className="text-xs text-neutral-400">/{p.slug}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs"><button onClick={() => setPage(Math.max(1, page - 1))}>Prev</button><span>{page}/{totalPages}</span><button onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</button></div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          {!selected ? <p className="text-neutral-400">Select a product to edit.</p> : (
            <div className="grid gap-3">
              <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} placeholder="Name" />
              <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={selected.tagline} onChange={(e) => setSelected({ ...selected, tagline: e.target.value })} placeholder="Tagline" />
              <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={selected.downloadable_zip_url || ""} onChange={(e) => setSelected({ ...selected, downloadable_zip_url: e.target.value })} placeholder="ZIP URL" />
              <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={String(selected.price_usd)} onChange={(e) => setSelected({ ...selected, price_usd: e.target.value })} placeholder="USD Price" />
              <label className="text-sm"><input type="checkbox" checked={selected.is_visible} onChange={(e) => setSelected({ ...selected, is_visible: e.target.checked })} /> <span className="ml-2">Visible</span></label>
              <button onClick={onSave} className="mt-2 px-4 py-2 rounded bg-brand-yellow text-black">Save product</button>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
