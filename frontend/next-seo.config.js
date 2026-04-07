const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saasglobalhub.com").replace(/\/$/, "");

export default {
  title: "SaaSGlobal Hub - Leading SaaS Solutions",
  description:
    "SaaSGlobal Hub delivers AI SaaS, Logistics SaaS, and Multi-supplier platforms. Trusted SaaS solutions for scaling businesses.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteUrl}/`,
    site_name: process.env.NEXT_PUBLIC_SITE_NAME || "SaaSGlobal Hub",
    images: [
      {
        url: "/saasglobalhubogimage.png",
        width: 1200,
        height: 630,
        alt: "SaaSGlobal Hub",
      },
    ],
  },
  twitter: {
    handle: "@saasglobalhub",
    site: "@saasglobalhub",
    cardType: "summary_large_image",
  },
};
