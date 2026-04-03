"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiPost } from "@/lib/api";

type Card = {
  slug: string;
  title: string;
  tagline: string;
  price_usd: number;
  price_ngn: number;
  image_url?: string;
  short_description: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  cards?: Card[];
};

export default function AIChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi 👋 I can answer product and company questions. Ask me anything.",
    },
  ]);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const userText = question.trim();
    setQuestion("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: "I'm currently pulling latest updates and will respond shortly..." },
    ]);
    setLoading(true);

    const response = await apiPost<{ answer: string; cards?: Card[] }>("/ai/ask/", { question: userText });

    setMessages((prev) => {
      const clone = [...prev];
      clone[clone.length - 1] = {
        role: "assistant",
        text: response?.answer || "Sorry, I couldn't process that. Please try again.",
        cards: response?.cards || [],
      };
      return clone;
    });

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="bg-white text-black min-h-screen pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AI Product Assistant</h1>
          <p className="mt-2 text-gray-600">Real-time product-aware chat powered by live backend data and trainable company context.</p>

          <div className="mt-6 rounded-2xl border bg-gray-50 p-4 md:p-6 shadow-xl">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block max-w-[90%] rounded-2xl px-4 py-3 text-sm md:text-base ${m.role === "user" ? "bg-black text-white" : "bg-white border"}`}>
                    {m.text}
                  </div>

                  {!!m.cards?.length && (
                    <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {m.cards.map((card) => (
                        <Link href={`/products/${card.slug}`} key={card.slug} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col min-h-[240px]">
                          <div className="h-28 rounded-lg bg-gradient-to-br from-black via-zinc-900 to-yellow-400 overflow-hidden mb-3">
                            {card.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">{card.title}</h3>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[2.5rem]">{card.tagline}</p>
                          <p className="text-sm mt-2 line-clamp-3 min-h-[3.8rem]">{card.short_description}</p>
                          <div className="mt-auto pt-3 text-sm font-medium">
                            USD ${card.price_usd} · ₦{card.price_ngn}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={ask} className="mt-4 flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about products, prices, features, or company details..."
                className="flex-1 rounded-xl border px-4 py-3 bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-black text-white px-5 py-3 disabled:opacity-50"
              >
                {loading ? "Thinking..." : "Send"}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
