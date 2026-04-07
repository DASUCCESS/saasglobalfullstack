"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  X,
  ChevronRight,
  Bot,
  Maximize2,
  MessageCircle,
  Sparkles,
  Mail,
  MessageSquare,
  Briefcase,
  User,
  Building2,
  Wallet,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import { toast } from "@/lib/toast";
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
  const [submitting, setSubmitting] = useState(false);

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

  const canProceedStep1 = useMemo(() => {
    return fullName.trim().length > 1 && details.trim().length > 10;
  }, [fullName, details]);

  const payload = useMemo(
    () => ({
      full_name: fullName,
      company,
      email,
      request_type: requestType,
      details,
      budget,
      urgency,
      channel,
    }),
    [fullName, company, email, requestType, details, budget, urgency, channel]
  );

  const submitRequest = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/requests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to submit request.");
      }

      if (channel === "whatsapp" && data?.whatsapp_url) {
        toast.success("Your request was prepared successfully.", "Request sent");
        window.open(data.whatsapp_url, "_blank");
      } else {
        if (!data?.email_sent) {
          throw new Error(data?.email_error || "Your request was saved, but email delivery failed.");
        }
        toast.success("Your email request was submitted successfully.", "Request sent");
      }

      setOpen(false);
      setStep(1);
      setFullName("");
      setCompany("");
      setEmail("");
      setDetails("");
      setBudget("");
      setChannel("whatsapp");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message, "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200 placeholder:text-gray-400 focus:border-black focus:ring-4 focus:ring-black/5";

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        <button
          type="button"
          onClick={() => setChatOpen((prev) => !prev)}
          className="group inline-flex min-h-[52px] items-center gap-3 rounded-full border border-black bg-black px-4 py-3 text-sm font-semibold text-white shadow-2xl transition duration-200 hover:scale-105 hover:shadow-black/25 cursor-pointer sm:px-5"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-black shadow-md">
            <Bot className="h-4 w-4" />
          </span>
          <span className="max-w-[130px] truncate sm:max-w-none">{aiLabel}</span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setOpen(true)}
          className="group inline-flex min-h-[52px] items-center gap-3 rounded-full border border-brand-yellow bg-brand-yellow px-4 py-3 text-sm font-semibold text-black shadow-2xl transition duration-200 hover:scale-105 hover:shadow-yellow-500/20 cursor-pointer sm:px-5"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>Make Request</span>
          <ChevronRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" />
        </button>

        {showTop && (
          <button
            onClick={goTop}
            aria-label="Go to top"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-xl transition duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>

      {chatOpen && (
        <div className="fixed right-3 bottom-24 z-[60] w-[calc(100vw-1.5rem)] max-w-[430px] sm:right-6 sm:bottom-28 sm:w-[430px]">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
            <div className="border-b border-white/10 bg-black px-4 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-yellow text-black shadow-lg">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Agent</p>
                    <p className="text-xs text-white/70">
                      Get instant help and quick answers
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1">
                  <Link
                    href={aiUrl}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Open full
                  </Link>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="rounded-full p-2 transition hover:bg-white/10 cursor-pointer"
                    aria-label="Close AI chat pop-up"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-gray-50 to-white p-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <AIChatInterface compact />
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-6 sm:px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            <div className="border-b border-gray-100 bg-black px-5 py-5 text-white sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow text-black shadow-lg">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold sm:text-xl">
                        {step === 1 ? "Tell us what you need" : "Choose contact method"}
                      </h3>
                      <p className="text-sm text-white/70">
                        {step === 1
                          ? "Enter your details and describe your request clearly."
                          : "Review your request and select how you want us to continue."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-sm font-semibold text-black">
                        {step === 2 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                      </div>
                      <span className="text-sm font-medium text-white">
                        Request Info
                      </span>
                    </div>

                    <div className="h-px w-10 bg-white/20" />

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          step === 2
                            ? "bg-brand-yellow text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        2
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          step === 2 ? "text-white" : "text-white/70"
                        }`}
                      >
                        Contact Method
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 px-5 py-5 sm:px-6 sm:py-6">
              {step === 1 ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="h-4 w-4" />
                        Full Name
                      </label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className={inputBaseClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4" />
                        Company
                      </label>
                      <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Your company or brand"
                        className={inputBaseClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={inputBaseClass}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4" />
                        Request Details
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows={6}
                        placeholder="Describe your request clearly so we can understand what you need."
                        className={`${inputBaseClass} resize-none`}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Add enough detail so your request can be handled faster and more accurately.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-gray-900">
                        Select your preferred channel
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose where you want the request to continue after submission.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setChannel("whatsapp")}
                        className={`rounded-2xl border p-4 text-left transition duration-200 cursor-pointer ${
                          channel === "whatsapp"
                            ? "border-black bg-black text-white shadow-lg scale-[1.02]"
                            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-yellow text-black">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="mb-1 text-sm font-semibold">WhatsApp</div>
                        <p
                          className={`text-xs leading-5 ${
                            channel === "whatsapp" ? "text-white/75" : "text-gray-500"
                          }`}
                        >
                          Open a ready-made WhatsApp message and continue the conversation there.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChannel("email")}
                        className={`rounded-2xl border p-4 text-left transition duration-200 cursor-pointer ${
                          channel === "email"
                            ? "border-brand-yellow bg-brand-yellow text-black shadow-lg scale-[1.02]"
                            : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="mb-1 text-sm font-semibold">Email</div>
                        <p
                          className={`text-xs leading-5 ${
                            channel === "email" ? "text-black/70" : "text-gray-500"
                          }`}
                        >
                          Submit the request directly by email for a more formal follow-up.
                        </p>
                      </button>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Wallet className="h-4 w-4" />
                        Budget
                      </label>
                      <input
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Optional budget range"
                        className={inputBaseClass}
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-brand-yellow/30 bg-brand-yellow/10 p-5 shadow-sm">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-gray-900">
                        Request Summary
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Review the information before you submit.
                      </p>
                    </div>

                    <div className="space-y-4 text-sm text-gray-700">
                      <div className="rounded-2xl bg-white/70 p-4">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Full Name
                        </div>
                        <div className="font-medium text-gray-900">
                          {fullName || "Not provided"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/70 p-4">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Company
                        </div>
                        <div className="font-medium text-gray-900">
                          {company || "Not provided"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/70 p-4">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Email
                        </div>
                        <div className="font-medium text-gray-900">
                          {email || "Not provided"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/70 p-4">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Preferred Channel
                        </div>
                        <div className="font-medium text-gray-900">
                          {channel === "whatsapp" ? "WhatsApp" : "Email"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/70 p-4">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Budget
                        </div>
                        <div className="font-medium text-gray-900">
                          {budget || "Not provided"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/70 p-4">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Request Details
                        </div>
                        <div className="line-clamp-5 whitespace-pre-line font-medium text-gray-900">
                          {details || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div className="text-xs text-gray-500">
                {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
              </div>

              <div className="flex items-center gap-2">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition duration-200 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {step === 1 ? (
                  <button
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={submitRequest}
                    disabled={submitting}
                    className="rounded-xl bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
