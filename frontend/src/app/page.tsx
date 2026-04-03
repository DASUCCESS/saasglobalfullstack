import Header from "@/components/layout/Header";
import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Products from "../components/sections/Products";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import Testimonials from "../components/sections/Testimonials";
import Contact from "../components/sections/Contact";
import Faq from "@/components/sections/Faq";
import CallToAction from "../components/sections/CallToAction";
import Footer from "@/components/layout/Footer";


export const metadata = {
  title: "AI SaaS, Logistics SaaS & Multi-supplier Platforms",
  description:
    "OwnMindAI connects WhatsApp and Web with autosync for sales and support automation. We also deliver Logistics SaaS with routing/PoD and Multi-supplier Ecommerce platforms.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI SaaS, Logistics SaaS & Multi-supplier Platforms",
    description:
      "WhatsApp + Web autosync AI SaaS, end-to-end Logistics SaaS, and Multi-supplier Ecommerce.",
    images: [{ url: "/saasglobalhubogimage.png" }],
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Products />
      <WhyChooseUs />
      <Testimonials />
      <Contact />
      <Faq />
      <CallToAction />
      <Footer />


      {/* FAQ JSON-LD (Home) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is AI SaaS and how can it help my business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "AI SaaS is cloud-hosted AI software delivered by subscription. It automates support, boosts sales, and improves operations without heavy infrastructure. OwnMindAI connects WhatsApp and Web with autosync to handle chats, lead capture, and workflows."
                }
              },
              {
                "@type": "Question",
                "name": "What is logistics SaaS?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Logistics SaaS manages dispatch, routing, live tracking, proof of delivery, returns, and analytics. SaaSGlobal Hub’s stack reduces failed deliveries and improves on-time performance across hubs and zones."
                }
              },
              {
                "@type": "Question",
                "name": "How does a multi-supplier ecommerce platform work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A multi-supplier platform lets multiple vendors sell in one storefront with shared catalog, payments, and logistics. SaaSGlobal Hub builds vendor onboarding, inventory sync, split payouts, and courier integrations for scale."
                }
              },
              {
                "@type": "Question",
                "name": "Do you also build custom SaaS products?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. We design, build, and scale custom SaaS,including AI automation, logistics tools, and multi-vendor commerce,plus integrations with payments and ERPs."
                }
              }
            ]
          }),
        }}
      />

    </>
  );
}
