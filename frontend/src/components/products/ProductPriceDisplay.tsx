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

function fmt(value: number, symbol: "$" | "₦") {
  return `${symbol}${value.toLocaleString()}`;
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
  const activeUsd = promotionIsActive && typeof currentPriceUsd === "number" ? currentPriceUsd : priceUsd;
  const activeNgn = promotionIsActive && typeof currentPriceNgn === "number" ? currentPriceNgn : priceNgn;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-2xl font-bold text-gray-950">{fmt(activeUsd, "$")}</span>
        {showNaira && typeof activeNgn === "number" ? (
          <span className="text-sm font-medium text-gray-600">{fmt(activeNgn, "₦")}</span>
        ) : null}

        {promotionIsActive ? (
          <span className="text-sm text-gray-500 line-through">
            {fmt(priceUsd, "$")}
            {showNaira && typeof priceNgn === "number" ? ` • ${fmt(priceNgn, "₦")}` : ""}
          </span>
        ) : null}
      </div>

      {promotionIsActive ? (
        <PromotionCountdown
          endAt={promotionEndAt}
          className="mt-1 inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700"
        />
      ) : null}
    </div>
  );
}
