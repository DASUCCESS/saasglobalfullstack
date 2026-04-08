type Plan = {
  id: string;
  name: string;
  billing_period: string;
  price_usd: number;
};

export default function SubscriptionPlansPreview({ plans }: { plans: Plan[] }) {
  if (!plans.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {plans.map((plan) => (
        <span key={plan.id} className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {plan.name}: ${plan.price_usd.toLocaleString()} ({plan.billing_period})
        </span>
      ))}
    </div>
  );
}
