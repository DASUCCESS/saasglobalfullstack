"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUp, X, ChevronRight, Bot, Maximize2, MessageCircle } from "lucide-react";
import { API_BASE } from "@/lib/api";
import AIChatInterface from "@/components/ai/AIChatInterface";

type Step = 1 | 2;

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [aiLabel, setAiLabel] = useState("Ask AI Agent");
  const [aiUrl, setAiUrl] = useState("/ai-chat");

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [requestType] = useState("General Request");
  const [details, setDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency] = useState("Normal");

  useEffect(() => {
    fetch(`${API_BASE}/settings/public/`)
      .then((r) => r.json())
      .then((data) => {
        setAiLabel(data?.site?.ai_agent_label || "Ask AI Agent");
        setAiUrl(data?.site?.ai_agent_url || "/ai-chat");
      })
      .catch(() => undefined);

    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const canProceedStep1 = useMemo(() => fullName.trim().length > 1 && details.trim().length > 10, [fullName, details]);

  const payload = useMemo(
    () => ({ full_name: fullName, company, email, request_type: requestType, details, budget, urgency, channel }),
    [fullName, company, email, requestType, details, budget, urgency, channel]
  );

  const submitRequest = async () => {
    const response = await fetch(`${API_BASE}/requests/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (channel === "whatsapp" && data.whatsapp_url) {
      window.open(data.whatsapp_url, "_blank");
    } else {
      alert("Your email request was submitted.");
    }
    setOpen(false);
    setStep(1);
  };

  return (
    <>
      <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setChatOpen((prev) => !prev)}
          className="group inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-3 bg-black text-white font-medium shadow-xl hover:shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>{aiLabel}</span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button onClick={() => setOpen(true)} className="group inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-3 bg-brand-yellow text-black font-medium shadow-xl hover:shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer">
          <span>Make Requests</span>
          <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
        </button>

        {showTop && (
          <button onClick={goTop} aria-label="Go to Top" className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-white text-black shadow-xl hover:shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer">
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {chatOpen && (
        <div className="fixed z-[60] right-3 sm:right-6 bottom-24 sm:bottom-28 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px]">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-black text-white px-4 py-3">
              <div className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <p className="text-sm font-medium">AI Chat Assistant</p>
              </div>
              <div className="inline-flex items-center gap-1">
                <Link href={aiUrl} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-white/10">
                  <Maximize2 className="h-3.5 w-3.5" />
                  Open full
                </Link>
                <button onClick={() => setChatOpen(false)} className="rounded-full p-1 hover:bg-white/15" aria-label="Close AI chat pop-up">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <AIChatInterface compact />
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between mb-5 shrink-0">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{step === 1 ? "Tell us what you need" : "Few more details"}</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer" aria-label="Close"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {step === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} placeholder="Describe your request" className="w-full rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={channel} onChange={(e) => setChannel(e.target.value as "whatsapp" | "email")} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                  <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget" className="w-full rounded-lg border border-gray-300 px-3 py-2" />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {step === 2 && <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border">Back</button>}
              {step === 1 ? (
                <button disabled={!canProceedStep1} onClick={() => setStep(2)} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-40">Continue</button>
              ) : (
                <button onClick={submitRequest} className="px-4 py-2 rounded-lg bg-brand-yellow text-black">Submit</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
