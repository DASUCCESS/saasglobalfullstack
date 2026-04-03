import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata = {
  title: "Products – AI SaaS, Logistics SaaS, Multi-supplier Platform",
  description:
    "SaaSGlobalHub products: AI SAAS (WhatsApp + Web AI), Last-Mile Logistics SaaS, and the Multi-supplier E-commerce Platform.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Products – SaaSGlobal Hub",
    description:
      "OwnMindAI, Last-Mile Logistics SaaS, and Multi-supplier E-commerce Platform.",
    url: "https://www.saasglobalhub.com/products",
    type: "website",
    images: [{ url: "/saasglobalhubogimage.png" }],
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products – SaaSGlobal Hub",
    description:
      "OwnMindAI, Last-Mile Logistics SaaS, and Multi-supplier E-commerce Platform.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

export default function ProductsIndexPage() {
  const products = [
    {
      slug: "/products/ai-saas",
      name: "AI SaaS",
      badge: "AI SaaS",
      tagline: "WhatsApp + Web AI (Autosync)",
      bullets: [
        "Trainable chatbot with RAG",
        "Workflow automation & analytics",
        "APIs & webhooks to your stack",
      ],
    },
    {
      slug: "/products/logistics-saas",
      name: "Logistics SaaS",
      badge: "Last-Mile",
      tagline: "Last-mile routing, driver app, PoD",
      bullets: [
        "Dispatch, routing, live tracking",
        "Driver app with PoD & returns",
        "Multi-company onboarding & billing",
      ],
    },
    {
      slug: "/products/multi-supplier",
      name: "Multi-supplier Platform",
      badge: "Marketplace",
      tagline: "Admin-managed marketplace",
      bullets: [
        "Supplier onboarding & catalog",
        "Single checkout across vendors",
        "Rider assignment & automated payouts",
      ],
    },
  ];

  const comingSoon = [
    { name: "AI Detector Suite", tagline: "Content authenticity & risk scoring" },
    { name: "AI AutoBlog SaaS", tagline: "SEO-ready blogs from RSS + AI" },
    { name: "CEX Frontend Toolkit", tagline: "Next.js + uWebSockets.js trading UI" },
  ];

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SaaSGlobal Hub Products",
    url: "https://www.saasglobalhub.com/products",
    hasPart: [
      {
        "@type": "SoftwareApplication",
        name: "AI SaaS",
        applicationCategory: "BusinessApplication",
        url: "https://www.saasglobalhub.com/products/ai-saas",
      },
      {
        "@type": "SoftwareApplication",
        name: "Last-Mile Delivery Logistics SaaS",
        applicationCategory: "LogisticsApplication",
        url: "https://www.saasglobalhub.com/products/logistics-saas",
      },
      {
        "@type": "SoftwareApplication",
        name: "Multi-supplier E-commerce & Logistics Platform",
        applicationCategory: "ECommerceApplication",
        url: "https://www.saasglobalhub.com/products/multi-supplier",
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.saasglobalhub.com${p.slug}`,
      name: p.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.saasglobalhub.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.saasglobalhub.com/products" },
    ],
  };

  const acronym = (name: string) =>
    name
      .split(/\s|-/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  const brandGradient =
    "linear-gradient(135deg,#000000 0%,#0a0a0a 45%,#FACC15 115%)"; // black → yellow

  const subtleGrid =
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 24px)";

  return (
    <>
      <Header />

      {/* Prevent side-scroll; clip decorative blobs exactly like other pages */}
      <main className="relative bg-white text-black overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-yellow-300" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-black" />
        </div>

        {/* Hero */}
        <section className="relative pt-28 pb-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Products</h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl break-words">
              AI automation for WhatsApp + Web, last-mile delivery orchestration, and an
              admin-managed multi-supplier marketplace, built to scale.
            </p>
          </div>
        </section>

        {/* Quick tags */}
        <section className="py-4 border-t bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: "AI", s: "WhatsApp + Web" },
              { k: "Logistics", s: "Routing & PoD" },
              { k: "Marketplace", s: "Unified checkout" },
              { k: "Enterprise", s: "APIs & SLAs" },
            ].map((x) => (
              <div key={x.s} className="p-4 rounded-lg bg-white border shadow-lg text-center">
                <div className="text-base md:text-xl font-semibold">{x.k}</div>
                <div className="text-xs text-gray-600">{x.s}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Products grid (brand tiles) */}
        <section className="py-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={p.slug}
                className="group relative flex flex-col h-full rounded-xl border bg-white shadow-xl md:hover:scale-105 transition transform-gpu cursor-pointer overflow-hidden"
              >
                <div className="absolute left-3 top-3 z-10 rounded-full bg-black/90 text-white text-xs px-2 py-1 shadow">
                  {p.badge}
                </div>

                {/* Brand cover (no image) */}
                <div
                  className="h-40 w-full"
                  style={{
                    backgroundImage: `${brandGradient}, ${subtleGrid}`,
                    backgroundBlendMode: "overlay, normal",
                  }}
                >
                  <div className="h-full w-full relative">
                    <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full bg-white text-black grid place-items-center text-sm font-semibold shadow">
                      {acronym(p.name)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <h2 className="text-xl font-semibold break-words">{p.name}</h2>
                  <p className="mt-1 text-sm text-gray-700 break-words">{p.tagline}</p>

                  <ul className="mt-4 space-y-2 text-sm">
                    {p.bullets.map((b) => (
                      <li key={b} className="leading-6 break-words">{b}</li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <span className="inline-block px-4 py-2 rounded-md bg-black text-white shadow-xl md:group-hover:-translate-y-0.5 transition">
                      View details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming Soon (blurred/inactive brand tiles) */}
        <section className="py-12 border-t bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold">More products</h2>
              <span className="text-sm text-gray-600">Coming soon</span>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoon.map((c) => (
                <div
                  key={c.name}
                  className="relative flex flex-col h-full rounded-xl border shadow-xl bg-white overflow-hidden select-none"
                  aria-disabled
                >
                  <div
                    className="h-40 w-full"
                    style={{
                      backgroundImage: `${brandGradient}, ${subtleGrid}`,
                      filter: "grayscale(30%) blur(1px)",
                      opacity: 0.75,
                    }}
                  />
                  <div className="p-6 opacity-70">
                    <h3 className="text-lg font-semibold break-words">{c.name}</h3>
                    <p className="mt-1 text-sm text-gray-700 break-words">{c.tagline}</p>
                  </div>
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
                  <div className="absolute left-1/2 top-4 -translate-x-1/2">
                    <span className="inline-block rounded-full border bg-white/80 px-3 py-1 text-xs shadow">
                      Coming soon
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="sr-only">These previews are disabled and will be available soon.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-xl border shadow-xl bg-white">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold">Need a custom SaaS or enterprise rollout?</h3>
                <p className="mt-1 text-sm">We design, build, and integrate AI, logistics, and marketplace solutions.</p>
              </div>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-md bg-black text-white shadow-xl md:hover:scale-105 transition transform-gpu cursor-pointer"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Script id="products-collection-jsonld" type="application/ld+json">
        {JSON.stringify(collectionJsonLd)}
      </Script>
      <Script id="products-itemlist-jsonld" type="application/ld+json">
        {JSON.stringify(itemListJsonLd)}
      </Script>
      <Script id="products-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
