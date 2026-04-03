import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata = {
  title: "OwnMindAI – WhatsApp + Web AI SaaS (Autosync, One AI Brain, Analytics)",
  description:
    "OwnMindAI autosyncs WhatsApp and Web into one AI brain. Train with files/images/text/URLs, automate workflows, analyze behavior, and expose APIs for your clients.",
  alternates: { canonical: "/products/ai-saas" },
  openGraph: {
    title: "OwnMindAI – WhatsApp + Web AI SaaS",
    description:
      "One AI brain across WhatsApp + Web: trainable chatbot, task automation, analytics, integrations, and client-facing APIs.",
    images: [{ url: "/saasglobalhubogimage.png" }],
    url: "https://www.saasglobalhub.com/products/ai-saas",
    type: "website",
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "OwnMindAI – WhatsApp + Web AI SaaS",
    description:
      "Autosync with WhatsApp, single AI brain, workflow automation, analytics, and APIs.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  // === CONTENT (matches your brief) ===
  const features = [
    {
      t: "Live Chatbot API",
      d: "Automated, trainable customer support on WhatsApp and Web. Grounded answers from your knowledge base.",
    },
    {
      t: "Task Automation",
      d: "Streamline workflows, reduce response times, and improve efficiency with routing, reminders, and approvals.",
    },
    {
      t: "Data Analysis",
      d: "Actionable insights into customer behavior and preferences for better decisions.",
    },
    {
      t: "System Integration",
      d: "Plug into existing systems via APIs/webhooks,smooth operation with your CRM, Helpdesk, ERP, or DWH.",
    },
    {
      t: "Customizable AI Models",
      d: "Train with company documents, images, text, and website URLs. Enforce tone, privacy, and compliance.",
    },
    {
      t: "Autosync (One AI Brain)",
      d: "WhatsApp + Web share a single AI brain for consistent memory and context across channels.",
    },
  ];

  const how = [
    {
      t: "1) Ingest",
      d: "Upload files, paste text, and add URLs (including images) to build a private knowledge base for the AI brain.",
    },
    {
      t: "2) Offer as API",
      d: "You own a dedicated OwnMindAI API, delivered as a white-label solution that you can use internally within your systems or externally across any platform.",
    },
    {
      t: "3) Operate & Scale",
      d: "Automate inquiries, workflows, and analytics across WhatsApp and Web with autosync for consistent experiences.",
    },
  ];

  const benefits = [
    "Automated Customer Interactions: Instantly handle inquiries, scheduling, and information requests.",
    "Improved Efficiency: Offload repetitive tasks; let teams focus on higher-value work.",
    "Personalized Engagement: Learns from interactions to deliver tailored responses and suggestions.",
    "Multi-channel Integration: Seamless across WhatsApp and Web for consistent experiences.",
    "Scalability: Adaptable to diverse industries with configurable behaviors and expansions.",
  ];

  const benefitsWA = [
    "Revenue Generation with API: Offer AI capabilities as a service to other companies to create new income streams.",
    "Operational Insights: Analytics on behaviors and journeys to inform product and support strategy.",
    "Cost Efficiency: Reduce support costs while improving response quality and SLAs.",
    "Autosync with WhatsApp: One AI brain keeps context in sync between WhatsApp and your website.",
  ];

  const useCases = [
    { t: "Customer Support", d: "Tier-0 FAQs, order/status lookups, and guided troubleshooting with human handoff." },
    { t: "Sales Automation", d: "Lead capture/qualify, meeting booking, follow-ups, and CRM enrichment." },
    { t: "Internal Ops", d: "IT/HR self-service, policy Q&A, onboarding assistants, and SOP guidance." },
  ];

  const faq = [
    {
      q: "What is OwnMindAI and how does it help?",
      a: "A cloud AI platform that automates customer interactions, workflows, and analytics across WhatsApp and Web using one AI brain.",
    },
    {
      q: "Can we train the AI with our data?",
      a: "Yes. Upload documents, images, text, and URLs to build a private knowledge base. Answers are grounded with RAG.",
    },
    {
      q: "Can we resell or expose it to our clients?",
      a: "Yes. Offer AI as an API to your clients so they can integrate, customize, and train it for their own operations.",
    },
  ];

  // === SEO JSON-LD ===
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is AI SaaS and how can it help my business?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "AI SaaS automates customer interactions, workflows, and analytics without heavy infrastructure. OwnMindAI autosyncs WhatsApp and Web into one AI brain for consistent support and operations.",
        },
      },
      {
        "@type": "Question",
        name: "Can I train the AI with my files, images, text, and website?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Upload documents, images, text, and URLs to build a private knowledge base. The chatbot answers with retrieval-augmented generation (RAG) using your content.",
        },
      },
      {
        "@type": "Question",
        name: "Can I offer AI capabilities to my own clients via API?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. OwnMindAI exposes APIs and webhooks so you can provide AI as a service to your clients who can customize and train it for their needs.",
        },
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OwnMindAI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      url: "https://www.saasglobalhub.com/products/ai-saas",
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/PreOrder",
    },
    creator: {
      "@type": "Organization",
      name: "SaaSGlobal Hub",
      url: "https://www.saasglobalhub.com",
    },
    url: "https://www.saasglobalhub.com/products/ai-saas",
    description:
      "WhatsApp + Web autosync with one AI brain. Train on files/images/text/URLs, automate workflows, analyze behavior, and expose APIs for your clients.",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.saasglobalhub.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.saasglobalhub.com/products" },
      { "@type": "ListItem", position: 3, name: "OwnMindAI" },
    ],
  };

  return (
    <>
      <Header />

      <main className="bg-white text-black">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-yellow-300" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-black" />
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
              What You Need to Know About Our A.I SaaS
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              One AI brain across WhatsApp and Web. Train with your data, automate tasks, analyze behavior, and expose APIs to your clients.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Request a Demo
              </Link>
              <Link href="/about" className="px-6 py-3 rounded-md border border-black bg-white shadow-xl hover:scale-105 transition cursor-pointer">
                Platform Overview
              </Link>
            </div>
          </div>
        </section>

        {/* KPI strip */}
        <section className="py-6 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: "Autosync", s: "WhatsApp + Web" },
              { k: "1 Brain", s: "Shared context & memory" },
              { k: "RAG", s: "Grounded answers" },
              { k: "API", s: "Dedicated for you"},
            ].map((x) => (
              <div key={x.s} className="p-4 rounded-lg bg-white border shadow-lg text-center">
                <div className="text-xl font-semibold">{x.k}</div>
                <div className="text-xs text-gray-600">{x.s}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Features */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">A.I SaaS Core Features</h2>
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

        {/* How A.I SaaS Works */}
        <section className="py-12 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">How A.I SaaS Works</h2>
            <p className="mt-2 text-sm max-w-4xl">
              Automate customer interactions across WhatsApp and Web. Empower your clients to integrate AI into their operations via API.
              They can customize and train the AI for inquiries, workflows, and analytics,using files, images, text, and documents.
            </p>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {how.map((s) => (
                <div key={s.t} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Benefits of A.I SaaS</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <li key={b} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits of AI WhatsApp SaaS (Autosync + API revenue) */}
        <section className="py-12 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Benefits of AI WhatsApp SaaS</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefitsWA.map((b) => (
                <li key={b} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/contact" className="inline-block px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Get Pricing & API Access
              </Link>
            </div>
          </div>
        </section>

        {/* Where It Shines */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Where It Shines</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((u) => (
                <div key={u.t} className="h-full p-6 rounded-lg border bg-white shadow-xl hover:scale-105 transition">
                  <h3 className="font-semibold">{u.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{u.d}</p>
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
                <h3 className="text-xl md:text-2xl font-semibold">Ready to unify your channels with one AI brain?</h3>
                <p className="mt-1 text-sm">Autosync across WhatsApp + Web with enterprise-grade analytics and APIs.</p>
              </div>
              <Link href="/contact" className="px-6 py-3 rounded-md bg-black text-white shadow-xl hover:scale-105 transition cursor-pointer">
                Talk to our team
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ (visible) */}
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
      </main>

      <Footer />

      {/* SEO JSON-LD */}
      <Script id="ai-saas-software-jsonld" type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </Script>
      <Script id="ai-saas-faq-jsonld" type="application/ld+json">
        {JSON.stringify(faqJsonLd)}
      </Script>
      <Script id="ai-saas-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
