"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductPriceDisplay from "@/components/products/ProductPriceDisplay";
import SubscriptionPlansPreview from "@/components/products/SubscriptionPlansPreview";

type Product = {
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  status: "published" | "hidden" | "upcoming";
  is_visible: boolean;
  image_url?: string;
  seo?: { og_image?: string };
  features?: { title: string }[];
  content?: { features?: { title: string }[] };
  price_usd?: number | string;
  current_price_usd?: number | string;
  promotion_is_active?: boolean;
  promotion_end_at?: string | null;
  subscription_enabled?: boolean;
  subscription_plans?: Array<{
    id: string;
    name: string;
    billing_period: string;
    price_usd: number | string;
  }>;
};

type StatusFilter =
  | "all"
  | "available"
  | "upcoming"
  | "promotion"
  | "subscription";

function ProductCard({ product }: { product: Product }) {
  const disabled = product.status === "upcoming";

  const featureList = (
    product.features?.length ? product.features : product.content?.features || []
  ).slice(0, 3);

  const normalizedFeatureList = [...featureList];
  while (normalizedFeatureList.length < 3) {
    normalizedFeatureList.push({
      title: "More feature details will be available soon.",
    });
  }

  const productImage = product.image_url || product.seo?.og_image || "";
  const basePriceUsd = Number(product.price_usd);
  const currentPriceUsd = Number(product.current_price_usd);
  const hasValidBasePrice = Number.isFinite(basePriceUsd);

  const normalizedSubscriptionPlans = (product.subscription_plans || [])
    .map((plan) => ({
      ...plan,
      price_usd: Number(plan.price_usd),
    }))
    .filter((plan) => Number.isFinite(plan.price_usd));

  const hasSubscription =
    !!product.subscription_enabled && normalizedSubscriptionPlans.length > 0;

  const hasPromotion =
    !!product.promotion_is_active &&
    Number.isFinite(basePriceUsd) &&
    Number.isFinite(currentPriceUsd) &&
    currentPriceUsd < basePriceUsd;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group relative flex h-full min-h-[720px] transform-gpu flex-col overflow-hidden rounded-xl border border-brand-black/10 bg-brand-white shadow-card transition will-change-transform ${
        disabled
          ? "opacity-60 grayscale"
          : "cursor-pointer hover:scale-[1.02] hover:shadow-hover"
      }`}
    >
      <div className="absolute left-3 top-3 z-10 rounded-full bg-brand-black px-2 py-1 text-xs text-brand-white shadow-card">
        {disabled ? "Upcoming" : product.badge || "Available"}
      </div>

      <div className="h-40 w-full shrink-0 overflow-hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-black via-brand-black to-brand-yellow" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="min-h-[64px]">
          <h2 className="line-clamp-2 break-words text-xl font-semibold leading-8 text-brand-black">
            {product.name}
          </h2>
        </div>

        <div className="mt-1 min-h-[48px]">
          <p className="line-clamp-2 break-words text-sm leading-6 text-brand-black/70">
            {product.tagline}
          </p>
        </div>

        <div className="mt-3 min-h-[104px]">
          {hasValidBasePrice ? (
            <div className="flex h-full flex-col justify-between rounded-lg border border-brand-black/10 bg-brand-gray/40 p-3">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-black/55">
                  Lifetime purchase
                </p>

                <ProductPriceDisplay
                  className="h-full"
                  priceUsd={basePriceUsd}
                  currentPriceUsd={
                    Number.isFinite(currentPriceUsd) ? currentPriceUsd : undefined
                  }
                  promotionIsActive={product.promotion_is_active}
                  promotionEndAt={product.promotion_end_at || undefined}
                />
              </div>

              {!hasPromotion ? (
                <p className="mt-2 text-xs leading-5 text-brand-black/60">
                  No active promotion for this product yet.
                </p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-brand-black/60">
                  Discount applies to the lifetime purchase price.
                </p>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center rounded-lg border border-dashed border-brand-black/10 bg-brand-gray/30 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-black/55">
                Lifetime purchase
              </p>
              <p className="mt-2 text-xs leading-5 text-brand-black/60">
                Pricing information will be available soon.
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 min-h-[132px]">
          {hasSubscription ? (
            <div className="flex h-full flex-col rounded-lg border border-[#a66b00]/15 bg-[#fff7e8] p-3">
              <p className="min-h-[20px] text-xs font-bold text-[#a66b00]">
                This product supports both lifetime purchase and subscription.
              </p>
              <div className="mt-2 flex-1">
                <SubscriptionPlansPreview plans={normalizedSubscriptionPlans} />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center rounded-lg border border-dashed border-brand-black/10 bg-brand-gray/30 px-3 py-3 text-xs leading-5 text-brand-black/60">
              No subscription plan is available for this product yet.
            </div>
          )}
        </div>

        <ul className="mt-4 min-h-[108px] space-y-2 text-sm text-brand-black/80">
          {normalizedFeatureList.map((f, index) => (
            <li
              key={`${product.slug}-feature-${index}`}
              className="min-h-[28px] break-words leading-6 line-clamp-1"
            >
              {f.title}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <span className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-black px-4 text-sm font-medium text-brand-white shadow-card transition group-hover:bg-brand-yellow group-hover:text-brand-black">
            {disabled ? "Coming soon" : "View details"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsCatalog({
  products,
}: {
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.tagline.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);

      if (!searchMatch) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "available") return product.status !== "upcoming";
      if (statusFilter === "upcoming") return product.status === "upcoming";
      if (statusFilter === "promotion") return !!product.promotion_is_active;
      return !!product.subscription_enabled;
    });
  }, [products, search, statusFilter]);

  const availableProducts = filteredProducts.filter(
    (product) => product.status !== "upcoming" && !product.promotion_is_active
  );

  const upcomingProducts = filteredProducts.filter(
    (product) => product.status === "upcoming" && !product.promotion_is_active
  );

  const promotionProducts = filteredProducts.filter(
    (product) => !!product.promotion_is_active
  );

  return (
    <section className="py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-3 rounded-xl border border-brand-black/10 bg-brand-gray p-4 sm:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, slug or tagline"
            className="rounded-lg border border-brand-black/10 bg-brand-white px-4 py-2.5 text-sm text-brand-black outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="cursor-pointer rounded-lg border border-brand-black/10 bg-brand-white px-4 py-2.5 text-sm text-brand-black outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
          >
            <option value="all">All products</option>
            <option value="available">Available only</option>
            <option value="upcoming">Upcoming only</option>
            <option value="promotion">Promotion products</option>
            <option value="subscription">Subscription products</option>
          </select>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-brand-black">
            Products in Promotion
          </h2>
          <p className="mt-1 text-sm text-brand-black/70">
            Limited-time offers with active countdown timers.
          </p>

          {promotionProducts.length ? (
            <div className="mt-5 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promotionProducts.map((product) => (
                <ProductCard key={`${product.slug}-promo`} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-brand-black/15 bg-brand-white p-6 text-sm text-brand-black/60">
              No products currently in active promotion.
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-black">
            Available Products
          </h2>
          <p className="mt-1 text-sm text-brand-black/70">
            Products you can access right now.
          </p>

          {availableProducts.length ? (
            <div className="mt-5 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-brand-black/15 bg-brand-white p-6 text-sm text-brand-black/60">
              No available products matched your search/filter.
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-brand-black">
            Upcoming Products
          </h2>
          <p className="mt-1 text-sm text-brand-black/70">
            Products launching soon.
          </p>

          {upcomingProducts.length ? (
            <div className="mt-5 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-brand-black/15 bg-brand-white p-6 text-sm text-brand-black/60">
              No upcoming products matched your search/filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}