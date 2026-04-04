"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChatInterface from "@/components/ai/AIChatInterface";

export default function AIChatPage() {
  return (
    <>
      <Header />
      <main className="bg-white text-black min-h-screen pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Product Assistant</h1>
          <p className="mt-3 text-gray-600 max-w-3xl">
            Real-time product-aware chat powered by live backend data and trainable company context.
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
