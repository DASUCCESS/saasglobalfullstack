import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { API_BASE } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Product = {
  slug: string;
  updated_at?: string;
};

type ProductsPagePayload = {
  products?: Product[];
};

const STATIC_ROUTES = ["", "/about", "/contact", "/products", "/privacy", "/terms", "/ai-chat"];

async function fetchProductRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(`${API_BASE}/products-page/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ProductsPagePayload;
    const products = payload.products || [];

    return products
      .filter((product) => Boolean(product.slug))
      .map((product) => ({
        url: getSiteUrl(`/products/${product.slug}`),
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route, index) => ({
    url: getSiteUrl(route),
    lastModified: new Date(),
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.8,
  }));

  const productRoutes = await fetchProductRoutes();
  return [...staticRoutes, ...productRoutes];
}
