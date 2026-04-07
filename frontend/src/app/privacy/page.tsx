// src/app/privacy/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportPhoneLink from "@/components/site/SupportPhoneLink";
import Link from "next/link";
import Script from "next/script";
import { env, getSiteUrl } from "@/lib/env";

// ---------- SEO ----------
export const metadata = {
  title: "Privacy Policy – SaaSGlobal Hub",
  description:
    "Read the SaaSGlobal Hub Privacy Policy. Learn what data we collect, how we use it, how we share it, and your choices and privacy rights.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy – SaaSGlobal Hub",
    description:
      "How SaaSGlobal Hub collects, uses, shares, and protects your information.",
    url: getSiteUrl("/privacy"),
    type: "website",
    images: [{ url: "/saasglobalhubogimage.png" }],
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy – SaaSGlobal Hub",
    description:
      "How SaaSGlobal Hub collects, uses, shares, and protects your information.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "September 12, 2025";

export default function PrivacyPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    url: getSiteUrl("/privacy"),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "SaaSGlobal Hub",
      url: env.siteUrl,
    },
    dateModified: EFFECTIVE_DATE,
    about: "Privacy policy describing how personal data is collected and processed.",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Privacy", item: getSiteUrl("/privacy") },
    ],
  };

  const toc = [
    ["#scope", "Scope"],
    ["#data-we-collect", "Information we collect"],
    ["#how-we-use", "How we use information"],
    ["#legal-bases", "Legal bases (EEA/UK)"],
    ["#sharing", "How we share information"],
    ["#cookies", "Cookies & analytics"],
    ["#retention", "Data retention"],
    ["#security", "Security"],
    ["#international", "International transfers"],
    ["#your-rights", "Your privacy rights"],
    ["#children", "Children’s privacy"],
    ["#dnt", "Do Not Track"],
    ["#changes", "Changes"],
    ["#contact", "Contact us"],
  ] as const;

  return (
    <>
      <Header />

      {/* Match Terms design: clip any horizontal overflow and keep backdrop inside main */}
      <main className="relative bg-white text-black overflow-x-clip">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        {/* Decorative backdrop (clipped by main) */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-yellow-300" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-black" />
        </div>

        <section className="relative pt-24 sm:pt-28 pb-6 sm:pb-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] sm:text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="mt-1 text-[28px] sm:text-3xl md:text-5xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <p className="text-xs sm:text-sm text-gray-600">Effective date: {EFFECTIVE_DATE}</p>
              <span className="hidden sm:inline-block h-3 w-px bg-gray-300" />
              <p className="text-xs sm:text-sm text-gray-600">Jurisdiction: United States (Kentucky)</p>
            </div>
            <p className="mt-4 text-base sm:text-lg md:text-xl max-w-4xl">
              This Privacy Policy explains how SaaSGlobal Hub (“we”, “us”, “our”) collects, uses, shares, and safeguards information when you use our websites, products, and services.
            </p>
          </div>
        </section>

        <section className="py-4 sm:py-6 border-t bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { h: "Who we are", p: "SaaSGlobal Hub LLC, Lexington, Kentucky, USA" },
              { h: "How to reach us", p: env.supportEmail },
              { h: "Your choices", p: "Access, delete, correct, opt-out of sales/sharing" },
            ].map((x) => (
              <div
                key={x.h}
                className="p-4 sm:p-5 rounded-xl border bg-white shadow-xl md:hover:scale-[1.01] transition will-change-transform"
              >
                <div className="text-sm sm:text-base md:text-lg font-semibold">{x.h}</div>
                <div className="text-[13px] sm:text-sm text-gray-700 mt-1 break-words">
                  {x.h === "How to reach us" ? (
                    <>
                      {env.supportEmail} · <SupportPhoneLink />
                    </>
                  ) : (
                    x.p
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile TOC chips (exact same structure as Terms) */}
        <nav
          aria-label="On this page"
          className="sticky top-20 z-10 block lg:hidden bg-white/90 backdrop-blur border-y"
        >
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 overflow-x-auto overscroll-x-contain">
            <ul className="flex gap-2 py-2 min-w-max">
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
                "max-w-none text-[14px] sm:text-[15px] leading-7 sm:leading-7.5 break-words",
                "[&_p]:m-0",
                "[&_ul]:m-0",
                "[&_ol]:m-0",
                "[&_li]:m-0",
                "[&_ul]:list-disc",
                "[&_ol]:list-decimal",
                "[&_ul]:pl-5",
                "[&_ol]:pl-5",
                "[&_a]:underline",
                "[&_a]:break-words",
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
              <h2 id="scope" className="scroll-mt-24">Scope</h2>
              <p>This policy applies to our websites (including <strong>saasglobalhub.com</strong>), web applications, APIs, mobile experiences, and related services (“Services”). It does not apply to third-party sites, products, or services linked from our Services.</p>

              <h2 id="data-we-collect" className="scroll-mt-24">Information we collect</h2>
              <h3>1) Information you provide</h3>
              <ul>
                <li>Account and profile data (name, email, phone, company, role).</li>
                <li>Content submitted through the Services (messages, uploads, prompts, files, URLs).</li>
                <li>Billing details processed by our payment provider.</li>
                <li>Support inquiries and communications.</li>
              </ul>
              <h3>2) Information from your use of the Services</h3>
              <ul>
                <li>Device/log data (IP, browser/OS, timestamps, referrer, pages).</li>
                <li>Telemetry (feature usage, performance, diagnostics).</li>
                <li>Cookies/SDKs for auth, preferences, analytics.</li>
              </ul>
              <h3>3) Information from third parties</h3>
              <ul>
                <li>Integrations you connect (CRM, help desk, messaging, storage).</li>
                <li>Authorized datasets you provide or expose to us.</li>
              </ul>

              <h2 id="how-we-use" className="scroll-mt-24">How we use information</h2>
              <ul>
                <li>Provide, operate, maintain, and improve the Services.</li>
                <li>Authenticate users; prevent fraud/abuse; protect security.</li>
                <li>Process transactions; billing and administration.</li>
                <li>Deliver and enhance AI features per your configuration.</li>
                <li>Support communications and, where permitted, marketing.</li>
                <li>Comply with law and enforce agreements.</li>
              </ul>

              <h2 id="legal-bases" className="scroll-mt-24">Legal bases for processing (EEA/UK)</h2>
              <p>Where GDPR/UK GDPR applies, we rely on contract, legitimate interests (security, diagnostics, improvement), legal obligations, and consent where required (e.g., certain cookies/marketing).</p>

              <h2 id="sharing" className="scroll-mt-24">How we share information</h2>
              <ul>
                <li><strong>Service providers</strong> for hosting, storage, analytics, support, and payments under contract.</li>
                <li><strong>Integrations you enable</strong> to fulfill the connection.</li>
                <li><strong>Legal & safety</strong> to comply with law or protect rights and security.</li>
                <li><strong>Business transfers</strong> in mergers, acquisitions, financing, or asset sales.</li>
                <li>We do not sell personal information in the traditional sense; where law defines “sale”/“sharing” broadly, you may opt out (see rights below).</li>
              </ul>

              <h2 id="cookies" className="scroll-mt-24">Cookies and analytics</h2>
              <p>We use necessary cookies for authentication and core functionality and, where permitted, analytics cookies to understand product usage. Manage cookies in your browser and, where required, via our banner/preferences.</p>

              <h2 id="retention" className="scroll-mt-24">Data retention</h2>
              <p>We retain information as needed to provide the Services and meet legal obligations. Retention varies by category and use. When no longer required, we delete, aggregate, or anonymize.</p>

              <h2 id="security" className="scroll-mt-24">Security</h2>
              <p>We implement administrative, technical, and physical safeguards (e.g., encryption in transit, least-privilege access, logging/monitoring). No system is 100% secure.</p>

              <h2 id="international" className="scroll-mt-24">International data transfers</h2>
              <p>We are a U.S. company (Kentucky). If you are outside the U.S., your data may be processed in the U.S. and other countries. Where required, we use appropriate safeguards (e.g., EU SCCs).</p>

              <h2 id="your-rights" className="scroll-mt-24">Your privacy rights</h2>
              <p>Depending on your location, you may have rights to access, delete, correct, or port your data; to opt out of targeted advertising or certain “sale”/“sharing”; to limit use of sensitive data; or to appeal a decision.</p>
              <ul>
                <li><strong>EEA/UK</strong>: access, rectification, erasure, restriction, portability, objection, consent withdrawal.</li>
                <li><strong>U.S. states</strong> (e.g., CA, CO, CT, UT, VA): access, delete, correct, portability, opt-out of targeted ads and certain disclosures.</li>
              </ul>
              <p>To exercise rights, email <a className="underline" href={`mailto:${env.privacyEmail}`}>{env.privacyEmail}</a>. We will verify and respond within required timelines. You may use an authorized agent where permitted.</p>

              <h2 id="children" className="scroll-mt-24">Children’s privacy</h2>
              <p>Our Services are not directed to children under 13 (or the age of digital consent in your area). If you believe a child provided data, contact us to request deletion.</p>

              <h2 id="dnt" className="scroll-mt-24">“Do Not Track” and global privacy controls</h2>
              <p>We may recognize supported signals (e.g., Global Privacy Control) as required by applicable law to process opt-out preferences.</p>

              <h2 id="changes" className="scroll-mt-24">Changes to this policy</h2>
              <p>We may update this policy periodically. We will post updates and revise the effective date. If changes materially affect your rights, we will provide additional notice.</p>

              <h2 id="contact" className="scroll-mt-24">How to contact us</h2>
              <p><strong>SaaSGlobal Hub LLC</strong> · {env.officeAddress} · Email: <a className="underline" href={`mailto:${env.privacyEmail}`}>{env.privacyEmail}</a> · Phone: <SupportPhoneLink className="underline" /></p>

              <div className="mt-6 p-4 sm:p-5 rounded-xl border bg-white shadow-xl">
                <p className="m-0 text-[13px] sm:text-sm text-gray-700">Enterprise customer? Need a DPA or security questionnaire? Contact <a className="underline" href={`mailto:${env.privacyEmail}`}>{env.privacyEmail}</a>.</p>
              </div>
            </article>

            {/* Sidebar (matches Terms behavior) */}
            <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
              <div className="rounded-xl border bg-white shadow-xl p-5">
                <div className="text-lg font-semibold">On this page</div>
                <nav className="mt-3" aria-label="On this page">
                  <ul className="space-y-2 text-sm">
                    {toc.map(([href, label]) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="inline-block w-full rounded-md px-3 py-2 md:hover:bg-gray-50 md:hover:scale-[1.01] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-6 p-4 rounded-lg border bg-gray-50 text-xs text-gray-700">
                  This policy is transparent and practical. It is not legal advice.
                </div>
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-block w-full text-center px-5 py-3 rounded-md bg-black text-white shadow-xl md:hover:scale-105 transition cursor-pointer"
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

      <Script id="privacy-webpage-jsonld" type="application/ld+json">
        {JSON.stringify(webPageJsonLd)}
      </Script>
      <Script id="privacy-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
