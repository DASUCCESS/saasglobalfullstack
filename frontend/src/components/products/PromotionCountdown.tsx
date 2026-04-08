"use client";

import { useEffect, useState } from "react";

function getRemaining(endAt?: string) {
  if (!endAt) return null;

  const end = Date.parse(endAt);
  const now = Date.now();
  const diff = end - now;

  if (Number.isNaN(end) || diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function PromotionCountdown({
  endAt,
  className = "",
}: {
  endAt?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    setMounted(true);
    setRemaining(getRemaining(endAt));

    const id = window.setInterval(() => {
      setRemaining(getRemaining(endAt));
    }, 1000);

    return () => window.clearInterval(id);
  }, [endAt]);

  if (!mounted || !remaining) return null;

  return (
    <span className={className}>
      Ends in {remaining.days}d {String(remaining.hours).padStart(2, "0")}h{" "}
      {String(remaining.minutes).padStart(2, "0")}m{" "}
      {String(remaining.seconds).padStart(2, "0")}s
    </span>
  );
}