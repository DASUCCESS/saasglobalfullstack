import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";

type Product = {
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  status: "published" | "hidden" | "upcoming";
  is_visible: boolean;
  content?: { features?: { title: string }[] };
  features?: { title: string }[];
};


export async function generateMetadata() {
  const payload = await apiGet<{ products: Product[] }>("/products-page/");
  const visibleCount = (payload?.products || []).filter((p) => p.is_visible).length;

  return {
    title: "Products",
    description: `Explore ${visibleCount} backend-managed SaaS products with admin-controlled visibility and content.`,
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsIndexPage() {
  const payload = await apiGet<{ products: Product[] }>("/products-page/");
  const products = (payload?.products || []).filter((p) => p.is_visible);

  return (
    <>
      <Header />
      <main className="relative bg-white text-black overflow-x-clip">
        <section className="relative pt-28 pb-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Products</h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl break-words">Backend-managed products and upcoming launches.</p>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const disabled = p.status === "upcoming";
              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className={`group relative flex flex-col h-full rounded-xl border bg-white shadow-xl transition transform-gpu overflow-hidden ${
                    disabled ? "opacity-60 grayscale" : "md:hover:scale-105"
                  }`}
                >
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-black/90 text-white text-xs px-2 py-1 shadow">
                    {disabled ? "Upcoming" : p.badge}
                  </div>
                  <div className="h-40 w-full bg-gradient-to-br from-black via-zinc-900 to-yellow-400" />

                  <div className="flex flex-col flex-1 p-6">
                    <h2 className="text-xl font-semibold break-words">{p.name}</h2>
                    <p className="mt-1 text-sm text-gray-700 break-words">{p.tagline}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {((p.features && p.features.length ? p.features : (p.content?.features || []))).slice(0, 3).map((f) => (
                        <li key={f.title} className="leading-6 break-words">{f.title}</li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <span className="inline-block px-4 py-2 rounded-md bg-black text-white shadow-xl">
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
