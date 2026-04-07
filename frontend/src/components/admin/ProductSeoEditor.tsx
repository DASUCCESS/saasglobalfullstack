"use client";

export type ProductSeoForm = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
};

type Props = {
  value: ProductSeoForm;
  onChange: (value: ProductSeoForm) => void;
};

export function normalizeProductSeo(raw?: Record<string, unknown>): ProductSeoForm {
  const seo = raw || {};

  return {
    meta_title: String(seo.meta_title || ""),
    meta_description: String(seo.meta_description || ""),
    meta_keywords: String(seo.meta_keywords || ""),
    canonical_url: String(seo.canonical_url || ""),
    og_title: String(seo.og_title || ""),
    og_description: String(seo.og_description || ""),
    og_image: String(seo.og_image || ""),
  };
}

export function serializeProductSeo(value: ProductSeoForm) {
  return {
    meta_title: value.meta_title.trim(),
    meta_description: value.meta_description.trim(),
    meta_keywords: value.meta_keywords.trim(),
    canonical_url: value.canonical_url.trim(),
    og_title: value.og_title.trim(),
    og_description: value.og_description.trim(),
    og_image: value.og_image.trim(),
  };
}

export default function ProductSeoEditor({ value, onChange }: Props) {
  const update = <K extends keyof ProductSeoForm>(key: K, nextValue: ProductSeoForm[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
          value={value.meta_title}
          onChange={(e) => update("meta_title", e.target.value)}
          placeholder="Meta title"
        />
        <input
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
          value={value.meta_keywords}
          onChange={(e) => update("meta_keywords", e.target.value)}
          placeholder="Meta keywords"
        />
      </div>

      <textarea
        className="min-h-24 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
        value={value.meta_description}
        onChange={(e) => update("meta_description", e.target.value)}
        placeholder="Meta description"
      />

      <input
        className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
        value={value.canonical_url}
        onChange={(e) => update("canonical_url", e.target.value)}
        placeholder="Canonical URL"
      />

      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
          value={value.og_title}
          onChange={(e) => update("og_title", e.target.value)}
          placeholder="Open Graph title"
        />
        <input
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
          value={value.og_image}
          onChange={(e) => update("og_image", e.target.value)}
          placeholder="Open Graph image URL"
        />
      </div>

      <textarea
        className="min-h-24 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
        value={value.og_description}
        onChange={(e) => update("og_description", e.target.value)}
        placeholder="Open Graph description"
      />
    </div>
  );
}
