type SubscriptionPlan = {
  id: string;
  name: string;
  billing_period: string;
  price_usd: number;
  price_ngn?: number;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const ngnFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function SubscriptionPlanSelector({
  plans,
  value,
  onChange,
  showNaira = false,
}: {
  plans: SubscriptionPlan[];
  value: string;
  onChange: (planId: string) => void;
  showNaira?: boolean;
}) {
  return (
    <div className="space-y-2">
      {plans.map((plan) => (
        <button
          type="button"
          key={plan.id}
          onClick={() => onChange(plan.id)}
          className={`w-full cursor-pointer rounded-xl border px-3 py-2 text-left transition ${
            value === plan.id
              ? "border-brand-black bg-brand-black text-brand-white"
              : "border-brand-black/10 bg-brand-white text-brand-black hover:border-brand-yellow"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{plan.name}</span>
            <span className="text-sm">
              ${usdFormatter.format(plan.price_usd)}
              {showNaira && typeof plan.price_ngn === "number"
                ? ` • ₦${ngnFormatter.format(plan.price_ngn)}`
                : ""}
            </span>
          </div>
          <p
            className={`text-xs ${
              value === plan.id ? "text-brand-white/80" : "text-brand-black/60"
            }`}
          >
            {plan.billing_period}
          </p>
        </button>
      ))}
    </div>
  );
}