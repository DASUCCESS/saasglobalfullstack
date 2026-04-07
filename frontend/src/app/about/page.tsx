// src/app/about/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportPhoneLink from "@/components/site/SupportPhoneLink";
import { apiGet } from "@/lib/api";
import { env, getSiteUrl } from "@/lib/env";
import Link from "next/link";
import Script from "next/script";

// ---------- SEO ----------
export const metadata = {
  title: "About Us – SaaSGlobal Hub",
  description:
    "Learn about SaaSGlobal Hub: our mission, values, and the platforms we build to help teams launch, scale, and operate with confidence.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us – SaaSGlobal Hub",
    description:
      "We build modern SaaS infrastructure and tools that help companies move faster with clarity, security, and scale.",
    url: getSiteUrl("/about"),
    type: "website",
    images: [{ url: "/og-image.png" }],
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us – SaaSGlobal Hub",
    description:
      "We build modern SaaS infrastructure and tools that help companies move faster with clarity, security, and scale.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "September 12, 2025";

type PublicSettings = {
  contact?: {
    whatsapp_number?: string;
  };
};

export default async function AboutPage() {
  const publicSettings = await apiGet<PublicSettings>("/settings/public/");
  const whatsappNumber = (publicSettings?.contact?.whatsapp_number || "").trim();

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "About SaaSGlobal Hub",
    url: getSiteUrl("/about"),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "SaaSGlobal Hub",
      url: env.siteUrl,
    },
    dateModified: LAST_UPDATED,
    about:
      "SaaSGlobal Hub builds enterprise-grade platforms, APIs, and AI-powered tools for fast-growing teams.",
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SaaSGlobal Hub",
    url: env.siteUrl,
    logo: getSiteUrl("/logo.png"),
    sameAs: [
      env.twitterUrl,
      env.linkedInUrl,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: env.officeStreetAddress,
      addressLocality: env.officeCity,
      addressRegion: env.officeRegion,
      postalCode: env.officePostalCode,
      addressCountry: env.officeCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: env.supportEmail,
        telephone: whatsappNumber,
        availableLanguage: ["English"],
      },
    ],
    foundingDate: "2014-01-01",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl("/") },
      { "@type": "ListItem", position: 2, name: "About", item: getSiteUrl("/about") },
    ],
  };

  const toc = [
    ["#mission", "Mission"],
    ["#story", "Our story"],
    ["#values", "Values"],
    ["#platforms", "What we build"],
    ["#metrics", "By the numbers"],
    ["#customers", "Who we serve"],
    ["#security", "Security & trust"],
    ["#timeline", "Milestones"],
    ["#careers", "Careers"],
    ["#contact", "Contact"],
  ] as const;

  const values = [
    { title: "Customer clarity", desc: "Build for real outcomes. Remove noise. Deliver visible impact." },
    { title: "Reliability first", desc: "Ship fast, guard quality. Secure, observable, reversible by design." },
    { title: "Pragmatic innovation", desc: "Automate the boring; productize what compounds for users." },
    { title: "Own the result", desc: "Act like owners. Default to action. Measure and improve." },
    { title: "Earned trust", desc: "Privacy, security, and respect at every step,no surprises." },
    { title: "Global mindset", desc: "Design for scale, multilingual users, and diverse compliance needs." },
  ];

  const platforms = [
    {
      h: "AI & Automation",
      p: "Agentic workflows, content automation, and decision support built on robust APIs.",
      bullets: ["AI generation & review loops", "Routing, scoring, guardrails", "Usage analytics"],
    },
    {
      h: "Payments & Monetization",
      p: "Subscription tooling, usage metering, and multi-gateway settlement for SaaS.",
      bullets: ["Stripe/Paystack ready", "Credits & limits", "Invoices & dunning"],
    },
    {
      h: "Data & Integrations",
      p: "Secure data connectors with audit, tenancy isolation, and schema governance.",
      bullets: ["OAuth & SSO", "ETL jobs & webhooks", "Domain & subdomain mapping"],
    },
  ];

  const metrics = [
    { k: "99.95%", v: "Target uptime", sub: "Platform SLO across core surfaces" },
    { k: "<200ms", v: "Median API latency", sub: "Measured at edge PoPs" },
    { k: "40+", v: "Integrations", sub: "Payments, storage, auth, analytics" },
    { k: "160+", v: "Security controls", sub: "Policies, checks, and monitors" },
  ];

  const timeline = [
    { year: "2014", title: "Founding", text: "SaaSGlobal Hub is founded with a clear goal: make shipping SaaS easier and safer." },
    { year: "2016", title: "Early customers", text: "First production deployments and multi-tenant backbone established." },
    { year: "2019", title: "Platform maturity", text: "Expanded APIs, observability, and global edge presence." },
    { year: "2022", title: "Enterprise-ready", text: "Advanced security controls, DPAs, and custom SLAs introduced." },
    { year: "2024 - 2025 (Current)", title: "AI expansion", text: "Agentic tooling, usage metering, and enterprise controls across products." },
  ];

  return (
    <>
      <Header />

      <main className="relative bg-white text-black overflow-x-hidden">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        {/* Fixed, clipped decorative backdrop (no overflow) */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-yellow-300" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-black" />
        </div>

        {/* Hero */}
        <section className="relative pt-24 sm:pt-28 pb-6 sm:pb-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] sm:text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="mt-1 text-[28px] sm:text-3xl md:text-5xl font-bold tracking-tight">
              We help teams ship with speed and certainty
            </h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <p className="text-xs sm:text-sm text-gray-600">Founded: 2014 · Last updated: {LAST_UPDATED}</p>
              <span className="hidden sm:inline-block h-3 w-px bg-gray-300" />
              <p className="text-xs sm:text-sm text-gray-600">Headquarters: Lexington, Kentucky · Global-first</p>
            </div>
            <p className="mt-4 text-base sm:text-lg md:text-xl max-w-4xl">
              We build the building blocks of modern SaaS,reliable infrastructure, clean APIs, and thoughtfully
              designed product surfaces,so you can focus on creating value for your customers.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 text-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
              >
                Talk to our team
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-md border px-5 py-3 text-black shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
              >
                Explore solutions
              </Link>
            </div>
          </div>
        </section>

        {/* Key cards */}
        <section className="py-4 sm:py-6 border-t bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { h: "What we do", p: "We ship platforms that reduce complexity and turn operations into leverage." },
              { h: "How we build", p: "Security-first, API-led, measurable outcomes,and design that feels effortless." },
              { h: "Who we serve", p: "Startups to enterprises across fintech, commerce, media, and operations." },
            ].map((x) => (
              <div
                key={x.h}
                className="p-4 sm:p-5 rounded-xl border bg-white shadow-xl md:hover:scale-[1.01] transition cursor-pointer transform-gpu"
              >
                <div className="text-sm sm:text-base md:text-lg font-semibold">{x.h}</div>
                <div className="text-[13px] sm:text-sm text-gray-700 mt-1">{x.p}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile TOC (wrapped chips, no horizontal scroll) */}
        <nav
          aria-label="On this page"
          className="sticky top-20 z-10 block lg:hidden bg-white/90 backdrop-blur border-y"
        >
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            <ul className="flex flex-wrap gap-2 py-2">
              {toc.map(([href, label]) => (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    className="inline-block whitespace-nowrap rounded-full border px-3 py-1.5 text-xs sm:text-[13px] md:hover:scale-105 transition cursor-pointer"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <section id="content" className="py-10 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),320px] gap-8 lg:gap-10">
            <article
              className={[
                "max-w-none text-[14px] sm:text-[15px] leading-7 sm:leading-7.5",
                "[&_p]:m-0",
                "[&_ul]:m-0",
                "[&_ol]:m-0",
                "[&_li]:m-0",
                "[&_ul]:list-disc",
                "[&_ol]:list-decimal",
                "[&_ul]:pl-5",
                "[&_ol]:pl-5",
                "[&_a]:underline",
                "[&_strong]:font-semibold",
                "[&_h2]:mt-6 sm:[&_h2]:mt-8",
                "[&_h2]:mb-1",
                "[&_h2]:text-xl sm:[&_h2]:text-2xl font-semibold",
                "[&_h3]:mt-4",
                "[&_h3]:mb-1",
                "[&_h3]:text-base sm:[&_h3]:text-lg font-semibold",
                "scroll-smooth",
              ].join(" ")}
            >
              <h2 id="mission" className="scroll-mt-24">Mission</h2>
              <p>Empower companies with world-class SaaS tools that accelerate growth and efficiency across industries.</p>

              <h2 id="story" className="scroll-mt-24">Our story</h2>
              <p>Founded in 2014, we began as engineers frustrated by slow, brittle stacks. We turned that friction into leverage,abstracting the heavy lifting into well-designed platforms that compound value over time.</p>

              <h2 id="values" className="scroll-mt-24">Values</h2>
              <ul>
                {values.map((v) => (
                  <li key={v.title}><strong>{v.title}.</strong> {v.desc}</li>
                ))}
              </ul>

              <h2 id="platforms" className="scroll-mt-24">What we build</h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {platforms.map((p) => (
                  <div key={p.h} className="p-4 sm:p-5 rounded-xl border bg-white shadow-xl md:hover:scale-[1.01] transition cursor-pointer transform-gpu">
                    <div className="text-base sm:text-lg font-semibold">{p.h}</div>
                    <p className="mt-1 text-[13px] sm:text-sm text-gray-700">{p.p}</p>
                    <ul className="mt-2 list-disc pl-5 text-[13px] sm:text-sm text-gray-700">
                      {p.bullets.map((b) => (<li key={b}>{b}</li>))}
                    </ul>
                  </div>
                ))}
              </div>

              <h2 id="metrics" className="scroll-mt-24">By the numbers</h2>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metrics.map((m) => (
                  <div key={m.k} className="p-4 sm:p-5 rounded-xl border bg-white shadow-xl text-center md:hover:scale-[1.01] transition cursor-pointer transform-gpu">
                    <div className="text-2xl sm:text-3xl font-bold">{m.k}</div>
                    <div className="text-[13px] sm:text-sm text-gray-700 mt-1">{m.v}</div>
                    <div className="text-[12px] text-gray-500">{m.sub}</div>
                  </div>
                ))}
              </div>

              <h2 id="customers" className="scroll-mt-24">Who we serve</h2>
              <p>Builders across fintech, commerce, logistics, media, education, and developer tools,from first product to enterprise scale.</p>

              <h2 id="security" className="scroll-mt-24">Security & trust</h2>
              <p>Security is embedded at every layer: tenancy isolation, encryption in transit, role-based access, audit logging, and defense-in-depth reviews. We offer DPAs, security questionnaires, and enterprise controls for eligible plans.</p>

              <h2 id="timeline" className="scroll-mt-24">Milestones</h2>
              <ol className="mt-2 space-y-2 list-none pl-0">
                {timeline.map((t) => (
                  <li key={t.year} className="p-4 sm:p-5 rounded-xl border bg-white shadow-xl md:hover:scale-[1.01] transition cursor-pointer transform-gpu">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base sm:text-lg font-semibold">{t.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{t.year}</div>
                    </div>
                    <p className="mt-1 text-[13px] sm:text-sm text-gray-700">{t.text}</p>
                  </li>
                ))}
              </ol>

              <h2 id="careers" className="scroll-mt-24">Careers</h2>
              <p>We hire builders who care about craft and outcomes. If you like ownership, clarity, and compounding impact, you’ll fit right in.</p>
              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 text-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                >
                  We’re hiring
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border px-5 py-3 text-black shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                >
                  Culture & benefits
                </button>
              </div>

              <h2 id="contact" className="scroll-mt-24">Contact</h2>
              <p><strong>SaaSGlobal Hub LLC</strong> · {env.officeAddress} · Email: <a className="underline" href={`mailto:${env.supportEmail}`}>{env.supportEmail}</a> · Phone: <SupportPhoneLink className="underline" /></p>

              <div className="mt-6 p-4 sm:p-5 rounded-xl border bg-white shadow-xl">
                <p className="m-0 text-[13px] sm:text-sm text-gray-700">Enterprise partnership or co-build request? Email <a className="underline" href={`mailto:${env.partnershipsEmail}`}>{env.partnershipsEmail}</a>.</p>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
              <div className="rounded-xl border bg-white shadow-xl p-5">
                <div className="text-lg font-semibold">On this page</div>
                <nav className="mt-3" aria-label="On this page">
                  <ul className="space-y-2 text-sm">
                    {toc.map(([href, label]) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="inline-block w-full rounded-md px-3 py-2 hover:bg-gray-50 md:hover:scale-[1.01] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black transform-gpu"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-6 p-4 rounded-lg border bg-gray-50 text-xs text-gray-700">
                  We’re product people who obsess over details. This page is a snapshot; the work ships every week.
                </div>
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-block w-full text-center px-5 py-3 rounded-md bg-black text-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                  >
                    Contact our team
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />

      <Script id="about-webpage-jsonld" type="application/ld+json">
        {JSON.stringify(webPageJsonLd)}
      </Script>
      <Script id="about-org-jsonld" type="application/ld+json">
        {JSON.stringify(orgJsonLd)}
      </Script>
      <Script id="about-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
