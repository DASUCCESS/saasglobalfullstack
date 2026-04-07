"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, SendHorizontal } from "lucide-react";
import { apiPost } from "@/lib/api";

type Card = {
  slug: string;
  title: string;
  tagline: string;
  price_usd: number;
  price_ngn: number;
  image_url?: string;
  short_description: string;
  demo_url?: string;
  delivery_type?: string;
};

type AskResponse = {
  answer: string;
  cards?: Card[];
  mode?: "general" | "product" | "product_discovery" | "product_detail";
  primary_product_slug?: string;
  primary_product_name?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: Card[];
  typing?: boolean;
  animate?: boolean;
  readMoreSlug?: string;
  readMoreLabel?: string;
};

type StoredChatState = {
  messages: Array<{
    id?: string;
    role: "user" | "assistant";
    text: string;
    cards?: Card[];
    readMoreSlug?: string;
    readMoreLabel?: string;
  }>;
  lastProductSlug: string;
  lastProductName: string;
};

type ViewerLocation = {
  country_code?: string;
  country_name?: string;
  is_nigeria?: boolean;
};

const STORAGE_KEY = "saasglobalhub_ai_chat_history_v3";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const defaultMessages: ChatMessage[] = [
  {
    id: createMessageId(),
    role: "assistant",
    text: "Hi. I can help you understand SaaSGlobal Hub, its products, and which solution fits your needs.",
  },
];

function AnimatedAssistantText({
  text,
  animate,
  onDone,
}: {
  text: string;
  animate?: boolean;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) {
      setDisplayed(text);
      return;
    }

    setDisplayed("");
    let index = 0;
    const step = 2;
    const interval = window.setInterval(() => {
      index = Math.min(text.length, index + step);
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(interval);
        onDone?.();
      }
    }, 12);

    return () => window.clearInterval(interval);
  }, [text, animate, onDone]);

  return <p className="whitespace-pre-wrap">{displayed}</p>;
}

function ProductCardsScroller({
  cards,
  compact,
  showNaira,
}: {
  cards: Card[];
  compact: boolean;
  showNaira: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = compact ? 280 : 340;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-600">Matching products</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-1 scroll-smooth [scrollbar-color:#9ca3af_#e5e7eb] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200"
      >
        {cards.map((card) => (
          <div
            key={card.slug}
            className={`snap-start flex min-h-[270px] shrink-0 flex-col rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
              compact ? "w-[260px]" : "w-[320px]"
            }`}
          >
            <div className="mb-3 h-24 overflow-hidden rounded-lg bg-gradient-to-br from-black via-zinc-900 to-yellow-400">
              {card.image_url ? (
                <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" />
              ) : null}
            </div>

            <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold">{card.title}</h3>
            <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-gray-600">{card.tagline}</p>
            <p className="mt-2 line-clamp-2 min-h-[3.2rem] text-sm text-gray-700">{card.short_description}</p>

            {card.delivery_type ? (
              <p className="mt-2 text-xs capitalize text-gray-500">Delivery: {card.delivery_type}</p>
            ) : null}

            <div className="mt-auto pt-3">
              <div className="text-sm font-medium">
                ${card.price_usd.toLocaleString()}
                {showNaira ? ` · ₦${card.price_ngn.toLocaleString()}` : ""}
              </div>

              <Link
                href={`/products/${card.slug}`}
                className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:scale-105 hover:bg-neutral-800"
              >
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeStoredMessages(
  messages: Array<{
    id?: string;
    role: "user" | "assistant";
    text: string;
    cards?: Card[];
    readMoreSlug?: string;
    readMoreLabel?: string;
  }>
): ChatMessage[] {
  if (!Array.isArray(messages) || !messages.length) return defaultMessages;

  return messages.map((message) => ({
    id: message.id || createMessageId(),
    role: message.role,
    text: message.text,
    cards: message.cards || [],
    readMoreSlug: message.readMoreSlug || "",
    readMoreLabel: message.readMoreLabel || "",
    typing: false,
    animate: false,
  }));
}

export default function AIChatInterface({ compact = false }: { compact?: boolean }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [lastProductSlug, setLastProductSlug] = useState("");
  const [lastProductName, setLastProductName] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [showNaira, setShowNaira] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadViewerLocation = async () => {
      try {
        const res = await fetch("/api/viewer-location", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ViewerLocation;
        setShowNaira(Boolean(data?.is_nigeria));
      } catch {
        setShowNaira(false);
      }
    };

    loadViewerLocation();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredChatState | ChatMessage[];

        if (Array.isArray(parsed)) {
          const normalized = normalizeStoredMessages(parsed);
          setMessages(normalized);

          const inferredLast = [...normalized]
            .reverse()
            .find((item) => item.role === "assistant" && item.readMoreSlug);

          if (inferredLast?.readMoreSlug) {
            setLastProductSlug(inferredLast.readMoreSlug);
            setLastProductName(
              (inferredLast.readMoreLabel || "").replace(/^Read full details about\s+/i, "")
            );
          }
        } else if (parsed && Array.isArray(parsed.messages)) {
          const normalized = normalizeStoredMessages(parsed.messages);
          setMessages(normalized);
          setLastProductSlug(parsed.lastProductSlug || "");
          setLastProductName(parsed.lastProductName || "");
        }
      }
    } catch {
      //
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const safeMessages = messages
      .filter((message) => !message.typing)
      .map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        cards: message.cards || [],
        readMoreSlug: message.readMoreSlug || "",
        readMoreLabel: message.readMoreLabel || "",
      }));

    const payload: StoredChatState = {
      messages: safeMessages,
      lastProductSlug,
      lastProductName,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [messages, lastProductSlug, lastProductName, hydrated]);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  const canClear = useMemo(() => messages.length > 1, [messages]);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userText = question.trim();
    setQuestion("");

    const userMessageId = createMessageId();
    const typingMessageId = createMessageId();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", text: userText },
      { id: typingMessageId, role: "assistant", text: "", typing: true },
    ]);
    setLoading(true);

    const response = await apiPost<AskResponse>("/ai/ask/", {
      question: userText,
      last_product_slug: lastProductSlug,
    });

    if (response?.primary_product_slug) {
      setLastProductSlug(response.primary_product_slug);
      setLastProductName(response.primary_product_name || "");
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === typingMessageId
          ? {
              id: typingMessageId,
              role: "assistant",
              text: response?.answer || "Sorry, I could not process that. Please try again.",
              cards: response?.cards || [],
              animate: true,
              readMoreSlug:
                response?.mode === "product_detail" && response?.primary_product_slug
                  ? response.primary_product_slug
                  : "",
              readMoreLabel:
                response?.mode === "product_detail" && response?.primary_product_name
                  ? `Read full details about ${response.primary_product_name}`
                  : response?.mode === "product_detail"
                    ? "Read full details"
                    : "",
            }
          : message
      )
    );

    setLoading(false);
  };

  const clearConversation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        id: createMessageId(),
        role: "assistant",
        text: "Hi. I can help you understand SaaSGlobal Hub, its products, and which solution fits your needs.",
      },
    ]);
    setLastProductSlug("");
    setLastProductName("");
  };

  const markAnimationDone = (messageId: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? {
              ...message,
              animate: false,
            }
          : message
      )
    );
  };

  return (
    <div className={`rounded-2xl border bg-gray-50 shadow-xl ${compact ? "p-3 sm:p-4" : "p-4 md:p-6"}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">AI Agent</p>
          <p className="text-xs text-gray-600">Online 24/7</p>
          {lastProductName ? (
            <p className="mt-1 text-[11px] text-gray-500">
              Remembering last product: <span className="font-medium text-gray-700">{lastProductName}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {compact ? (
            <Link
              href="/ai-chat"
              className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-white"
            >
              Open Full Chat
            </Link>
          ) : null}

          {canClear ? (
            <button
              type="button"
              onClick={clearConversation}
              className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-white"
            >
              Clear Chat
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={feedRef}
        className={`space-y-4 overflow-y-auto pr-1 ${compact ? "max-h-[55vh]" : "max-h-[60vh]"}`}
      >
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[92%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                m.role === "user" ? "bg-black text-white" : "border bg-white"
              }`}
            >
              {m.typing ? (
                <span className="inline-flex items-center gap-1" aria-label="AI is typing">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gray-500" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gray-500 [animation-delay:180ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gray-500 [animation-delay:360ms]" />
                </span>
              ) : (
                <div className="space-y-2">
                  {m.role === "assistant" ? (
                    <AnimatedAssistantText
                      text={m.text}
                      animate={m.animate}
                      onDone={() => markAnimationDone(m.id)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  )}

                  {m.readMoreSlug ? (
                    <Link
                      href={`/products/${m.readMoreSlug}`}
                      className="inline-block text-xs font-medium text-black underline underline-offset-4"
                    >
                      {m.readMoreLabel || "Read full details"}
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            {!!m.cards?.length && !m.typing && !m.animate && (
              <ProductCardsScroller cards={m.cards} compact={compact} showNaira={showNaira} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={ask} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about products, features, pricing, or company details..."
          className="flex-1 rounded-xl border bg-white px-4 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          <span>{loading ? "Thinking" : "Send"}</span>
        </button>
      </form>
    </div>
  );
}