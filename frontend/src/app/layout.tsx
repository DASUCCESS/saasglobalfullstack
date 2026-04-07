import "../styles/globals.css";
import FloatingActions from "@/components/sections/FloatingActions";
import ToastViewport from "@/components/ToastView";

export const metadata = {
  title: {
    default: "SaaSGlobal Hub | AI SaaS, Logistics SaaS, Multi-supplier Ecommerce",
    template: "%s | SaaSGlobal Hub",
  },
  description:
    "We build and ship AI SaaS (OwnMindAI: WhatsApp + Web autosync), Logistics SaaS with driver apps, and Multi-supplier Ecommerce platforms,plus custom SaaS delivery for startups and enterprises.",
  metadataBase: new URL("https://www.saasglobalhub.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SaaSGlobal Hub",
    url: "https://www.saasglobalhub.com",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        {/* Organization + Website schema (sitewide) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SaaSGlobal Hub",
              url: "https://www.saasglobalhub.com",
              logo: "https://www.saasglobalhub.com/saasglobalhublogo.png",
              sameAs: [
                "https://twitter.com/saasglobalhub",
                "https://www.linkedin.com/company/saasglobalhub",
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
              name: "SaaSGlobal Hub",
              url: "https://www.saasglobalhub.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.saasglobalhub.com/search?q={query}",
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
