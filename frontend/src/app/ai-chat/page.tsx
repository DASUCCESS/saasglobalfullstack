"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChatInterface from "@/components/ai/AIChatInterface";

export default function AIChatPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-16 text-black">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">AI Product Agent</h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            Get short, product-aware answers powered by our live data and company knowledge.
          </p>
          <div className="mt-8">
            <AIChatInterface />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
