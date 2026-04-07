import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportPhoneLink from "@/components/site/SupportPhoneLink";
import SupportWhatsAppLink from "@/components/site/SupportWhatsAppLink";
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

      <main className="relative overflow-x-hidden bg-white text-black">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-yellow-300 opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black opacity-20 blur-3xl" />
        </div>

        <section className="relative pt-28 pb-8">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">SaaSGlobal Hub</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
            <p className="mt-4 max-w-3xl text-lg md:text-xl">
              Reach us via WhatsApp, email, phone, or social media. No forms, just fast, direct support.
            </p>
          </div>
        </section>

        <section className="border-t py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 lg:grid-cols-2">
            <SupportWhatsAppLink className="group rounded-xl border bg-black p-6 text-white shadow-xl transition transform-gpu cursor-pointer md:hover:scale-105">
              <div className="text-sm font-semibold">WhatsApp</div>
              <div className="mt-1 text-lg">
                <SupportPhoneLink asText />
              </div>
              <div className="mt-2 text-xs opacity-80">Fastest response</div>
              <div className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-black shadow transition">
                Chat on WhatsApp
              </div>
            </SupportWhatsAppLink>

            <a
              href="mailto:support@saasglobalhub.com"
              className="group rounded-xl border bg-white p-6 shadow-xl transition transform-gpu cursor-pointer md:hover:scale-105"
              aria-label="Email SaaSGlobal Hub"
            >
              <div className="text-sm font-semibold">Email</div>
              <div className="mt-1 text-lg text-gray-900">support@saasglobalhub.com</div>
              <div className="mt-2 text-xs text-gray-600">Replies within 24–48h (business days)</div>
              <div className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white shadow transition">
                Send an Email
              </div>
            </a>
          </div>
        </section>

        <section className="border-t bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold md:text-2xl">Connect with us</h2>
              <span className="text-xs text-gray-600">Official channels</span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="https://twitter.com/saasglobalhub"
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center gap-4 rounded-xl border bg-white p-6 shadow-xl transition transform-gpu cursor-pointer md:hover:scale-105"
                aria-label="SaaSGlobal Hub on Twitter"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-black">
                  <TwitterIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Twitter</div>
                  <div className="text-sm text-gray-700">@saasglobalhub</div>
                </div>
                <span className="inline-block rounded-md bg-black px-3 py-1 text-xs text-white shadow">
                  Follow
                </span>
              </a>

              <a
                href="https://www.linkedin.com/company/saasglobalhub"
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center gap-4 rounded-xl border bg-white p-6 shadow-xl transition transform-gpu cursor-pointer md:hover:scale-105"
                aria-label="SaaSGlobal Hub on LinkedIn"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#0A66C2]">
                  <LinkedInIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">LinkedIn</div>
                  <div className="text-sm text-gray-700">Company page</div>
                </div>
                <span className="inline-block rounded-md bg-black px-3 py-1 text-xs text-white shadow">
                  Connect
                </span>
              </a>

              <a
                href="https://t.me/saasglobalhub"
                target="_blank"
                rel="noopener noreferrer me"
                className="group flex items-center gap-4 rounded-xl border bg-white p-6 shadow-xl transition transform-gpu cursor-pointer md:hover:scale-105"
                aria-label="SaaSGlobal Hub on Telegram"
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#229ED9]">
                  <TelegramIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Telegram</div>
                  <div className="text-sm text-gray-700">@saasglobalhub</div>
                </div>
                <span className="inline-block rounded-md bg-black px-3 py-1 text-xs text-white shadow">
                  Join
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="border-t py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-6 shadow-xl">
              <h2 className="text-xl font-semibold md:text-2xl">Our Address</h2>
              <p className="mt-2 text-sm text-gray-700">
                828 Lane Allen Rd, Ste 219, Lexington, Kentucky 40504, US
              </p>

              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border bg-gray-50 p-4 shadow">
                  <div className="font-semibold">Support</div>
                  <div className="text-gray-700">Mon–Fri · 9:00–18:00 ET</div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4 shadow">
                  <div className="font-semibold">Enterprise</div>
                  <div className="text-gray-700">SLA windows by contract</div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4 shadow">
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-gray-700">Fastest response</div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4 shadow">
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
                  className="inline-block rounded-md bg-black px-5 py-3 text-white shadow-xl transition transform-gpu cursor-pointer md:hover:scale-105"
                >
                  Explore Products
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-xl">
              <div className="aspect-[16/9] w-full">
                <iframe
                  title="SaaSGlobal Hub, Lexington, KY"
                  src="https://www.google.com/maps?q=828+Lane+Allen+Rd,+Ste+219,+Lexington,+Kentucky+40504&output=embed"
                  loading="lazy"
                  className="h-full w-full border-0"
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