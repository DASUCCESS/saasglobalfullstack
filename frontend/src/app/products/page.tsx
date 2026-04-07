import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";
import Link from "next/link";

type Product = {
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  status: "published" | "hidden" | "upcoming";
  is_visible: boolean;
  image_url?: string;
  features?: { title: string }[];
  content?: { features?: { title: string }[] };
};

type PublicSettings = {
  site?: {
    site_name?: string;
  };
};

export async function generateMetadata() {
  const [payload, settings] = await Promise.all([
    apiGet<{ products: Product[] }>("/products-page/"),
    apiGet<PublicSettings>("/settings/public/"),
  ]);

  const visibleCount = (payload?.products || []).filter((p) => p.is_visible).length;
  const siteName = settings?.site?.site_name || "SaaSGlobal Hub";

  return {
    title: `Products | ${siteName}`,
    description: `Explore ${visibleCount} our digital products available on ${siteName}.`,
    alternates: { canonical: "/products" },
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

        <section className="py-10">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            {products.map((p) => {
              const disabled = p.status === "upcoming";
              const featureList = (p.features?.length ? p.features : p.content?.features || []).slice(0, 3);

              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className={`group relative flex h-full transform-gpu flex-col overflow-hidden rounded-xl border bg-white shadow-xl transition ${
                    disabled ? "opacity-60 grayscale" : "cursor-pointer md:hover:scale-105"
                  }`}
                >
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-black/90 px-2 py-1 text-xs text-white shadow">
                    {disabled ? "Upcoming" : p.badge || "Available"}
                  </div>

                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-black via-zinc-900 to-yellow-400" />
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="break-words text-xl font-semibold">{p.name}</h2>
                    <p className="mt-1 break-words text-sm text-gray-700">{p.tagline}</p>

                    <ul className="mt-4 space-y-2 text-sm">
                      {featureList.map((f) => (
                        <li key={f.title} className="break-words leading-6">
                          {f.title}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <span className="inline-block rounded-md bg-black px-4 py-2 text-white shadow-xl">
                        {disabled ? "Coming soon" : "View details"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}