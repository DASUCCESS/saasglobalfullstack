"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, SendHorizontal } from "lucide-react";
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
  typing?: boolean;
};

export default function AIChatInterface({ compact = false }: { compact?: boolean }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi 👋 I can answer product and company questions. Ask me anything.",
    },
  ]);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const userText = question.trim();
    setQuestion("");

    setMessages((prev) => [...prev, { role: "user", text: userText }, { role: "assistant", text: "", typing: true }]);
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
    <div className={`rounded-2xl border bg-gray-50 shadow-xl ${compact ? "p-3 sm:p-4" : "p-4 md:p-6"}`}>
      <div ref={feedRef} className={`space-y-4 overflow-y-auto pr-1 ${compact ? "max-h-[55vh]" : "max-h-[60vh]"}`}>
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[92%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                m.role === "user" ? "bg-black text-white" : "bg-white border"
              }`}
            >
              {m.typing ? (
                <span className="inline-flex items-center gap-1" aria-label="AI is typing">
                  <span className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-gray-500 animate-pulse [animation-delay:180ms]" />
                  <span className="h-2 w-2 rounded-full bg-gray-500 animate-pulse [animation-delay:360ms]" />
                </span>
              ) : (
                m.text
              )}
            </div>

            {!!m.cards?.length && (
              <div className={`mt-3 grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                {m.cards.map((card) => (
                  <Link
                    href={`/products/${card.slug}`}
                    key={card.slug}
                    className="rounded-xl border bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col min-h-[220px]"
                  >
                    <div className="h-24 rounded-lg bg-gradient-to-br from-black via-zinc-900 to-yellow-400 overflow-hidden mb-3">
                      {card.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">{card.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-[2.5rem]">{card.tagline}</p>
                    <p className="text-sm mt-2 line-clamp-2 min-h-[3.2rem]">{card.short_description}</p>
                    <div className="mt-auto pt-3 text-sm font-medium">USD ${card.price_usd} · ₦{card.price_ngn}</div>
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
          className="rounded-xl bg-black text-white px-4 py-3 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          <span>{loading ? "Thinking" : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
