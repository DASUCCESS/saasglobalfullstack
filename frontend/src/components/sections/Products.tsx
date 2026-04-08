"use client";
import { motion } from "framer-motion";
import { Bot, Truck, Store } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import PromotionCountdown from "@/components/products/PromotionCountdown";
import ProductPriceDisplay from "@/components/products/ProductPriceDisplay";
import SubscriptionPlansPreview from "@/components/products/SubscriptionPlansPreview";

type ApiProduct = {
  slug: string;
  name: string;
  short_description?: string;
  tagline?: string;
  is_visible?: boolean;
  price_usd?: number;
  current_price_usd?: number;
  promotion_is_active?: boolean;
  promotion_end_at?: string;
  subscription_enabled?: boolean;
  subscription_plans?: Array<{ id: string; name: string; billing_period: string; price_usd: number }>;
};

type ProductCard = {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  gradient: string;
  priceUsd?: number;
  currentPriceUsd?: number;
  promotionIsActive?: boolean;
  promotionEndAt?: string;
  subscriptionEnabled?: boolean;
  subscriptionPlans?: Array<{ id: string; name: string; billing_period: string; price_usd: number }>;
};

const cardStyles = [
  { icon: <Bot className="w-8 h-8 text-white" />, gradient: "from-brand-yellow to-orange-500" },
  { icon: <Truck className="w-8 h-8 text-white" />, gradient: "from-blue-500 to-indigo-500" },
  { icon: <Store className="w-8 h-8 text-white" />, gradient: "from-green-500 to-emerald-600" },
] as const;

type BotSpec = {
  top: string;
  left: string;
  size: number;
  rotate?: number;
  opacity?: number;
  yRange?: number;
  xDrift?: number;
  delay?: number;
  duration?: number;
  blur?: string;
};

const botSpecs: BotSpec[] = [
  { top: "10%", left: "8%", size: 140, rotate: -12, opacity: 0.08, yRange: 26, xDrift: 18, delay: 0.2, duration: 12, blur: "blur-sm" },
  { top: "28%", left: "70%", size: 120, rotate: 10, opacity: 0.07, yRange: 22, xDrift: -16, delay: 0.6, duration: 10.5, blur: "blur-[1px]" },
  { top: "56%", left: "16%", size: 170, rotate: 4, opacity: 0.06, yRange: 30, xDrift: 14, delay: 0.4, duration: 13, blur: "blur" },
  { top: "72%", left: "64%", size: 150, rotate: -8, opacity: 0.07, yRange: 24, xDrift: -20, delay: 0.9, duration: 11.5, blur: "blur-sm" },
  { top: "42%", left: "40%", size: 200, rotate: -2, opacity: 0.05, yRange: 18, xDrift: 12, delay: 0.1, duration: 14, blur: "blur" },
];

function AIBotSVG({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="botGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <rect x="56" y="40" width="144" height="104" rx="24" stroke="url(#botGrad)" strokeWidth="10" />
      <circle cx="128" cy="22" r="12" stroke="url(#botGrad)" strokeWidth="8" />
      <line x1="128" y1="34" x2="128" y2="40" stroke="currentColor" strokeWidth="8" />
      <circle cx="92" cy="88" r="12" fill="currentColor" />
      <circle cx="164" cy="88" r="12" fill="currentColor" />
      <rect x="96" y="116" width="64" height="14" rx="7" fill="currentColor" />
      <rect x="72" y="148" width="112" height="44" rx="12" stroke="url(#botGrad)" strokeWidth="10" />
      <path d="M56 96 H36 C28 96 24 100 24 108 V128" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <path d="M200 96 H220 C228 96 232 100 232 108 V128" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <rect x="96" y="192" width="20" height="28" rx="6" fill="currentColor" />
      <rect x="140" y="192" width="20" height="28" rx="6" fill="currentColor" />
    </svg>
  );
}

function BackgroundBots() {
  const items = useMemo(() => botSpecs, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(0,0,0,0.045)_1px,transparent_1.3px)] [background-size:22px_22px]" />
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full blur-3xl bg-gradient-to-r from-brand-yellow/15 via-white/0 to-blue-500/10" />
      {items.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.blur} text-gray-900`}
          style={{ top: b.top, left: b.left, transform: `rotate(${b.rotate ?? 0}deg)`, opacity: b.opacity ?? 0.07 }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            y: [0, b.yRange ?? 20, 0, -(b.yRange ?? 20), 0],
            x: [0, b.xDrift ?? 16, 0, -(b.xDrift ?? 16), 0],
            opacity: [0, b.opacity ?? 0.07, b.opacity ?? 0.07, b.opacity ?? 0.07, b.opacity ?? 0.07],
          }}
          transition={{ repeat: Infinity, repeatType: "loop", duration: b.duration ?? 12, ease: "easeInOut", delay: b.delay ?? 0 }}
        >
          <AIBotSVG size={b.size} />
        </motion.div>
      ))}
      <div className="absolute inset-y-0 left-1/4 w-px bg-gradient-to-b from-transparent via-gray-200/40 to-transparent" />
      <div className="absolute inset-y-0 left-2/3 w-px bg-gradient-to-b from-transparent via-gray-200/35 to-transparent" />
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [promotions, setPromotions] = useState<ProductCard[]>([]);

  useEffect(() => {
    apiGet<{ products: ApiProduct[] }>("/products-page/").then((payload) => {
      const allVisible = (payload?.products || []).filter((p) => p.is_visible);
      const cards = allVisible
        .slice(0, 6)
        .map((p, index) => ({
          title: p.name,
          description: p.short_description || p.tagline || "Explore our product offering.",
          link: `/products/${p.slug}`,
          icon: cardStyles[index % cardStyles.length].icon,
          gradient: cardStyles[index % cardStyles.length].gradient,
          priceUsd: p.price_usd,
          currentPriceUsd: p.current_price_usd,
          promotionIsActive: p.promotion_is_active,
          promotionEndAt: p.promotion_end_at,
          subscriptionEnabled: p.subscription_enabled,
          subscriptionPlans: p.subscription_plans,
        }));
      setProducts(cards.slice(0, 3));
      setPromotions(
        allVisible
          .filter((item) => item.promotion_is_active)
          .slice(0, 3)
          .map((p, index) => ({
            title: p.name,
            description: p.short_description || p.tagline || "Explore our product offering.",
            link: `/products/${p.slug}`,
            icon: cardStyles[index % cardStyles.length].icon,
            gradient: cardStyles[index % cardStyles.length].gradient,
            priceUsd: p.price_usd,
            currentPriceUsd: p.current_price_usd,
            promotionIsActive: p.promotion_is_active,
            promotionEndAt: p.promotion_end_at,
            subscriptionEnabled: p.subscription_enabled,
            subscriptionPlans: p.subscription_plans,
          }))
      );
    });
  }, []);

  return (
    <section id="products" className="relative py-24 bg-gradient-to-b from-gray-50 to-white">
      <BackgroundBots />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Our <span className="text-brand-yellow">Products</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Explore our innovative SaaS solutions built to empower businesses in AI, logistics, and multi-supplier ecosystems.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {products.map((product, index) => (
            <motion.a
              key={product.title}
              href={product.link}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl hover:shadow-[0_18px_60px_rgba(0,0,0,0.15)] hover:scale-105 transition-all duration-500 border border-gray-100 hover:border-brand-yellow flex flex-col items-start gap-5 cursor-pointer min-h-[260px]"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-r ${product.gradient} shadow-md inline-flex`}>{product.icon}</div>
              <h3 className="text-xl font-semibold group-hover:text-brand-yellow transition">{product.title}</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              {typeof product.priceUsd === "number" ? (
                <ProductPriceDisplay
                  priceUsd={product.priceUsd}
                  currentPriceUsd={product.currentPriceUsd}
                  promotionIsActive={product.promotionIsActive}
                  promotionEndAt={product.promotionEndAt}
                />
              ) : null}
              {product.promotionIsActive ? (
                <PromotionCountdown
                  endAt={product.promotionEndAt}
                  className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"
                />
              ) : null}
              {product.subscriptionEnabled && (product.subscriptionPlans || []).length ? (
                <SubscriptionPlansPreview plans={product.subscriptionPlans || []} />
              ) : null}
              <span className="mt-auto font-semibold text-brand-yellow group-hover:underline transition">Learn More →</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-yellow/0 via-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            </motion.a>
          ))}
        </div>

        {promotions.length ? (
          <div className="mt-14">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold">Active Promotions</h3>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Limited time deals
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {promotions.map((item) => (
                <a key={`${item.link}-promo`} href={item.link} className="rounded-xl border border-red-100 bg-white p-5 shadow-lg">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  <p className="mt-3 text-lg font-bold text-red-700">
                    ${((item.currentPriceUsd || item.priceUsd) ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 line-through">${(item.priceUsd || 0).toLocaleString()}</p>
                  <PromotionCountdown endAt={item.promotionEndAt} className="mt-3 inline-block text-xs font-semibold text-red-700" />
                  {item.subscriptionEnabled && (item.subscriptionPlans || []).length ? (
                    <SubscriptionPlansPreview plans={item.subscriptionPlans || []} />
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:bg-gray-900"
          >
            View More Products
          </Link>
        </div>
      </div>
    </section>
  );
}
