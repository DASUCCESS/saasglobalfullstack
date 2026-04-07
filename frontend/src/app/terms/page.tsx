// src/app/terms/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportPhoneLink from "@/components/site/SupportPhoneLink";
import Link from "next/link";
import Script from "next/script";
import { env, getSiteUrl } from "@/lib/env";

// ---------- SEO ----------
export const metadata = {
  title: "Terms of Service – SaaSGlobal Hub",
  description:
    "Review the SaaSGlobal Hub Terms of Service. Understand your rights and responsibilities when using our products and services.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service – SaaSGlobal Hub",
    description:
      "The agreement governing your use of SaaSGlobal Hub products and services.",
    url: getSiteUrl("/terms"),
    type: "website",
    images: [{ url: "/saasglobalhubogimage.png" }],
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service – SaaSGlobal Hub",
    description:
      "The agreement governing your use of SaaSGlobal Hub products and services.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "September 12, 2025";

export default function TermsPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    url: getSiteUrl("/terms"),
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "SaaSGlobal Hub",
      url: env.siteUrl,
    },
    dateModified: EFFECTIVE_DATE,
    about:
      "Terms of Service governing access to and use of SaaSGlobal Hub websites, applications, APIs, and related services.",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Terms", item: getSiteUrl("/terms") },
    ],
  };

  const toc = [
    ["#acceptance", "Acceptance of terms"],
    ["#eligibility", "Eligibility & accounts"],
    ["#subscriptions", "Subscriptions & billing"],
    ["#free-trials", "Trials & promotions"],
    ["#acceptable-use", "Acceptable use"],
    ["#customer-data", "Customer data & IP"],
    ["#our-ip", "Our IP & licenses"],
    ["#ai-features", "AI features"],
    ["#third-parties", "Third-party services"],
    ["#confidentiality", "Confidentiality"],
    ["#privacy", "Privacy"],
    ["#security", "Security"],
    ["#uptime", "Uptime & support"],
    ["#warranties", "Disclaimers"],
    ["#liability", "Limitation of liability"],
    ["#indemnity", "Indemnification"],
    ["#termination", "Term & termination"],
    ["#governing-law", "Governing law"],
    ["#disputes", "Dispute resolution"],
    ["#modifications", "Changes to terms"],
    ["#export", "Export & sanctions"],
    ["#government", "U.S. government rights"],
    ["#publicity", "Publicity"],
    ["#beta", "Beta & pre-release"],
    ["#feedback", "Feedback"],
    ["#notices", "Notices"],
    ["#misc", "Miscellaneous"],
    ["#contact", "Contact us"],
  ] as const;

  return (
    <>
      <Header />

      {/* Prevent side scroll on mobile and clip decorative blobs */}
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
              Terms of Service
            </h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <p className="text-xs sm:text-sm text-gray-600">Effective date: {EFFECTIVE_DATE}</p>
              <span className="hidden sm:inline-block h-3 w-px bg-gray-300" />
              <p className="text-xs sm:text-sm text-gray-600">Jurisdiction: United States (Kentucky)</p>
            </div>
            <p className="mt-4 text-base sm:text-lg md:text-xl max-w-4xl">
              These Terms of Service (“Terms”) form a binding agreement between you and SaaSGlobal Hub LLC (“SaaSGlobal Hub”, “we”, “us”, “our”) governing your access to and use of our websites, applications, APIs, and related services (collectively, the “Services”).
            </p>
          </div>
        </section>

        <section className="py-4 sm:py-6 border-t bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { h: "Legal entity", p: "SaaSGlobal Hub LLC, Lexington, Kentucky, USA" },
              { h: "Contract scope", p: "Your access and use of the Services, including paid subscriptions and APIs" },
              { h: "Support", p: env.supportEmail },
            ].map((x) => (
              <div
                key={x.h}
                className="p-4 sm:p-5 rounded-xl border bg-white shadow-xl md:hover:scale-[1.01] transition will-change-transform"
              >
                <div className="text-sm sm:text-base md:text-lg font-semibold">{x.h}</div>
                <div className="text-[13px] sm:text-sm text-gray-700 mt-1 break-words">
                  {x.h === "Support" ? (
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

        {/* Mobile TOC chips (self-contained horizontal scroll, no page side-scroll) */}
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
                    className="inline-block whitespace-nowrap rounded-full border px-3 py-1.5 text-xs sm:text-[13px] md:hover:bg-gray-50 md:hover:scale-105 transition cursor-pointer"
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
              <h2 id="acceptance" className="scroll-mt-24">Acceptance of terms</h2>
              <p>By accessing or using the Services, creating an account, or clicking “Agree”, you accept these Terms. If you use the Services on behalf of an entity, you represent that you have authority to bind that entity; “you” also refers to that entity.</p>

              <h2 id="eligibility" className="scroll-mt-24">Eligibility & accounts</h2>
              <ul>
                <li>You must be at least 13 years old (or the age of digital consent in your region) to use the Services.</li>
                <li>Provide accurate registration details and keep credentials confidential. You are responsible for activity under your account.</li>
                <li>We may suspend or terminate accounts for violations or risks to security, confidentiality, or legal compliance.</li>
              </ul>

              <h2 id="subscriptions" className="scroll-mt-24">Subscriptions & billing</h2>
              <ul>
                <li>Paid plans renew automatically unless cancelled per your plan terms.</li>
                <li>Fees are charged to your selected payment method; taxes may apply.</li>
                <li>Except where required by law or expressly stated, payments are non-refundable.</li>
              </ul>

              <h2 id="free-trials" className="scroll-mt-24">Trials & promotions</h2>
              <p>Trial access may be offered for evaluation. We may limit features or duration and may require a payment method to start the trial. At trial end, charges begin unless you cancel.</p>

              <h2 id="acceptable-use" className="scroll-mt-24">Acceptable use</h2>
              <ul>
                <li>No illegal activity, infringement, harassment, or content violating others’ rights.</li>
                <li>No reverse engineering, scraping at scale, rate-limit abuse, or attempts to bypass security.</li>
                <li>No uploading of malware or introduction of vulnerabilities.</li>
                <li>Comply with applicable laws, export controls, and sanctions.</li>
              </ul>

              <h2 id="customer-data" className="scroll-mt-24">Customer data & intellectual property</h2>
              <p>“Customer Data” means content you or your end users submit to the Services. As between you and us, you retain ownership of Customer Data. You grant us a worldwide, limited license to host, process, transmit, display, and otherwise use Customer Data solely to provide and improve the Services and as described in our Privacy Policy.</p>

              <h2 id="our-ip" className="scroll-mt-24">Our IP & licenses</h2>
              <p>We and our licensors retain all rights, title, and interest in the Services, software, documentation, and trademarks. Subject to these Terms and payment of fees, we grant you a non-exclusive, non-transferable, revocable license to access and use the Services during your subscription term.</p>

              <h2 id="ai-features" className="scroll-mt-24">AI features</h2>
              <ul>
                <li>Outputs may be probabilistic, may contain errors, and should be reviewed by you. You are responsible for how you use outputs.</li>
                <li>Do not use AI features to generate unlawful, infringing, deceptive, or harmful content.</li>
                <li>Where applicable, we may use providers to power AI functionality subject to appropriate agreements.</li>
              </ul>

              <h2 id="third-parties" className="scroll-mt-24">Third-party services</h2>
              <p>Integrations or links to third-party services are provided for convenience. We are not responsible for third-party terms, privacy, or performance. Your use of third-party services is at your discretion and subject to their terms.</p>

              <h2 id="confidentiality" className="scroll-mt-24">Confidentiality</h2>
              <p>Each party may access the other’s confidential information and will use reasonable care to protect it, using it only as necessary to perform under these Terms. This section does not restrict disclosures required by law, provided reasonable notice is given where lawful.</p>

              <h2 id="privacy" className="scroll-mt-24">Privacy</h2>
              <p>Your use of the Services is subject to our <Link href="/privacy">Privacy Policy</Link>. Where a data processing agreement (DPA) is required, we will provide one on request for eligible plans.</p>

              <h2 id="security" className="scroll-mt-24">Security</h2>
              <p>We implement administrative, technical, and physical safeguards appropriate to the risk. You are responsible for securing your accounts, devices, and credentials.</p>

              <h2 id="uptime" className="scroll-mt-24">Uptime & support</h2>
              <p>We strive for high availability and timely support. Any service credits, SLAs, or support tiers are provided as described in your plan details or separate order form.</p>

              <h2 id="warranties" className="scroll-mt-24">Disclaimers</h2>
              <p>THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE”. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE ERROR-FREE OR UNINTERRUPTED.</p>

              <h2 id="liability" className="scroll-mt-24">Limitation of liability</h2>
              <ul>
                <li>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY WILL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR LOST PROFITS, REVENUE, OR DATA, EVEN IF ADVISED OF THE POSSIBILITY.</li>
                <li>EXCEPT FOR YOUR PAYMENT OBLIGATIONS OR LIABILITY ARISING FROM YOUR BREACH OF “ACCEPTABLE USE”, EACH PARTY’S TOTAL LIABILITY UNDER THESE TERMS IS LIMITED TO THE AMOUNTS PAID OR PAYABLE BY YOU TO US FOR THE SERVICES IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO LIABILITY.</li>
              </ul>

              <h2 id="indemnity" className="scroll-mt-24">Indemnification</h2>
              <p>You will defend and indemnify SaaSGlobal Hub and its affiliates against claims arising from your (or your end users’) misuse of the Services, Customer Data, or violation of these Terms or applicable law.</p>

              <h2 id="termination" className="scroll-mt-24">Term & termination</h2>
              <ul>
                <li>These Terms remain in effect while you use the Services. Either party may terminate for material breach not cured within 30 days after written notice.</li>
                <li>Upon termination, your access ceases. We may provide limited retrieval of Customer Data per then-current policies.</li>
              </ul>

              <h2 id="governing-law" className="scroll-mt-24">Governing law</h2>
              <p>These Terms are governed by the laws of the Commonwealth of Kentucky and applicable U.S. federal law, without regard to conflict of laws rules.</p>

              <h2 id="disputes" className="scroll-mt-24">Dispute resolution</h2>
              <ul>
                <li><strong>Informal resolution.</strong> Contact us first to attempt good-faith resolution.</li>
                <li><strong>Arbitration.</strong> Any dispute not resolved informally will be finally settled by binding arbitration administered by a recognized provider. Venue: Fayette County, Kentucky, USA. You and we waive jury trial.</li>
                <li><strong>Class action waiver.</strong> Disputes are resolved only on an individual basis; no class or representative actions.</li>
                <li>Some consumer rights may not be waivable; if unenforceable, the dispute will be heard by a court of competent jurisdiction in Kentucky.</li>
              </ul>

              <h2 id="modifications" className="scroll-mt-24">Changes to terms</h2>
              <p>We may update these Terms periodically. We will post updates and revise the effective date above. Material changes will be communicated using reasonable means. Continued use after changes constitutes acceptance.</p>

              <h2 id="export" className="scroll-mt-24">Export & sanctions</h2>
              <p>You represent that you are not subject to sanctions and will not use the Services in violation of export control or sanctions laws. You will not export or re-export the Services to prohibited destinations or users.</p>

              <h2 id="government" className="scroll-mt-24">U.S. government rights</h2>
              <p>If accessed by or on behalf of a U.S. government agency, the Services are “commercial computer software” and “commercial computer software documentation” and are licensed with only the rights set forth in these Terms.</p>

              <h2 id="publicity" className="scroll-mt-24">Publicity</h2>
              <p>We may identify you as a customer (name and logo) in marketing materials and on our website. You may opt out by notifying us in writing.</p>

              <h2 id="beta" className="scroll-mt-24">Beta & pre-release</h2>
              <p>Beta features may be provided for evaluation only, may change at any time, and are provided without warranties or SLA. We may suspend or discontinue beta access at our discretion.</p>

              <h2 id="feedback" className="scroll-mt-24">Feedback</h2>
              <p>If you provide feedback or suggestions, you grant us a royalty-free, perpetual license to use them without restriction or obligation.</p>

              <h2 id="notices" className="scroll-mt-24">Notices</h2>
              <p>We may send notices to the email associated with your account or by posting within the Services. You will send legal notices to: SaaSGlobal Hub LLC, {env.officeAddress}, and a copy to <a href={`mailto:${env.legalEmail}`} className="underline">{env.legalEmail}</a>.</p>

              <h2 id="misc" className="scroll-mt-24">Miscellaneous</h2>
              <ul>
                <li><strong>Assignment.</strong> You may not assign these Terms without our consent; we may assign to an affiliate or in connection with a merger or asset sale.</li>
                <li><strong>Entire agreement.</strong> These Terms and any order forms/SLA constitute the entire agreement and supersede prior agreements on the Services.</li>
                <li><strong>Severability.</strong> If a provision is unenforceable, the remainder remains in effect.</li>
                <li><strong>Waiver.</strong> Failure to enforce a provision is not a waiver.</li>
                <li><strong>Force majeure.</strong> Neither party is liable for delays or failures due to causes beyond reasonable control.</li>
              </ul>

              <h2 id="contact" className="scroll-mt-24">How to contact us</h2>
              <p><strong>SaaSGlobal Hub LLC</strong> · {env.officeAddress} · Email: <a className="underline" href={`mailto:${env.legalEmail}`}>{env.legalEmail}</a> · Phone: <SupportPhoneLink className="underline" /></p>

              <div className="mt-6 p-4 sm:p-5 rounded-xl border bg-white shadow-xl">
                <p className="m-0 text-[13px] sm:text-sm text-gray-700">Enterprise terms or a custom MSA? Contact <a className="underline" href={`mailto:${env.legalEmail}`}>{env.legalEmail}</a>.</p>
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
                          className="inline-block w-full rounded-md px-3 py-2 md:hover:bg-gray-50 md:hover:scale-[1.01] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-6 p-4 rounded-lg border bg-gray-50 text-xs text-gray-700">
                  These Terms summarize key obligations and protections. They are not legal advice.
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

      <Script id="terms-webpage-jsonld" type="application/ld+json">
        {JSON.stringify(webPageJsonLd)}
      </Script>
      <Script id="terms-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
