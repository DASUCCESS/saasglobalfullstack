"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ProductContentEditor, {
  normalizeProductContent,
  ProductContentForm,
  serializeProductContent,
} from "@/components/admin/ProductContentEditor";
import ProductSeoEditor, {
  normalizeProductSeo,
  ProductSeoForm,
  serializeProductSeo,
} from "@/components/admin/ProductSeoEditor";
import SubscriptionPlansEditor, { SubscriptionPlanForm } from "@/components/admin/SubscriptionPlansEditor";
import { AdminEmpty, AdminPanel } from "@/components/admin/ui/AdminUI";
import { apiDelete, apiGet, apiPatch, apiPost, apiUploadResult } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";
import { toast } from "@/lib/toast";

type ProductStatus = "published" | "hidden" | "upcoming";
type DeliveryType = "none" | "download" | "access" | "both";
type EditorMode = "create" | "edit";

type Product = {
  id?: number;
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  short_description?: string;
  image_url?: string;
  downloadable_zip_url?: string;
  access_url?: string;
  access_label?: string;
  access_instructions?: string;
  demo_url?: string;
  support_url?: string;
  support_email?: string;
  price_usd: string | number;
  promotion_enabled?: boolean;
  promotion_price_usd?: string | number | null;
  promotion_start_at?: string | null;
  promotion_end_at?: string | null;
  subscription_enabled?: boolean;
  subscription_plans?: SubscriptionPlanForm[];
  status: ProductStatus;
  is_visible: boolean;
  delivery_type: DeliveryType;
  content?: Record<string, unknown>;
  seo?: Record<string, unknown>;
};

const emptyContent: ProductContentForm = {
  hero_title: "",
  hero_description: "",
  kpis: [],
  features: [],
  steps: [],
  benefits: [],
  faq: [],
};

const emptySeo: ProductSeoForm = {
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
};

const emptyProduct: Product = {
  slug: "",
  name: "",
  badge: "",
  tagline: "",
  short_description: "",
  image_url: "",
  downloadable_zip_url: "",
  access_url: "",
  access_label: "",
  access_instructions: "",
  demo_url: "",
  support_url: "",
  support_email: "",
  price_usd: 0,
  promotion_enabled: false,
  promotion_price_usd: null,
  promotion_start_at: "",
  promotion_end_at: "",
  subscription_enabled: false,
  subscription_plans: [],
  status: "hidden",
  is_visible: false,
  delivery_type: "download",
  content: {},
  seo: {},
};

export default function Page() {
  const token = getToken();
  const [mode, setMode] = useState<EditorMode>("create");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selected, setSelected] = useState<Product>({ ...emptyProduct });
  const [content, setContent] = useState<ProductContentForm>(emptyContent);
  const [seo, setSeo] = useState<ProductSeoForm>(emptySeo);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanForm[]>([]);

  const { data, page, setPage, reload, loading } = usePaginatedResource<Product>(
    (p, s) => `/products/?page=${p}&page_size=${s}`,
    token,
    10
  );

  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10));

  const filteredProducts = useMemo(() => {
    const rows = data?.results || [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => {
      return (
        item.name?.toLowerCase().includes(term) ||
        item.slug?.toLowerCase().includes(term) ||
        item.tagline?.toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const resetEditor = () => {
    setMode("create");
    setSelectedSlug("");
    setSelected({ ...emptyProduct });
    setContent(emptyContent);
    setSeo(emptySeo);
    setSubscriptionPlans([]);
  };

  const loadProductForEdit = async (slug: string) => {
    if (!slug) return;
    setLoadingDetail(true);

    const res = await apiGet<Product>(`/products/${slug}/`, token);
    setLoadingDetail(false);

    if (!res) {
      toast.error("Could not load product details.");
      return;
    }

    setMode("edit");
    setSelectedSlug(res.slug);
    setSelected({
      ...emptyProduct,
      ...res,
    });
    setSubscriptionPlans(
      (res.subscription_plans || []).map((plan) => ({
        id: plan.id || "",
        name: plan.name || "",
        billing_period: plan.billing_period || "",
        price_usd: String(plan.price_usd || ""),
      }))
    );
    setContent(normalizeProductContent(res.content));
    setSeo(normalizeProductSeo(res.seo));
  };

  const handleDelete = async (slug: string, name: string) => {
    const confirmed = window.confirm(`Delete product "${name}"?`);
    if (!confirmed) return;

    await apiDelete(`/products/${slug}/`, token);

    if (selectedSlug === slug) {
      resetEditor();
    }

    toast.success("Product deleted.");
    reload();
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await apiUploadResult<{ url: string }>("/products/upload-image/", formData, token);
    setUploadingImage(false);

    if (!res.ok || !res.data?.url) {
      toast.error(res.error?.detail || "Image upload failed.");
      return;
    }

    setSelected((prev) => ({ ...prev, image_url: res.data?.url || "" }));
    toast.success("Image uploaded.");
  };

  const buildPayload = () => {
    return {
      ...selected,
      price_usd: Number(selected.price_usd || 0),
      promotion_price_usd:
        selected.promotion_price_usd === "" || selected.promotion_price_usd == null
          ? null
          : Number(selected.promotion_price_usd),
      promotion_start_at: selected.promotion_start_at || null,
      promotion_end_at: selected.promotion_end_at || null,
      subscription_plans: subscriptionPlans
        .map((plan) => ({
          id: plan.id.trim(),
          name: plan.name.trim(),
          billing_period: plan.billing_period.trim(),
          price_usd: Number(plan.price_usd || 0),
        }))
        .filter((plan) => plan.id && plan.name && plan.billing_period && plan.price_usd > 0),
      content: serializeProductContent(content),
      seo: serializeProductSeo(seo),
    };
  };

  const handleCreate = async () => {
    if (!selected.name.trim() || !selected.slug.trim()) {
      toast.error("Product name and slug are required.");
      return;
    }

    setSaving(true);
    const res = await apiPost<Product>("/products/", buildPayload(), token);
    setSaving(false);

    if (!res) {
      toast.error("Product creation failed.");
      return;
    }

    toast.success("Product created successfully.");
    reload();
    await loadProductForEdit(res.slug);
  };

  const handleUpdate = async () => {
    if (!selected.slug.trim()) {
      toast.error("Product slug is required.");
      return;
    }

    setSaving(true);
    const res = await apiPatch<Product>(`/products/${selectedSlug || selected.slug}/`, buildPayload(), token);
    setSaving(false);

    if (!res) {
      toast.error("Product update failed.");
      return;
    }

    toast.success("Product updated successfully.");
    reload();
    await loadProductForEdit(res.slug);
  };

  return (
    <AdminShell title="Products Management">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="font-semibold">Products</h3>
            <button
              onClick={resetEditor}
              className="cursor-pointer rounded bg-brand-yellow px-3 py-2 text-sm font-medium text-black"
            >
              Create New Product
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
              placeholder="Search name, slug, tagline"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              onClick={() => setSearch(searchInput)}
              className="cursor-pointer rounded-lg border border-neutral-700 px-3 py-2"
            >
              Search
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[700px] overflow-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.slug}
                className={`rounded-xl border p-4 ${
                  selectedSlug === product.slug && mode === "edit"
                    ? "border-brand-yellow bg-neutral-800"
                    : "border-neutral-800 bg-neutral-950"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{product.name}</p>
                    <p className="mt-1 text-xs text-neutral-400">/{product.slug}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-neutral-700 px-2 py-1 uppercase">
                        {product.status}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-2 py-1">
                        ${product.price_usd}
                      </span>
                      <span className="rounded-full border border-neutral-700 px-2 py-1">
                        {product.is_visible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => loadProductForEdit(product.slug)}
                      className="cursor-pointer rounded border border-neutral-700 px-3 py-2 text-xs hover:bg-neutral-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.slug, product.name)}
                      className="cursor-pointer rounded border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && !filteredProducts.length && <AdminEmpty text="No products found." />}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              className="cursor-pointer rounded border border-neutral-700 px-3 py-1.5 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Prev
            </button>
            <span>
              {page}/{totalPages}
            </span>
            <button
              className="cursor-pointer rounded border border-neutral-700 px-3 py-1.5 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
            >
              Next
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
          {loadingDetail ? (
            <p className="text-neutral-400">Loading product details...</p>
          ) : (
            <div className="grid gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    {mode === "create" ? "Create Mode" : "Edit Mode"}
                  </p>
                  <h3 className="text-xl font-semibold">
                    {mode === "create" ? "Create Product" : `Edit Product: ${selected.name || selected.slug}`}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mode === "edit" && selected.slug ? (
                    <button
                      onClick={() => handleDelete(selected.slug, selected.name || selected.slug)}
                      className="cursor-pointer rounded border border-red-800 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
                    >
                      Delete Product
                    </button>
                  ) : null}

                  <button
                    onClick={mode === "create" ? handleCreate : handleUpdate}
                    disabled={saving}
                    className="cursor-pointer rounded bg-brand-yellow px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                  >
                    {saving ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
                  </button>
                </div>
              </div>

              <AdminPanel title="Basic Information">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.name}
                    onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                    placeholder="Product name"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.slug}
                    onChange={(e) => setSelected({ ...selected, slug: e.target.value })}
                    placeholder="Product slug"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.badge || ""}
                    onChange={(e) => setSelected({ ...selected, badge: e.target.value })}
                    placeholder="Badge"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.tagline}
                    onChange={(e) => setSelected({ ...selected, tagline: e.target.value })}
                    placeholder="Tagline"
                  />

                  <textarea
                    className="min-h-28 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 md:col-span-2"
                    value={selected.short_description || ""}
                    onChange={(e) => setSelected({ ...selected, short_description: e.target.value })}
                    placeholder="Short description"
                  />

                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 md:col-span-2"
                    value={selected.image_url || ""}
                    onChange={(e) => setSelected({ ...selected, image_url: e.target.value })}
                    placeholder="Image URL"
                  />

                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">
                      {uploadingImage ? "Uploading..." : "Upload Product Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file);
                        }}
                      />
                    </label>
                  </div>

                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={String(selected.price_usd)}
                    onChange={(e) => setSelected({ ...selected, price_usd: e.target.value })}
                    placeholder="USD price"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!selected.promotion_enabled}
                      onChange={(e) => setSelected({ ...selected, promotion_enabled: e.target.checked })}
                    />
                    Enable promotion
                  </label>

                  {!!selected.promotion_enabled ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                        value={selected.promotion_price_usd ?? ""}
                        onChange={(e) => setSelected({ ...selected, promotion_price_usd: e.target.value })}
                        placeholder="Promotion USD price"
                      />
                      <input
                        type="datetime-local"
                        className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                        value={(selected.promotion_start_at || "").slice(0, 16)}
                        onChange={(e) => setSelected({ ...selected, promotion_start_at: e.target.value })}
                      />
                      <input
                        type="datetime-local"
                        className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                        value={(selected.promotion_end_at || "").slice(0, 16)}
                        onChange={(e) => setSelected({ ...selected, promotion_end_at: e.target.value })}
                      />
                    </>
                  ) : null}

                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      checked={!!selected.subscription_enabled}
                      onChange={(e) => setSelected({ ...selected, subscription_enabled: e.target.checked })}
                    />
                    Enable subscription mode
                  </label>

                  {!!selected.subscription_enabled ? (
                    <div className="md:col-span-2">
                      <SubscriptionPlansEditor value={subscriptionPlans} onChange={setSubscriptionPlans} />
                    </div>
                  ) : null}

                  <select
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.status}
                    onChange={(e) => setSelected({ ...selected, status: e.target.value as ProductStatus })}
                  >
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                    <option value="upcoming">Upcoming</option>
                  </select>

                  <select
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.delivery_type}
                    onChange={(e) => setSelected({ ...selected, delivery_type: e.target.value as DeliveryType })}
                  >
                    <option value="none">No fulfillment</option>
                    <option value="download">Download only</option>
                    <option value="access">Access only</option>
                    <option value="both">Download and Access</option>
                  </select>

                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={selected.is_visible}
                      onChange={(e) => setSelected({ ...selected, is_visible: e.target.checked })}
                    />
                    <span className="ml-2">Visible publicly</span>
                  </label>
                </div>
              </AdminPanel>

              <AdminPanel title="Access and Delivery">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.downloadable_zip_url || ""}
                    onChange={(e) => setSelected({ ...selected, downloadable_zip_url: e.target.value })}
                    placeholder="Download ZIP URL"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.demo_url || ""}
                    onChange={(e) => setSelected({ ...selected, demo_url: e.target.value })}
                    placeholder="Demo URL"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.access_url || ""}
                    onChange={(e) => setSelected({ ...selected, access_url: e.target.value })}
                    placeholder="Access URL"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.access_label || ""}
                    onChange={(e) => setSelected({ ...selected, access_label: e.target.value })}
                    placeholder="Access Label"
                  />
                  <textarea
                    className="min-h-24 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 md:col-span-2"
                    value={selected.access_instructions || ""}
                    onChange={(e) => setSelected({ ...selected, access_instructions: e.target.value })}
                    placeholder="Access instructions"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.support_url || ""}
                    onChange={(e) => setSelected({ ...selected, support_url: e.target.value })}
                    placeholder="Support URL"
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                    value={selected.support_email || ""}
                    onChange={(e) => setSelected({ ...selected, support_email: e.target.value })}
                    placeholder="Support email"
                  />
                </div>
              </AdminPanel>

              <AdminPanel title="Product Content Builder">
                <ProductContentEditor value={content} onChange={setContent} />
              </AdminPanel>

              <AdminPanel title="SEO Settings">
                <ProductSeoEditor value={seo} onChange={setSeo} />
              </AdminPanel>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
