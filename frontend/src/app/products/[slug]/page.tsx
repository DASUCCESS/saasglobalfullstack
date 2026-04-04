import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";
import PaymentPanel from "@/components/products/PaymentPanel";

interface Product {
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  status: "published" | "hidden" | "upcoming";
  content?: {
    hero_title?: string;
    hero_description?: string;
    kpis?: { key: string; sub: string }[];
    features?: { title: string; description: string }[];
    steps?: { title: string; description: string }[];
    benefits?: string[];
    faq?: { q: string; a: string }[];
  };
  kpis?: { key: string; sub: string }[];
  features?: { title: string; description: string }[];
  steps?: { title: string; description: string }[];
  benefits?: { text: string }[];
  faqs?: { q: string; a: string }[];
  price_usd: number;
  price_ngn: number;
}



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await apiGet<Product>(`/products/${slug}/`);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const title = product.content?.hero_title || product.name;
  const description = product.content?.hero_description || product.short_description || product.tagline;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/products/${product.slug}`,
    },
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await apiGet<Product>(`/products/${slug}/`);

  if (!product) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-20 max-w-5xl mx-auto px-6">Product not found.</main>
        <Footer />
      </>
    );
  }

  const resolvedKpis = product.kpis?.length ? product.kpis : (product.content?.kpis || []);
  const resolvedFeatures = product.features?.length ? product.features : (product.content?.features || []);
  const resolvedSteps = product.steps?.length ? product.steps : (product.content?.steps || []);
  const resolvedBenefits = product.benefits?.length ? product.benefits.map((b) => b.text) : (product.content?.benefits || []);
  const resolvedFaq = product.faqs?.length ? product.faqs : (product.content?.faq || []);

  return (
    <>
      <Header />
      <main className="bg-white text-black">
        <section className="relative overflow-hidden pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
              {product.content?.hero_title || product.name}
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              {product.content?.hero_description || product.short_description || product.tagline}
            </p>
            {product.status === "upcoming" && (
              <div className="mt-4 inline-flex rounded-full bg-yellow-100 text-yellow-900 px-3 py-1 text-xs font-semibold">
                Upcoming Product
              </div>
            )}
            <PaymentPanel slug={product.slug} priceUsd={product.price_usd} priceNgn={product.price_ngn} />
          </div>
        </section>

        {!!resolvedKpis.length && (
          <section className="py-6 border-t bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {resolvedKpis.map((kpi) => (
                <div key={kpi.key} className="p-4 rounded-lg bg-white border shadow-lg text-center">
                  <div className="text-xl font-semibold">{kpi.key}</div>
                  <div className="text-xs text-gray-600">{kpi.sub}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Core Features</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedFeatures.map((f) => (
                <div key={f.title} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!!resolvedSteps.length && (
          <section className="py-12 border-t bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl md:text-3xl font-semibold">How It Works</h2>
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                {resolvedSteps.map((s) => (
                  <div key={s.title} className="h-full p-6 rounded-lg border bg-white shadow-xl">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!!resolvedBenefits.length && (
          <section className="py-12 border-t">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl md:text-3xl font-semibold">Benefits</h2>
              <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resolvedBenefits.map((b) => (
                  <li key={b} className="h-full p-6 rounded-lg border bg-white shadow-xl">{b}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {!!resolvedFaq.length && (
          <section className="py-12 border-t bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl md:text-3xl font-semibold">FAQ</h2>
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                {resolvedFaq.map((f) => (
                  <div key={f.q} className="h-full p-6 rounded-lg border bg-white shadow-xl">
                    <h3 className="font-semibold">{f.q}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
