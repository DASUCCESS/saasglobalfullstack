type SubscriptionPlan = {
  id: string;
  name: string;
  billing_period: string;
  price_usd: number;
  price_ngn?: number;
};

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
          className={`w-full rounded-xl border px-3 py-2 text-left ${
            value === plan.id ? "border-black bg-black text-white" : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{plan.name}</span>
            <span className="text-sm">
              ${plan.price_usd.toLocaleString()}
              {showNaira && typeof plan.price_ngn === "number" ? ` • ₦${plan.price_ngn.toLocaleString()}` : ""}
            </span>
          </div>
          <p className={`text-xs ${value === plan.id ? "text-white/80" : "text-gray-500"}`}>{plan.billing_period}</p>
        </button>
      ))}
    </div>
  );
}
