"use client";

type KPI = { key: string; sub: string };
type Feature = { title: string; description: string };
type Step = { title: string; description: string };
type FAQ = { q: string; a: string };

export type ProductContentForm = {
  hero_title: string;
  hero_description: string;
  kpis: KPI[];
  features: Feature[];
  steps: Step[];
  benefits: string[];
  faq: FAQ[];
};

type Props = {
  value: ProductContentForm;
  onChange: (value: ProductContentForm) => void;
};

function SectionTitle({ title }: { title: string }) {
  return <h4 className="text-sm font-semibold text-neutral-200">{title}</h4>;
}

export function normalizeProductContent(raw?: Record<string, unknown>): ProductContentForm {
  const content = raw || {};

  return {
    hero_title: String(content.hero_title || ""),
    hero_description: String(content.hero_description || ""),
    kpis: Array.isArray(content.kpis)
      ? content.kpis.map((item) => ({
          key: String((item as Record<string, unknown>)?.key || ""),
          sub: String((item as Record<string, unknown>)?.sub || ""),
        }))
      : [],
    features: Array.isArray(content.features)
      ? content.features.map((item) => ({
          title: String((item as Record<string, unknown>)?.title || ""),
          description: String((item as Record<string, unknown>)?.description || ""),
        }))
      : [],
    steps: Array.isArray(content.steps)
      ? content.steps.map((item) => ({
          title: String((item as Record<string, unknown>)?.title || ""),
          description: String((item as Record<string, unknown>)?.description || ""),
        }))
      : [],
    benefits: Array.isArray(content.benefits) ? content.benefits.map((item) => String(item || "")) : [],
    faq: Array.isArray(content.faq)
      ? content.faq.map((item) => ({
          q: String((item as Record<string, unknown>)?.q || ""),
          a: String((item as Record<string, unknown>)?.a || ""),
        }))
      : [],
  };
}

export function serializeProductContent(value: ProductContentForm) {
  return {
    hero_title: value.hero_title.trim(),
    hero_description: value.hero_description.trim(),
    kpis: value.kpis.filter((item) => item.key.trim() || item.sub.trim()),
    features: value.features.filter((item) => item.title.trim() || item.description.trim()),
    steps: value.steps.filter((item) => item.title.trim() || item.description.trim()),
    benefits: value.benefits.map((item) => item.trim()).filter(Boolean),
    faq: value.faq.filter((item) => item.q.trim() || item.a.trim()),
  };
}

export default function ProductContentEditor({ value, onChange }: Props) {
  const update = <K extends keyof ProductContentForm>(key: K, nextValue: ProductContentForm[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <SectionTitle title="Hero Section" />
        <input
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
          value={value.hero_title}
          onChange={(e) => update("hero_title", e.target.value)}
          placeholder="Hero title"
        />
        <textarea
          className="min-h-24 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
          value={value.hero_description}
          onChange={(e) => update("hero_description", e.target.value)}
          placeholder="Hero description"
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle title="KPIs" />
          <button
            type="button"
            onClick={() => update("kpis", [...value.kpis, { key: "", sub: "" }])}
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-800"
          >
            Add KPI
          </button>
        </div>
        <div className="grid gap-3">
          {value.kpis.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={item.key}
                onChange={(e) =>
                  update(
                    "kpis",
                    value.kpis.map((row, i) => (i === index ? { ...row, key: e.target.value } : row))
                  )
                }
                placeholder="KPI value"
              />
              <input
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
                value={item.sub}
                onChange={(e) =>
                  update(
                    "kpis",
                    value.kpis.map((row, i) => (i === index ? { ...row, sub: e.target.value } : row))
                  )
                }
                placeholder="KPI label"
              />
              <button
                type="button"
                onClick={() => update("kpis", value.kpis.filter((_, i) => i !== index))}
                className="cursor-pointer rounded border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle title="Features" />
          <button
            type="button"
            onClick={() => update("features", [...value.features, { title: "", description: "" }])}
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-800"
          >
            Add Feature
          </button>
        </div>
        {value.features.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <input
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item.title}
              onChange={(e) =>
                update(
                  "features",
                  value.features.map((row, i) => (i === index ? { ...row, title: e.target.value } : row))
                )
              }
              placeholder="Feature title"
            />
            <textarea
              className="min-h-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item.description}
              onChange={(e) =>
                update(
                  "features",
                  value.features.map((row, i) => (i === index ? { ...row, description: e.target.value } : row))
                )
              }
              placeholder="Feature description"
            />
            <button
              type="button"
              onClick={() => update("features", value.features.filter((_, i) => i !== index))}
              className="w-fit cursor-pointer rounded border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle title="Steps" />
          <button
            type="button"
            onClick={() => update("steps", [...value.steps, { title: "", description: "" }])}
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-800"
          >
            Add Step
          </button>
        </div>
        {value.steps.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <input
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item.title}
              onChange={(e) =>
                update(
                  "steps",
                  value.steps.map((row, i) => (i === index ? { ...row, title: e.target.value } : row))
                )
              }
              placeholder="Step title"
            />
            <textarea
              className="min-h-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item.description}
              onChange={(e) =>
                update(
                  "steps",
                  value.steps.map((row, i) => (i === index ? { ...row, description: e.target.value } : row))
                )
              }
              placeholder="Step description"
            />
            <button
              type="button"
              onClick={() => update("steps", value.steps.filter((_, i) => i !== index))}
              className="w-fit cursor-pointer rounded border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle title="Benefits" />
          <button
            type="button"
            onClick={() => update("benefits", [...value.benefits, ""])}
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-800"
          >
            Add Benefit
          </button>
        </div>
        {value.benefits.map((item, index) => (
          <div key={index} className="flex gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <input
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item}
              onChange={(e) =>
                update(
                  "benefits",
                  value.benefits.map((row, i) => (i === index ? e.target.value : row))
                )
              }
              placeholder="Benefit text"
            />
            <button
              type="button"
              onClick={() => update("benefits", value.benefits.filter((_, i) => i !== index))}
              className="cursor-pointer rounded border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle title="FAQ" />
          <button
            type="button"
            onClick={() => update("faq", [...value.faq, { q: "", a: "" }])}
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-800"
          >
            Add FAQ
          </button>
        </div>
        {value.faq.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <input
              className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item.q}
              onChange={(e) =>
                update(
                  "faq",
                  value.faq.map((row, i) => (i === index ? { ...row, q: e.target.value } : row))
                )
              }
              placeholder="Question"
            />
            <textarea
              className="min-h-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              value={item.a}
              onChange={(e) =>
                update(
                  "faq",
                  value.faq.map((row, i) => (i === index ? { ...row, a: e.target.value } : row))
                )
              }
              placeholder="Answer"
            />
            <button
              type="button"
              onClick={() => update("faq", value.faq.filter((_, i) => i !== index))}
              className="w-fit cursor-pointer rounded border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950/40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
