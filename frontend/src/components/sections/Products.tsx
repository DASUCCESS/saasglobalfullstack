"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import ProductPriceDisplay from "@/components/products/ProductPriceDisplay";
import SubscriptionPlansPreview from "@/components/products/SubscriptionPlansPreview";

type ApiProduct = {
  slug: string;
  name: string;
  short_description?: string;
  tagline?: string;
  status?: "published" | "hidden" | "upcoming";
  is_visible?: boolean;
  image_url?: string;
  price_usd?: number | string;
  current_price_usd?: number | string;
  promotion_is_active?: boolean;
  promotion_end_at?: string;
  subscription_enabled?: boolean;
  subscription_plans?: Array<{
    id: string;
    name: string;
    billing_period: string;
    price_usd: number | string;
  }>;
};

type ProductCard = {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  priceUsd?: number;
  currentPriceUsd?: number;
  promotionIsActive?: boolean;
  promotionEndAt?: string;
  subscriptionEnabled?: boolean;
  subscriptionPlans?: Array<{
    id: string;
    name: string;
    billing_period: string;
    price_usd: number;
  }>;
};

function BrandBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,180,0,0.08),transparent_45%)]" />
      <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-yellow/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-brand-black/5 blur-3xl" />
      <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-brand-yellow/10 blur-3xl" />
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [promotions, setPromotions] = useState<ProductCard[]>([]);

  useEffect(() => {
    apiGet<{ products: ApiProduct[] }>("/products-page/").then((payload) => {
      const allVisible = (payload?.products || []).filter((p) => p.is_visible && p.status === "published");
      const promotionRows = allVisible.filter((item) => item.promotion_is_active);
      const nonPromotionRows = allVisible.filter((item) => !item.promotion_is_active);

      const cards = nonPromotionRows.slice(0, 6).map((p) => ({
        title: p.name,
        description: p.short_description || p.tagline || "Explore our product offering.",
        link: `/products/${p.slug}`,
        imageUrl: p.image_url,
        priceUsd: Number(p.price_usd),
        currentPriceUsd: Number(p.current_price_usd),
        promotionIsActive: p.promotion_is_active,
        promotionEndAt: p.promotion_end_at,
        subscriptionEnabled: p.subscription_enabled,
        subscriptionPlans: (p.subscription_plans || [])
          .map((plan) => ({ ...plan, price_usd: Number(plan.price_usd) }))
          .filter((plan) => Number.isFinite(plan.price_usd)),
      }));

      setProducts(cards.slice(0, 3));

      setPromotions(
        promotionRows.slice(0, 3).map((p) => ({
          title: p.name,
          description: p.short_description || p.tagline || "Explore our product offering.",
          link: `/products/${p.slug}`,
          imageUrl: p.image_url,
          priceUsd: Number(p.price_usd),
          currentPriceUsd: Number(p.current_price_usd),
          promotionIsActive: p.promotion_is_active,
          promotionEndAt: p.promotion_end_at,
          subscriptionEnabled: p.subscription_enabled,
          subscriptionPlans: (p.subscription_plans || [])
            .map((plan) => ({ ...plan, price_usd: Number(plan.price_usd) }))
            .filter((plan) => Number.isFinite(plan.price_usd)),
        }))
      );
    });
  }, []);

  return (
    <section id="products" className="relative bg-brand-white py-24">
      <BrandBackground />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-brand-black md:text-4xl">
            Our <span className="text-brand-yellow">Products</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-brand-black/70">
            Explore our innovative SaaS solutions built to support business growth,
            automation, and digital transformation.
          </p>
        </motion.div>

        <div className="mt-16 grid auto-rows-fr grid-cols-1 gap-10 md:grid-cols-3">
          {products.map((product, index) => {
            const hasValidPrice = Number.isFinite(product.priceUsd);
            const hasPromotion =
              !!product.promotionIsActive &&
              Number.isFinite(product.priceUsd) &&
              Number.isFinite(product.currentPriceUsd) &&
              (product.currentPriceUsd as number) < (product.priceUsd as number);

            const hasSubscription =
              !!product.subscriptionEnabled &&
              (product.subscriptionPlans || []).length > 0;

            return (
              <motion.a
                key={product.title}
                href={product.link}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group flex h-full min-h-[620px] transform-gpu cursor-pointer flex-col rounded-2xl border border-brand-black/10 bg-brand-white p-8 shadow-card transition-all duration-500 will-change-transform hover:scale-[1.02] hover:border-brand-yellow hover:shadow-hover"
              >
                <div className="relative w-full shrink-0 overflow-hidden rounded-xl border border-brand-black/10">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-brand-black via-brand-black to-brand-yellow" />
                  )}
                </div>

                <div className="mt-5 min-h-[64px]">
                  <h3 className="line-clamp-2 text-xl font-semibold leading-8 text-brand-black transition group-hover:text-brand-yellow">
                    {product.title}
                  </h3>
                </div>

                <div className="mt-2 min-h-[72px]">
                  <p className="line-clamp-3 leading-6 text-brand-black/70">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 min-h-[104px]">
                  {hasValidPrice ? (
                    <div className="flex h-full flex-col justify-between rounded-lg border border-brand-black/10 bg-brand-gray/40 p-3">
                      <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-black/55">
                          Lifetime purchase
                        </p>

                        <ProductPriceDisplay
                          className="h-full"
                          priceUsd={product.priceUsd as number}
                          currentPriceUsd={
                            Number.isFinite(product.currentPriceUsd)
                              ? product.currentPriceUsd
                              : undefined
                          }
                          promotionIsActive={product.promotionIsActive}
                          promotionEndAt={product.promotionEndAt}
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
                      <span className="min-h-[20px] text-xs font-bold text-[#a66b00]">
                        This product supports both lifetime purchase and subscription.
                      </span>
                      <div className="mt-2 flex-1">
                        <SubscriptionPlansPreview plans={product.subscriptionPlans || []} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center rounded-lg border border-dashed border-brand-black/10 bg-brand-gray/30 px-3 py-3 text-xs leading-5 text-brand-black/60">
                      No subscription plan is available for this product yet.
                    </div>
                  )}
                </div>

                <span className="mt-auto pt-6 font-semibold text-brand-yellow transition group-hover:underline">
                  Learn More →
                </span>
              </motion.a>
            );
          })}
        </div>

        {promotions.length ? (
          <div className="mt-14">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-brand-black">
                Active Promotions
              </h3>

              <span className="rounded-full border border-brand-yellow/40 bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-brand-black">
                Limited time deals
              </span>
            </div>

            <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-3">
              {promotions.map((item) => {
                const hasValidPrice = Number.isFinite(item.priceUsd);
                const hasPromotion =
                  !!item.promotionIsActive &&
                  Number.isFinite(item.priceUsd) &&
                  Number.isFinite(item.currentPriceUsd) &&
                  (item.currentPriceUsd as number) < (item.priceUsd as number);

                const hasSubscription =
                  !!item.subscriptionEnabled &&
                  (item.subscriptionPlans || []).length > 0;

                return (
                  <a
                    key={`${item.link}-promo`}
                    href={item.link}
                    className="group flex h-full min-h-[600px] transform-gpu cursor-pointer flex-col rounded-xl border border-brand-black/10 bg-brand-white p-5 shadow-card transition will-change-transform hover:scale-[1.02] hover:border-brand-yellow hover:shadow-hover"
                  >
                    <div className="relative mb-3 w-full shrink-0 overflow-hidden rounded-xl border border-brand-black/10">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-36 w-full bg-gradient-to-br from-brand-black via-brand-black to-brand-yellow" />
                      )}
                    </div>

                    <div className="min-h-[56px]">
                      <p className="line-clamp-2 text-lg font-semibold leading-7 text-brand-black">
                        {item.title}
                      </p>
                    </div>

                    <div className="mt-2 min-h-[72px]">
                      <p className="line-clamp-3 text-sm leading-6 text-brand-black/70">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 min-h-[104px]">
                      {hasValidPrice ? (
                        <div className="flex h-full flex-col justify-between rounded-lg border border-brand-black/10 bg-brand-gray/40 p-3">
                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-black/55">
                              Lifetime purchase
                            </p>

                            <ProductPriceDisplay
                              className="h-full"
                              priceUsd={item.priceUsd as number}
                              currentPriceUsd={
                                Number.isFinite(item.currentPriceUsd)
                                  ? item.currentPriceUsd
                                  : undefined
                              }
                              promotionIsActive={item.promotionIsActive}
                              promotionEndAt={item.promotionEndAt}
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
                          <span className="min-h-[20px] text-xs font-bold text-[#a66b00]">
                            This product supports both lifetime purchase and subscription.
                          </span>
                          <div className="mt-2 flex-1">
                            <SubscriptionPlansPreview plans={item.subscriptionPlans || []} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full items-center rounded-lg border border-dashed border-brand-black/10 bg-brand-gray/30 px-3 py-3 text-xs leading-5 text-brand-black/60">
                          No subscription plan is available for this product yet.
                        </div>
                      )}
                    </div>

                    <span className="mt-auto pt-4 font-semibold text-brand-yellow transition group-hover:underline">
                      Learn More →
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-black px-6 py-3 text-sm font-semibold text-brand-white transition hover:scale-105 hover:bg-brand-yellow hover:text-brand-black"
          >
            View More Products
          </Link>
        </div>
      </div>
    </section>
  );
}
