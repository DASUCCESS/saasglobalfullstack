import type { MetadataRoute } from "next";
import { env, getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getSiteUrl("/sitemap.xml"),
    host: env.siteUrl,
  };
}
