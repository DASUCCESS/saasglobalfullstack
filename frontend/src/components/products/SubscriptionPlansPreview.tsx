type Plan = {
  id: string;
  name: string;
  billing_period: string;
  price_usd: number;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function SubscriptionPlansPreview({ plans }: { plans: Plan[] }) {
  if (!plans.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {plans.map((plan) => (
        <span
          key={plan.id}
          className="rounded-full border border-brand-yellow/30 bg-brand-yellow/10 px-2.5 py-1 text-xs font-semibold text-brand-black"
        >
          {plan.name}: ${usdFormatter.format(plan.price_usd)} ({plan.billing_period})
        </span>
      ))}
    </div>
  );
}