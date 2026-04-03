import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata = {
  title: "Last-Mile Delivery SaaS Logistics Software – Routing, Driver App, PoD",
  description:
    "End-to-end last-mile delivery SaaS logistics platform with driver app, routing, live tracking, proof of delivery, returns, company/merchant tools, and analytics.",
  alternates: { canonical: "/products/logistics-saas" },
  openGraph: {
    title: "Last-Mile Delivery SaaS Logistics Software",
    description:
      "Driver app, dispatch, routing, real-time tracking, PoD, returns, company onboarding, and analytics in one platform.",
    images: [{ url: "/saasglobalhubogimage.png" }],
    url: "https://www.saasglobalhub.com/products/logistics-saas",
    type: "website",
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Last-Mile Delivery SaaS Logistics Software",
    description:
      "Optimize deliveries with routing, driver app, real-time tracking, PoD, and returns workflows.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  const features = [
    { t: "API Access", d: "Seamlessly integrate orders, events, and webhooks with external systems." },
    { t: "Driver’s App", d: "Task feed, navigation, PoD (photo/signature), QR/barcode, returns, shift tracking." },
    { t: "Admin Dashboard", d: "Dispatch board, SLA tracking, heatmaps, analytics, and reporting tools." },
    { t: "Company/Merchant Tools", d: "Onboard companies, manage subscriptions, permissions, and billing." },
    { t: "Routing + Tracking", d: "Route optimization, courier proximity assignment, and real-time tracking." },
    { t: "Returns/RTO", d: "Reverse logistics workflows with full audit trails and automated reporting." },
  ];

  const steps = [
    { t: "Onboard", d: "Create branches, define delivery products/services, and assign supervisors per region." },
    { t: "Dispatch", d: "Receive/import orders via API, auto-assign drivers by proximity and capacity." },
    { t: "Deliver", d: "Drivers complete tasks with PoD. Customers track deliveries live in real time." },
  ];

  const benefits = [
    "Revenue Generation: Monetize third-party deliveries with subscription or per-order billing.",
    "Efficient Branch Management: Manage multiple branches and supervisors across locations.",
    "Seamless Integration: Works with existing e-commerce businesses and logistics partners.",
    "Real-Time Tracking: Full visibility for managers, drivers, and customers.",
    "Comprehensive Dashboard: Oversee orders, driver performance, and third-party company activity.",
    "Operational Efficiency: Optimize routes, reduce delivery times, and cut costs.",
    "Scalability: Easily add new branches and partners as your network grows.",
    "User-Friendly Interface: Simple dashboards for admins, drivers, and companies.",
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does the driver app include?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Real-time task feed, optimized navigation, QR/barcode scanning, proof of delivery (photo/signature), shift tracking, and status updates.",
        },
      },
      {
        "@type": "Question",
        name: "Can third-party companies use the platform?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Third-party companies can onboard, manage branches, and pay per subscription or per delivery.",
        },
      },
      {
        "@type": "Question",
        name: "Do you support returns and reverse logistics?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Built-in RTO/returns workflows provide visibility, tracking, and analytics across all reverse deliveries.",
        },
      },
    ],
  } as const;

  type FAQEntity = {
    name: string;
    acceptedAnswer: { text: string };
  };

  const faqItems = faqJsonLd.mainEntity as readonly (FAQEntity & { [k: string]: unknown })[];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Last-Mile Delivery SaaS Logistics Software",
    applicationCategory: "LogisticsApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      url: "https://www.saasglobalhub.com/products/logistics-saas",
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/PreOrder",
    },
    creator: { "@type": "Organization", name: "SaaSGlobal Hub", url: "https://www.saasglobalhub.com" },
    url: "https://www.saasglobalhub.com/products/logistics-saas",
    description:
      "Logistics SaaS with dispatch, routing, real-time tracking, PoD, returns workflows, merchant onboarding, and analytics.",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.saasglobalhub.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.saasglobalhub.com/products" },
      { "@type": "ListItem", position: 3, name: "Logistics SaaS" },
    ],
  };

  return (
    <>
      <Header />

      <main className="bg-white text-black">
        {/* Hero */}
        <section className="relative pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm bg-white">
              <span className="text-xs">Driver App</span>
              <span className="text-xs">Routing</span>
              <span className="text-xs">PoD</span>
              <span className="text-xs">Company App</span>
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
              What You Need to Know About Our Last-Mile Delivery SaaS Logistics Software
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              Streamline and monetize your delivery operations with branch management, driver &amp; company apps,
              routing optimization, real-time tracking, and returns workflows, all in one SaaS platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Book a Walkthrough
              </Link>
              <Link href="/about" className="px-6 py-3 rounded-md bg-white border border-black shadow-xl hover:scale-105 transition cursor-pointer">
                Platform Overview
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Core Features</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.t} className="h-full p-6 rounded-lg border shadow-xl hover:scale-105 transition bg-white">
                  <h3 className="font-semibold text-lg">{f.t}</h3>
                  <p className="mt-2 text-sm leading-6">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">How the Software Works</h2>
            <p className="mt-2 text-sm max-w-4xl">
              Manage multiple branches, onboard third-party companies, and integrate with e-commerce businesses.
              Drivers receive tasks in-app with navigation and PoD. The super admin dashboard gives full visibility
              into orders, drivers, and company performance.
            </p>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {steps.map((s) => (
                <div key={s.t} className="h-full p-6 rounded-lg border shadow-xl hover:scale-105 transition bg-white">
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-6">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Benefits</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <li key={b} className="h-full p-6 rounded-lg border shadow-xl hover:scale-105 transition bg-white">
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/contact" className="inline-block px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Talk to a Logistics Expert
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">FAQ</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {faqItems.map((x) => (
                <div key={x.name} className="h-full p-6 rounded-lg border shadow-xl hover:scale-105 transition bg-white">
                  <h3 className="font-semibold">{x.name}</h3>
                  <p className="mt-2 text-sm leading-6">{x.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* SEO JSON-LD */}
      <Script id="logistics-product-jsonld" type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </Script>
      <Script id="logistics-faq-jsonld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="logistics-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
