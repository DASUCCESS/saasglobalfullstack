import "server-only";
import { headers } from "next/headers";

export type ViewerGeo = {
  countryCode: string;
  countryName: string;
  isNigeria: boolean;
};

function extractClientIp(raw: string | null) {
  if (!raw) return "";
  return raw.split(",")[0]?.trim() || "";
}

function isLocalIp(ip: string) {
  if (!ip) return true;

  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

export async function getViewerGeo(): Promise<ViewerGeo> {
  const h = await headers();

  const forwardedFor = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const cfConnectingIp = h.get("cf-connecting-ip");
  const vercelForwardedFor = h.get("x-vercel-forwarded-for");

  const ip =
    extractClientIp(cfConnectingIp) ||
    extractClientIp(vercelForwardedFor) ||
    extractClientIp(forwardedFor) ||
    extractClientIp(realIp);

  if (!ip || isLocalIp(ip) || !process.env.IPINFO_TOKEN) {
    return {
      countryCode: "",
      countryName: "",
      isNigeria: false,
    };
  }

  try {
    const res = await fetch(
      `https://api.ipinfo.io/lite/${encodeURIComponent(ip)}?token=${process.env.IPINFO_TOKEN}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        countryCode: "",
        countryName: "",
        isNigeria: false,
      };
    }

    const data = (await res.json()) as {
      country_code?: string;
      country?: string;
    };

    const countryCode = (data.country_code || "").toUpperCase();

    return {
      countryCode,
      countryName: data.country || "",
      isNigeria: countryCode === "NG",
    };
  } catch {
    return {
      countryCode: "",
      countryName: "",
      isNigeria: false,
    };
  }
}