"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeToasts, ToastPayload } from "@/lib/toast";

export default function ToastViewport() {
  const [items, setItems] = useState<ToastPayload[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const unsubscribe = subscribeToasts((toast) => {
      setItems((prev) => [...prev, toast]);

      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.duration || 3500);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!mounted || !items.length) return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[999999] flex w-[min(92vw,380px)] flex-col gap-3 sm:right-5 sm:top-5">
      {items.map((item) => {
        const toneClass =
          item.tone === "success"
            ? "border-amber-300 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-200 text-yellow-950"
            : item.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-300 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-200 text-yellow-950";

        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl ${toneClass}`}
          >
            {item.title ? <p className="text-sm font-semibold">{item.title}</p> : null}
            <p className="text-sm">{item.message}</p>
          </div>
        );
      })}
    </div>,
    document.body
  );
}   