"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductPriceDisplay from "@/components/products/ProductPriceDisplay";

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
  price_usd?: number;
  current_price_usd?: number;
  promotion_is_active?: boolean;
  promotion_end_at?: string | null;
  subscription_enabled?: boolean;
  subscription_plans?: Array<{ id: string; name: string; billing_period: string; price_usd: number }>;
};

type StatusFilter = "all" | "available" | "upcoming" | "promotion" | "subscription";

function ProductCard({ product }: { product: Product }) {
  const disabled = product.status === "upcoming";
  const featureList = (product.features?.length ? product.features : product.content?.features || []).slice(0, 3);
  const productImage = product.image_url || product.seo?.og_image || "";

  return (
    <Link
      key={product.slug}
      href={`/products/${product.slug}`}
      className={`group relative flex h-full transform-gpu flex-col overflow-hidden rounded-xl border bg-white shadow-xl transition ${
        disabled ? "opacity-60 grayscale" : "cursor-pointer md:hover:scale-105"
      }`}
    >
      <div className="absolute left-3 top-3 z-10 rounded-full bg-black/90 px-2 py-1 text-xs text-white shadow">
        {disabled ? "Upcoming" : product.badge || "Available"}
      </div>

      {productImage ? (
        <img src={productImage} alt={product.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-black via-zinc-900 to-yellow-400" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <h2 className="break-words text-xl font-semibold">{product.name}</h2>
        <p className="mt-1 break-words text-sm text-gray-700">{product.tagline}</p>
        {typeof product.price_usd === "number" ? (
          <ProductPriceDisplay
            className="mt-3"
            priceUsd={product.price_usd}
            currentPriceUsd={product.current_price_usd}
            promotionIsActive={product.promotion_is_active}
            promotionEndAt={product.promotion_end_at || undefined}
          />
        ) : null}
        {!!product.subscription_enabled && (product.subscription_plans || []).length > 0 ? (
          <p className="mt-2 text-xs font-semibold text-indigo-700">
            Subscription available from ${Math.min(...(product.subscription_plans || []).map((plan) => plan.price_usd)).toLocaleString()}
          </p>
        ) : null}

        <ul className="mt-4 space-y-2 text-sm">
          {featureList.map((f) => (
            <li key={f.title} className="break-words leading-6">
              {f.title}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <span className="inline-block rounded-md bg-black px-4 py-2 text-white shadow-xl">
            {disabled ? "Coming soon" : "View details"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsCatalog({ products }: { products: Product[] }) {
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

  const availableProducts = filteredProducts.filter((product) => product.status !== "upcoming");
  const upcomingProducts = filteredProducts.filter((product) => product.status === "upcoming");

  return (
    <section className="py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, slug or tagline"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none ring-brand-yellow transition focus:ring-2"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none ring-brand-yellow transition focus:ring-2"
          >
            <option value="all">All products</option>
            <option value="available">Available only</option>
            <option value="upcoming">Upcoming only</option>
            <option value="promotion">Promotion products</option>
            <option value="subscription">Subscription products</option>
          </select>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Products in Promotion</h2>
          <p className="mt-1 text-sm text-gray-600">Limited-time offers with active countdown timers.</p>
          {filteredProducts.filter((p) => p.promotion_is_active).length ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.filter((p) => p.promotion_is_active).map((product) => (
                <ProductCard key={`${product.slug}-promo`} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No products currently in active promotion.
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Available Products</h2>
          <p className="mt-1 text-sm text-gray-600">Products you can access right now.</p>
          {availableProducts.length ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No available products matched your search/filter.
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Products</h2>
          <p className="mt-1 text-sm text-gray-600">Products launching soon.</p>
          {upcomingProducts.length ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
              No upcoming products matched your search/filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
