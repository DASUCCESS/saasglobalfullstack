import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata = {
  title: "Multi-Supplier E-commerce & Logistics Platform – Admin-Managed Marketplace",
  description:
    "Admin-managed marketplace with vetted suppliers, unified checkout across vendors, automatic rider assignment, and scheduled settlements.",
  alternates: { canonical: "/products/multi-supplier" },
  openGraph: {
    title: "Multi-Supplier E-commerce & Logistics Platform",
    description:
      "Onboard suppliers, list products, enable single checkout, auto-assign riders, and automate payouts.",
    images: [{ url: "/saasglobalhubogimage.png" }],
    url: "https://www.saasglobalhub.com/products/multi-supplier",
    type: "website",
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multi-Supplier E-commerce & Logistics Platform",
    description:
      "Admin-managed marketplace with logistics orchestration and automated settlements.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const kpis = [
    { k: "1 Checkout", s: "Across multiple suppliers" },
    { k: "Auto", s: "Rider assignment & ETAs" },
    { k: "D+0/7/14", s: "Configurable payout cycles" },
    { k: "99.9%", s: "Uptime target" },
  ];

  const how = [
    { t: "Admin Onboards Suppliers", d: "Verify suppliers, create accounts, and import product catalogs." },
    { t: "Customers Browse & Shop", d: "Single storefront with cross-vendor cart and transparent fees." },
    { t: "Order Split & Routing", d: "Orders split per supplier; items routed with notifications." },
    { t: "Logistics Orchestration", d: "Nearest rider auto-assigned; live GPS tracking for customers." },
  ];

  const features = [
    { t: "Admin Module", d: "Supplier onboarding, catalog control, orders, payments, deliveries, analytics." },
    { t: "Customer Experience", d: "Unified cart/checkout, accurate ETAs, order status, and returns initiation." },
    { t: "Logistics Module", d: "Auto rider assignment, courier app/portal, real-time GPS & POD." },
    { t: "Payments & Settlement", d: "Central collection, commission deductions, scheduled supplier payouts." },
    { t: "Promotions/Ads", d: "Featured listings, homepage slots, and boosted search placements." },
    { t: "Analytics", d: "GMV, AOV, top suppliers/SKUs, funnel, delivery performance, RTO rates." },
  ];

  const benefits = [
    "Centralized control: onboard only trusted suppliers; enforce quality & compliance.",
    "Revenue stability: commissions, delivery margins, supplier fees, ads, analytics.",
    "Customer convenience: many suppliers, one cart, one delivery experience.",
    "Operational efficiency: automated routing, ETAs, and consolidated support.",
    "Scalability: add suppliers, categories, and delivery zones without re-architecture.",
  ];

  const faq = [
    {
      q: "How does a multi-supplier ecommerce platform work?",
      a: "Admin vets suppliers, lists products, and enables single checkout across vendors. The system splits orders by supplier, assigns riders, and automates payouts.",
    },
    {
      q: "How are suppliers paid?",
      a: "Commissions and fees are deducted automatically; payouts run on a schedule (weekly/bi-weekly/monthly) for completed orders.",
    },
    {
      q: "Which monetization models are supported?",
      a: "Sales commissions, delivery fees, supplier service fees, ads/featured listings, and paid analytics.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Multi-Supplier E-commerce & Logistics Platform",
    applicationCategory: "ECommerceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      url: "https://www.saasglobalhub.com/products/multi-supplier",
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/PreOrder",
    },
    creator: { "@type": "Organization", name: "SaaSGlobal Hub", url: "https://www.saasglobalhub.com" },
    url: "https://www.saasglobalhub.com/products/multi-supplier",
    description:
      "Admin-managed marketplace with supplier onboarding, unified checkout, logistics assignment, live tracking, and automated settlements.",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.saasglobalhub.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.saasglobalhub.com/products" },
      { "@type": "ListItem", position: 3, name: "Multi-Supplier Platform" },
    ],
  };

  return (
    <>
      <Header />

      <main className="bg-white text-black">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-yellow-300" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-black" />
          <div className="max-w-7xl mx-auto px-6 relative">
            <p className="text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
              Multi-Supplier E-commerce & Logistics Platform
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              Admin-managed marketplace: onboard trusted suppliers, enable single checkout across vendors, orchestrate
              logistics with auto-assigned riders, and automate payouts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                See a Live Demo
              </Link>
              <Link href="/about" className="px-6 py-3 rounded-md border border-black bg-white shadow-xl hover:scale-105 transition cursor-pointer">
                Implementation Guide
              </Link>
            </div>
          </div>
        </section>

        {/* KPI Strip */}
        <section className="py-6 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((x) => (
              <div key={x.s} className="p-4 rounded-lg bg-white border shadow-lg text-center">
                <div className="text-xl font-semibold">{x.k}</div>
                <div className="text-xs text-gray-600">{x.s}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 border-t bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">How It Works</h2>
            <div className="mt-8 grid md:grid-cols-4 gap-6">
              {how.map((x, i) => (
                <div key={x.t} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  <div className="w-8 h-8 grid place-items-center rounded-full border mb-3 text-sm font-semibold">{i + 1}</div>
                  <h3 className="font-semibold">{x.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Core Features</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.t} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  <h3 className="font-semibold text-lg">{f.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Why This Model Works</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <li key={b} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/contact" className="inline-block px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Discuss Your Marketplace
              </Link>
            </div>
          </div>
        </section>

        {/* Monetization */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Monetization</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Sales commissions on orders",
                "Delivery fee margins",
                "Supplier setup/maintenance fees",
                "Paid promotions & featured slots",
                "Premium analytics subscriptions",
              ].map((m) => (
                <li key={m} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">FAQ</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {faq.map((x) => (
                <div key={x.q} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  <h3 className="font-semibold">{x.q}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{x.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-lg border shadow-xl bg-white">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold">Ready to launch your marketplace?</h3>
                <p className="mt-1 text-sm">We implement supplier onboarding, logistics orchestration, and payouts end-to-end.</p>
              </div>
              <Link href="/contact" className="px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Talk to our team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* SEO JSON-LD */}
      <Script id="multi-product-jsonld" type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </Script>
      <Script id="multi-faq-jsonld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="multi-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
