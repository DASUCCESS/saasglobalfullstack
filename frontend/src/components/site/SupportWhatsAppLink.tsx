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

type SupportWhatsAppLinkProps = {
  className?: string;
  children: React.ReactNode;
};

export default function SupportWhatsAppLink({
  className = "",
  children,
}: SupportWhatsAppLinkProps) {
  const [digits, setDigits] = useState("");

  useEffect(() => {
    apiGet<PublicSettings>("/settings/public/")
      .then((res) => setDigits(normalizeDigits(res?.contact?.whatsapp_number || "")))
      .catch(() => setDigits(""));
  }, []);

  const href = useMemo(() => (digits ? `https://wa.me/${digits}` : ""), [digits]);

  if (!href) {
    return <div className={className}>{children}</div>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}