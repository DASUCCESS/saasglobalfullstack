"use client";

export type SubscriptionPlanForm = {
  id: string;
  name: string;
  billing_period: string;
  price_usd: string;
};

export default function SubscriptionPlansEditor({
  value,
  onChange,
}: {
  value: SubscriptionPlanForm[];
  onChange: (next: SubscriptionPlanForm[]) => void;
}) {
  const updateAt = (index: number, patch: Partial<SubscriptionPlanForm>) => {
    const next = value.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {value.map((plan, index) => (
        <div key={`${plan.id}-${index}`} className="grid gap-2 rounded-xl border border-neutral-700 bg-neutral-950 p-3 md:grid-cols-4">
          <input
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
            placeholder="plan id (e.g monthly)"
            value={plan.id}
            onChange={(e) => updateAt(index, { id: e.target.value })}
          />
          <input
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
            placeholder="Plan name"
            value={plan.name}
            onChange={(e) => updateAt(index, { name: e.target.value })}
          />
          <input
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
            placeholder="Billing period"
            value={plan.billing_period}
            onChange={(e) => updateAt(index, { billing_period: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
              placeholder="Price USD"
              value={plan.price_usd}
              onChange={(e) => updateAt(index, { price_usd: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="rounded border border-red-800 px-2 text-xs text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="rounded border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
        onClick={() =>
          onChange([
            ...value,
            {
              id: "",
              name: "",
              billing_period: "",
              price_usd: "",
            },
          ])
        }
      >
        Add subscription plan
      </button>
    </div>
  );
}
