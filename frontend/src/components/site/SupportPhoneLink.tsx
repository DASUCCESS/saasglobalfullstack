"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

type PublicSettings = {
  contact?: {
    whatsapp_number?: string;
  };
};

function normalizePhone(raw: string) {
  const value = (raw || "").trim();
  if (!value) return "";
  if (value.startsWith("+")) {
    return `+${value.slice(1).replace(/\D/g, "")}`;
  }
  return value.replace(/\D/g, "");
}

export default function SupportPhoneLink({ className = "" }: { className?: string }) {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    apiGet<PublicSettings>("/settings/public/")
      .then((res) => setPhone(normalizePhone(res?.contact?.whatsapp_number || "")))
      .catch(() => setPhone(""));
  }, []);

  const href = useMemo(() => (phone ? `tel:${phone}` : ""), [phone]);
  const label = useMemo(() => {
    if (!phone) return "Not available";
    return phone;
  }, [phone]);

  if (!href) {
    return <span className={className}>{label}</span>;
  }

  return (
    <a className={className} href={href}>
      {label}
    </a>
  );
}
