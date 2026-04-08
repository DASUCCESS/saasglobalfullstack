import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";
import { getSiteUrl } from "@/lib/env";
import ProductsCatalog from "@/components/products/ProductsCatalog";

type Product = {
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  status: "published" | "hidden" | "upcoming";
  is_visible: boolean;
  image_url?: string;
  seo?: { og_image?: string };
  features?: { title: string }[];
  content?: { features?: { title: string }[] };
};

type PublicSettings = {
  site?: {
    site_name?: string;
  };
};

function resolveAbsoluteImageUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return getSiteUrl(url);
}

export async function generateMetadata() {
  const [payload, settings] = await Promise.all([
    apiGet<{ products: Product[] }>("/products-page/"),
    apiGet<PublicSettings>("/settings/public/"),
  ]);

  const visibleProducts = (payload?.products || []).filter((p) => p.is_visible);
  const visibleCount = visibleProducts.length;
  const siteName = settings?.site?.site_name || "SaaSGlobal Hub";
  const firstProductWithImage = visibleProducts.find((p) => p.image_url || p.seo?.og_image);
  const productsOgImage = resolveAbsoluteImageUrl(firstProductWithImage?.image_url || firstProductWithImage?.seo?.og_image);
  const seoTitle = `Best Digital Products, SaaS Templates, AI Tools & Ecommerce Solutions | ${siteName}`;
  const description = `Shop ${visibleCount} high-converting digital products including AI tools, SaaS templates, ecommerce solutions, automation systems, business growth resources, and ready-to-use online business assets.`;
  const keywords = [
    "best digital products",
    "buy digital products online",
    "AI tools for business",
    "SaaS templates",
    "ecommerce solutions",
    "automation tools",
    "online business tools",
    "startup growth tools",
    "digital downloads",
    "software products",
    "website templates",
    "business productivity tools",
    "SaaSGlobal Hub products",
  ];

  return {
    title: seoTitle,
    description,
    keywords,
    alternates: { canonical: "/products" },
    openGraph: {
      title: seoTitle,
      description,
      url: "/products",
      type: "website",
      images: productsOgImage ? [{ url: productsOgImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: productsOgImage ? [productsOgImage] : [],
    },
  };
}

export default async function ProductsIndexPage() {
  const payload = await apiGet<{ products: Product[] }>("/products-page/");
  const products = (payload?.products || []).filter((p) => p.is_visible);

  return (
    <>
      <Header />
      <main className="relative overflow-x-clip bg-white text-black">
        <section className="relative pb-10 pt-28">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-wide text-gray-500">SaaSGlobal Hub</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Products</h1>
            <p className="mt-4 max-w-3xl text-lg md:text-xl">
              Explore our digital products, access tools, and upcoming launches.
            </p>
          </div>
        </section>

        <ProductsCatalog products={products} />
      </main>
      <Footer />
    </>
  );
}
