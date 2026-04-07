"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";

export type AIProductCard = {
  slug: string;
  title: string;
  tagline: string;
  price_usd: number;
  price_ngn: number;
  image_url?: string;
  short_description: string;
};

type Props = {
  cards: AIProductCard[];
  totalProducts?: number;
  hasMoreProducts?: boolean;
  viewMoreUrl?: string;
};

export default function ProductCardCarousel({
  cards,
  totalProducts = 0,
  hasMoreProducts = false,
  viewMoreUrl = "/products",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const showcaseCards = useMemo(() => cards.slice(0, 5), [cards]);

  const scrollByAmount = (amount: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!cards.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Matching Products</p>
          <p className="text-xs text-gray-500">
            {totalProducts > 0 ? `${Math.min(showcaseCards.length, totalProducts)} shown` : `${showcaseCards.length} shown`}
            {totalProducts > showcaseCards.length ? ` of ${totalProducts}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByAmount(-320)}
            className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            ←
          </button>
          <button
            onClick={() => scrollByAmount(320)}
            className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300"
      >
        {showcaseCards.map((card) => (
          <Link
            href={`/products/${card.slug}`}
            key={card.slug}
            className="flex min-w-[280px] max-w-[280px] snap-start flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md cursor-pointer"
          >
            <div className="mb-3 h-28 overflow-hidden rounded-xl bg-gradient-to-br from-black via-zinc-900 to-yellow-400">
              {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" />
              ) : null}
            </div>

            <h3 className="min-h-[3rem] text-base font-semibold leading-6 text-gray-900">{card.title}</h3>
            <p className="mt-1 min-h-[2.5rem] text-xs text-gray-600">{card.tagline}</p>
            <p className="mt-2 min-h-[3.6rem] text-sm leading-6 text-gray-700">
              {card.short_description}
            </p>

            <div className="mt-auto pt-4">
              <p className="text-sm font-semibold text-gray-900">
                USD ${card.price_usd} · ₦{card.price_ngn}
              </p>
              <span className="mt-3 inline-flex rounded-lg bg-black px-4 py-2 text-sm text-white">
                View details
              </span>
            </div>
          </Link>
        ))}

        {hasMoreProducts ? (
          <Link
            href={viewMoreUrl}
            className="flex min-w-[280px] max-w-[280px] snap-start flex-col justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center shadow-sm transition hover:scale-[1.02] hover:shadow-md cursor-pointer"
          >
            <p className="text-lg font-semibold text-gray-900">View More Products</p>
            <p className="mt-2 text-sm text-gray-600">
              Explore the full product collection.
            </p>
            <span className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-yellow px-4 py-2 text-sm font-medium text-black">
              Open Products Page
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
