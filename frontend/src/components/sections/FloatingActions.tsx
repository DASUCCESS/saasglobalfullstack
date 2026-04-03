"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUp, MessageSquareText, X, ChevronRight } from "lucide-react";

type Step = 1 | 2;

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState("General Request");
  const [details, setDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState("Normal");

  const whatsappNumber = "17163420826";

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const canProceedStep1 = useMemo(() => {
    return fullName.trim().length > 1 && details.trim().length > 10;
  }, [fullName, details]);

  const message = useMemo(() => {
    const lines = [
      `Hello SaaSGlobal Hub, I'd like to make a request / give feedback.`,
      ``,
      `Name: ${fullName || "-"}`,
      `Company: ${company || "-"}`,
      `Email: ${email || "-"}`,
      `Request Type: ${requestType || "-"}`,
      `Urgency: ${urgency || "-"}`,
      `Estimated Budget: ${budget || "-"}`,
      ``,
      `Details:`,
      `${details || "-"}`,
      ``,
      `Sent from website: https://www.saasglobalhub.com`,
    ];
    return lines.join("\n");
  }, [fullName, company, email, requestType, urgency, budget, details]);

  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setOpen(false);
    setStep(1);
  };

  return (
    <>
      {/* Floating Buttons */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
        {/* Make Requests */}
        <button
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-2 rounded-full px-5 py-3 bg-brand-yellow text-black font-medium shadow-xl hover:shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer animate-[pulse_2.4s_ease-in-out_infinite]"
          aria-label="Make a Request"
        >
          {/* <MessageSquareText className="w-5 h-5" /> */}
          <span>Make Requests</span>
          <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Go to Top */}
        {showTop && (
          <button
            onClick={goTop}
            aria-label="Go to Top"
            className="inline-flex items-center justify-center rounded-full w-12 h-12 bg-white text-black shadow-xl hover:shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-[92%] max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-[fadeIn_0.25s_ease-out] max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                {step === 1 ? "Tell us what you need" : "Few more details"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., John Doe"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Company (Optional)</label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., SAAS Global Hub"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Request Type</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white"
                    >
                      <option>General Request</option>
                      <option>AI SaaS</option>
                      <option>Logistics SaaS</option>
                      <option>Multi-supplier Ecommerce</option>
                      <option>Custom Development</option>
                      <option>Support / Feedback</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">What do you need?</label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Describe your request or feedback…"
                      rows={5}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 resize-y"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Urgency</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white"
                    >
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Estimated Budget (Optional)</label>
                    <input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., $2,000 - $5,000"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 text-sm">
                      <div className="font-semibold mb-1">( Preview Mode )</div>
                      <pre className="whitespace-pre-wrap text-gray-700 max-h-56 overflow-auto">
{message}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex items-center justify-between gap-3 mt-4 shrink-0">
              {step === 1 ? (
                <>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className={`px-5 py-2 rounded-lg text-black font-medium transition cursor-pointer hover:scale-105 ${
                      canProceedStep1
                        ? "bg-brand-yellow shadow-lg hover:shadow-xl"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={openWhatsApp}
                    className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer"
                  >
                    Send via WhatsApp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyframes (local) */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
          50% { transform: scale(1.04); box-shadow: 0 16px 28px rgba(0,0,0,0.18); }
          100% { transform: scale(1); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
