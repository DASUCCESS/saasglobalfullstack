"use client";

import PromotionCountdown from "@/components/products/PromotionCountdown";

type Props = {
  priceUsd: number;
  priceNgn?: number;
  currentPriceUsd?: number;
  currentPriceNgn?: number;
  promotionIsActive?: boolean;
  promotionEndAt?: string;
  showNaira?: boolean;
  className?: string;
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const ngnFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function fmtUsd(value: number) {
  return `$${usdFormatter.format(value)}`;
}

function fmtNgn(value: number) {
  return `₦${ngnFormatter.format(value)}`;
}

export default function ProductPriceDisplay({
  priceUsd,
  priceNgn,
  currentPriceUsd,
  currentPriceNgn,
  promotionIsActive = false,
  promotionEndAt,
  showNaira = false,
  className = "",
}: Props) {
  const activeUsd =
    promotionIsActive && typeof currentPriceUsd === "number"
      ? currentPriceUsd
      : priceUsd;

  const activeNgn =
    promotionIsActive && typeof currentPriceNgn === "number"
      ? currentPriceNgn
      : priceNgn;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-2xl font-bold ">
          {fmtUsd(activeUsd)}
        </span>

        {showNaira && typeof activeNgn === "number" ? (
          <span className="text-sm font-medium">
            {fmtNgn(activeNgn)}
          </span>
        ) : null}

        {promotionIsActive ? (
          <span className="text-sm line-through">
            {fmtUsd(priceUsd)}
            {showNaira && typeof priceNgn === "number"
              ? ` • ${fmtNgn(priceNgn)}`
              : ""}
          </span>
        ) : null}
      </div>

      {promotionIsActive ? (
        <PromotionCountdown
          endAt={promotionEndAt}
          className="mt-1 inline-flex rounded-full border border-brand-yellow/40 bg-brand-yellow/15 px-2.5 py-1 text-xs font-bold"
        />
      ) : null}
    </div>
  );
}