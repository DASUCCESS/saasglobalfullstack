import "../styles/globals.css";
import FloatingActions from "@/components/sections/FloatingActions";
import ToastViewport from "@/components/ToastView";
import { env, getSiteUrl } from "@/lib/env";
import { API_BASE } from "@/lib/api";

export const metadata = {
  title: {
    default: "SaaSGlobal Hub | AI SaaS, Logistics SaaS, Multi-supplier Ecommerce",
    template: "%s | SaaSGlobal Hub",
  },
  description:
    "We build and ship AI SaaS (OwnMindAI: WhatsApp + Web autosync), Logistics SaaS with driver apps, and Multi-supplier Ecommerce platforms,plus custom SaaS delivery for startups and enterprises.",
  metadataBase: new URL(env.siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: env.siteName,
    url: env.siteUrl,
    title: "AI SaaS, Logistics SaaS & Multi-supplier Platforms",
    description:
      "AI SAAS (WhatsApp + Web AI autosync), Logistics SaaS with mobile Apps, and Multi-supplier Ecommerce. We also build custom SaaS.",
    images: [{ url: "/saasglobalhubogimage.png", width: 1200, height: 630, alt: "SaaSGlobal Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaSGlobal Hub",
    description:
      "AI SaaS, Logistics SaaS, Multi-supplier Ecommerce and custom SaaS development.",
    images: ["/saasglobalhubogimage.png"],
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

type PublicSettingsResponse = {
  site?: {
    header_injection_code?: string;
  };
};

async function getHeaderInjectionCode(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/settings/public/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    const payload = (await response.json()) as PublicSettingsResponse;
    return payload.site?.header_injection_code || "";
  } catch {
    return "";
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerInjectionCode = await getHeaderInjectionCode();

  return (
    <html lang="en">
      <head dangerouslySetInnerHTML={headerInjectionCode ? { __html: headerInjectionCode } : undefined} />
      <body className="bg-white text-black antialiased">
        {/* Organization + Website schema (sitewide) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: env.siteName,
              url: env.siteUrl,
              logo: getSiteUrl("/saasglobalhublogo.png"),
              sameAs: [
                env.twitterUrl,
                env.linkedInUrl,
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: env.siteName,
              url: env.siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: getSiteUrl("/search?q={query}"),
                "query-input": "required name=query",
              },
            }),
          }}
        />
        {children}
        <ToastViewport />
        <FloatingActions />
      </body>
    </html>
  );
}
