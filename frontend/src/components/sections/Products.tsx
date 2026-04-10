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

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {products.map((product, index) => (
            <motion.a
              key={product.title}
              href={product.link}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group flex min-h-[360px] cursor-pointer flex-col rounded-2xl border border-brand-black/10 bg-brand-white p-8 shadow-card transition-all duration-500 hover:scale-105 hover:border-brand-yellow hover:shadow-hover"
            >
              <div className="relative w-full overflow-hidden rounded-xl border border-brand-black/10">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-brand-black via-brand-black to-brand-yellow" />
                )}
              </div>

              <h3 className="mt-5 text-xl font-semibold text-brand-black transition group-hover:text-brand-yellow">
                {product.title}
              </h3>

              <p className="mt-2 leading-relaxed text-brand-black/70">
                {product.description}
              </p>

              {Number.isFinite(product.priceUsd) ? (
                <ProductPriceDisplay
                  className="mt-4"
                  priceUsd={product.priceUsd as number}
                  currentPriceUsd={
                    Number.isFinite(product.currentPriceUsd)
                      ? product.currentPriceUsd
                      : undefined
                  }
                  promotionIsActive={product.promotionIsActive}
                  promotionEndAt={product.promotionEndAt}
                />
              ) : null}

              {product.subscriptionEnabled && (product.subscriptionPlans || []).length ? (
                <>
                  <span className="mt-2 text-xs font-bold text-[#a66b00]">
                    This product supports both one-time purchase and subscription.
                  </span>
                  <SubscriptionPlansPreview plans={product.subscriptionPlans || []} />
                </>
              ) : null}

              <span className="mt-auto pt-6 font-semibold text-brand-yellow transition group-hover:underline">
                Learn More →
              </span>
            </motion.a>
          ))}
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

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {promotions.map((item) => (
                <a
                  key={`${item.link}-promo`}
                  href={item.link}
                  className="flex min-h-[360px] cursor-pointer flex-col rounded-xl border border-brand-black/10 bg-brand-white p-5 shadow-card transition hover:scale-105 hover:border-brand-yellow hover:shadow-hover"
                >
                  <div className="relative mb-3 w-full overflow-hidden rounded-xl border border-brand-black/10">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="h-36 w-full bg-gradient-to-br from-brand-black via-brand-black to-brand-yellow" />
                    )}
                  </div>

                  <p className="font-semibold text-brand-black">{item.title}</p>
                  <p className="mt-2 text-sm text-brand-black/70">
                    {item.description}
                  </p>

                  <ProductPriceDisplay
                    className="mt-2"
                    priceUsd={item.priceUsd || 0}
                    currentPriceUsd={item.currentPriceUsd}
                    promotionIsActive={item.promotionIsActive}
                    promotionEndAt={item.promotionEndAt}
                  />

                  {item.subscriptionEnabled && (item.subscriptionPlans || []).length ? (
                    <>
                      <span className="mt-2 text-xs font-bold text-[#a66b00]">
                       This product supports both one-time purchase and subscription.
                      </span>
                      <SubscriptionPlansPreview plans={item.subscriptionPlans || []} />
                    </>
                  ) : null}

                  <span className="mt-auto pt-4 font-semibold text-brand-yellow">
                    Learn More →
                  </span>
                </a>
              ))}
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
