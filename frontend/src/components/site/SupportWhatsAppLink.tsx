"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

type PublicSettings = {
  contact?: {
    whatsapp_number?: string;
  };
};

function normalizeDigits(raw: string) {
  return (raw || "").replace(/\D/g, "");
}

export default function SupportWhatsAppLink({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [digits, setDigits] = useState("");

  useEffect(() => {
    apiGet<PublicSettings>("/settings/public/")
      .then((res) => setDigits(normalizeDigits(res?.contact?.whatsapp_number || "")))
      .catch(() => setDigits(""));
  }, []);

  const href = useMemo(() => (digits ? `https://wa.me/${digits}` : ""), [digits]);

  if (!href) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
