// src/app/contact/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import Link from "next/link";
import { apiGet } from "@/lib/api";

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M20.999 7.548c.013.177.013.355.013.533 0 5.43-4.131 11.686-11.686 11.686-2.321 0-4.478-.681-6.294-1.858a8.29 8.29 0 0 0 6.108-1.711 4.125 4.125 0 0 1-3.852-2.86c.253.038.508.063.772.063.374 0 .748-.05 1.096-.144a4.118 4.118 0 0 1-3.302-4.042v-.051c.552.307 1.186.492 1.86.516A4.11 4.11 0 0 1 3.5 6.16c0-.763.203-1.474.558-2.089a11.709 11.709 0 0 0 8.493 4.308 4.644 4.644 0 0 1-.102-.942 4.114 4.114 0 0 1 7.118-2.814 8.08 8.08 0 0 0 2.607-.996 4.124 4.124 0 0 1-1.808 2.27 8.23 8.23 0 0 0 2.369-.643 8.852 8.852 0 0 1-1.736 1.294z" fill="currentColor" />
    </svg>
  );
}
function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M4.984 3.5C4.984 4.604 4.1 5.5 3 5.5S1.016 4.604 1.016 3.5C1.016 2.395 1.9 1.5 3 1.5s1.984.895 1.984 2zM2 7h2v14H2V7zm6.5 0H11v1.9h.028c.348-.66 1.198-1.357 2.466-1.357 2.637 0 3.506 1.733 3.506 3.985V21H15v-6.2c0-1.48-.027-3.382-2.061-3.382-2.064 0-2.38 1.611-2.38 3.274V21H8.5V7z" fill="currentColor" />
    </svg>
  );
}
function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M21.944 3.38a1.3 1.3 0 0 0-1.36-.232L2.77 10.742a.95.95 0 0 0 .058 1.79l4.835 1.68 1.865 5.98a.95.95 0 0 0 1.64.32l2.69-3.087 4.5 3.48a1.3 1.3 0 0 0 2.045-.77l3.02-15.42a1.3 1.3 0 0 0-.48-1.334ZM8.28 13.585l9.7-6.05-7.76 7.25a.84.84 0 0 0-.25.5l-.28 2.01-1.41-3.71Z" fill="currentColor" />
    </svg>
  );
}

export const metadata = {
  title: "Contact Us – SaaSGlobal Hub",
  description:
    "Reach the SaaSGlobal Hub team for demos, pricing, support, and partnerships. WhatsApp, email, phone, and socials , no forms.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact SaaSGlobal Hub",
    description:
      "Talk to our team about OwnMindAI, Last-Mile Logistics SaaS, and the Multi-supplier Platform. Demos, quotes, and integrations.",
    url: "https://www.saasglobalhub.com/contact",
    type: "website",
    images: [{ url: "/saasglobalhubogimage.png" }],
    siteName: "SaaSGlobal Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact SaaSGlobal Hub",
    description:
      "Book a demo or talk to our team about AI, logistics, and marketplace solutions.",
    images: ["/saasglobalhubogimage.png"],
  },
  robots: { index: true, follow: true },
};

type PublicSettings = {
  contact?: {
    whatsapp_number?: string;
  };
};

export default async function Page() {
  const publicSettings = await apiGet<PublicSettings>("/settings/public/");
  const whatsappNumber = (publicSettings?.contact?.whatsapp_number || "").trim();
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#";

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact SaaSGlobal Hub",
    url: "https://www.saasglobalhub.com/contact",
    inLanguage: "en",
    mainEntity: {
      "@type": "Organization",
      name: "SaaSGlobal Hub",
      url: "https://www.saasglobalhub.com",
      logo: "https://www.saasglobalhub.com/saasglobalhublogo.png",
      address: {
        "@type": "PostalAddress",
        streetAddress: "828 Lane Allen Rd, Ste 219",
        addressLocality: "Lexington",
        addressRegion: "KY",
        postalCode: "40504",
        addressCountry: "US",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "support@saasglobalhub.com",
          telephone: whatsappNumber,
          areaServed: "US",
          availableLanguage: ["English"],
        },
      ],
      sameAs: [
        "https://twitter.com/saasglobalhub",
        "https://www.linkedin.com/company/saasglobalhub",
        "https://t.me/saasglobalhub",
      ],
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.saasglobalhub.com/" },
      { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.saasglobalhub.com/contact" },
    ],
  };

  return (
    <>
      <Header />

      <main className="relative bg-white text-black overflow-x-hidden">
        {/* Fixed, clipped decorative backdrop */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-yellow-300" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-black" />
        </div>

        {/* Hero */}
        <section className="relative pt-28 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs tracking-wide uppercase text-gray-500">SaaSGlobal Hub</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">Contact Us</h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              Reach us via WhatsApp, email, phone, or social media. No forms,just fast, direct support.
            </p>
          </div>
        </section>

        {/* Primary Channels */}
        <section className="py-8 border-t">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-xl border bg-black text-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
              aria-label="Chat with us on WhatsApp"
            >
              <div className="text-sm font-semibold">WhatsApp</div>
              <div className="mt-1 text-lg">{whatsappNumber || "Not available"}</div>
              <div className="mt-2 text-xs opacity-80">Fastest response</div>
              <div className="mt-4 inline-block rounded-md bg-white text-black px-4 py-2 shadow transition">
                Chat on WhatsApp
              </div>
            </a>

            <a
              href="mailto:support@saasglobalhub.com"
              className="group p-6 rounded-xl border bg-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
              aria-label="Email SaaSGlobal Hub"
            >
              <div className="text-sm font-semibold">Email</div>
              <div className="mt-1 text-lg text-gray-900">support@saasglobalhub.com</div>
              <div className="mt-2 text-xs text-gray-600">Replies within 24–48h (business days)</div>
              <div className="mt-4 inline-block rounded-md bg-black text-white px-4 py-2 shadow transition">
                Send an Email
              </div>
            </a>
          </div>
        </section>

        {/* Social Media */}
        <section className="py-8 border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold">Connect with us</h2>
              <span className="text-xs text-gray-600">Official channels</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <a
                href="https://twitter.com/saasglobalhub"
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center gap-4 p-6 rounded-xl border bg-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                aria-label="SaaSGlobal Hub on Twitter"
              >
                <div className="grid place-items-center w-11 h-11 rounded-lg" style={{ backgroundColor: "#000000" }}>
                  <TwitterIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Twitter</div>
                  <div className="text-sm text-gray-700">@saasglobalhub</div>
                </div>
                <span className="inline-block rounded-md bg-black text-white px-3 py-1 text-xs shadow">
                  Follow
                </span>
              </a>

              <a
                href="https://www.linkedin.com/company/saasglobalhub"
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center gap-4 p-6 rounded-xl border bg-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                aria-label="SaaSGlobal Hub on LinkedIn"
              >
                <div className="grid place-items-center w-11 h-11 rounded-lg" style={{ backgroundColor: "#0A66C2" }}>
                  <LinkedInIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">LinkedIn</div>
                  <div className="text-sm text-gray-700">Company page</div>
                </div>
                <span className="inline-block rounded-md bg-black text-white px-3 py-1 text-xs shadow">
                  Connect
                </span>
              </a>

              <a
                href="https://t.me/saasglobalhub"
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center gap-4 p-6 rounded-xl border bg-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                aria-label="SaaSGlobal Hub on Telegram"
              >
                <div className="grid place-items-center w-11 h-11 rounded-lg" style={{ backgroundColor: "#229ED9" }}>
                  <TelegramIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Telegram</div>
                  <div className="text-sm text-gray-700">@saasglobalhub</div>
                </div>
                <span className="inline-block rounded-md bg-black text-white px-3 py-1 text-xs shadow">
                  Join
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Address + Map */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white shadow-xl p-6">
              <h2 className="text-xl md:text-2xl font-semibold">Our Address</h2>
              <p className="mt-2 text-sm text-gray-700">
                828 Lane Allen Rd, Ste 219, Lexington, Kentucky 40504, US
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-lg border bg-gray-50 shadow">
                  <div className="font-semibold">Support</div>
                  <div className="text-gray-700">Mon–Fri · 9:00–18:00 ET</div>
                </div>
                <div className="p-4 rounded-lg border bg-gray-50 shadow">
                  <div className="font-semibold">Enterprise</div>
                  <div className="text-gray-700">SLA windows by contract</div>
                </div>
                <div className="p-4 rounded-lg border bg-gray-50 shadow">
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-gray-700">Fastest response</div>
                </div>
                <div className="p-4 rounded-lg border bg-gray-50 shadow">
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-700">24–48h business days</div>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                Need a DPA or security questionnaire? Mention it when you reach out.
              </div>

              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-block px-5 py-3 rounded-md bg-black text-white shadow-xl md:hover:scale-105 transition cursor-pointer transform-gpu"
                >
                  Explore Products
                </Link>
              </div>
            </div>

            <div className="rounded-xl border bg-white shadow-xl overflow-hidden">
              <div className="aspect-[16/9] w-full">
                <iframe
                  title="SaaSGlobal Hub , Lexington, KY"
                  src="https://www.google.com/maps?q=828+Lane+Allen+Rd,+Ste+219,+Lexington,+Kentucky+40504&output=embed"
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Script id="contactpage-jsonld" type="application/ld+json">
        {JSON.stringify(contactPageJsonLd)}
      </Script>
      <Script id="contact-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </Script>
    </>
  );
}
