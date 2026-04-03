"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

type FaqItem = { q: string; a: string };

const items: FaqItem[] = [
  {
    q: "What is OwnMindAI and how does WhatsApp + Web autosync work?",
    a: "OwnMindAI connects WhatsApp and your website to one AI brain. Leads, chats, and forms sync in real time. It answers FAQs, qualifies buyers, books demos, and escalates to your team when needed,logging activity to your dashboard."
  },
  {
    q: "What problems does your Logistics SaaS solve?",
    a: "Dispatch, route optimization, live tracking, proof of delivery, SLA alerts, and reverse logistics. It cuts failed deliveries and improves on-time rates across hubs and zones."
  },
  {
    q: "How does your Multi-supplier Ecommerce platform handle vendors and payouts?",
    a: "Vendor onboarding, tiered commissions, split payouts, vendor wallets, scheduled settlements, and reconciliation. Catalog/inventory sync with courier integrations is included."
  },
  {
    q: "Do you build custom SaaS beyond the listed solutions?",
    a: "Yes. Full discovery, UX, engineering, AI features, payments, and DevOps for startups and enterprises. We also integrate ERPs/CRMs, gateways, and carriers."
  },
  {
    q: "How fast can we launch an MVP with SaaSGlobal Hub?",
    a: "Most MVPs ship in weeks depending on scope and integrations. Modular architecture and reusable components help us move fast without sacrificing quality or security."
  },
  {
    q: "How do you handle security and compliance?",
    a: "Least-privilege access, encryption in transit, role-based controls, secret management, audit logs, and configurable data retention. We align with common compliance needs and adapt to your policies."
  },
  {
    q: "What support do we get after go-live?",
    a: "Onboarding, training, documentation, SLAs, and proactive monitoring. Dedicated squads are available for enterprise accounts."
  }
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-gray-700"
          >
            <HelpCircle className="h-4 w-4 text-brand-yellow" />
            Frequently Asked Questions
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-3xl md:text-4xl font-bold"
          >
            Everything about <span className="text-brand-yellow">SaaSGlobal Hub</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-3 text-gray-600"
          >
            Clear answers to the most common questions on AI SaaS, Logistics, and Multi-supplier.
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card hover:shadow-hover transition-shadow"
            >
              <button
                type="button"
                aria-expanded={open === idx}
                aria-controls={`faq-panel-${idx}`}
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-base md:text-lg font-semibold">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-300 ${
                    open === idx ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open === idx && (
                  <motion.div
                    id={`faq-panel-${idx}`}
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 text-gray-700 leading-relaxed">
                      {item.a}
                    </p>
                    <div className="mt-4">
                      <a
                        href="/contact"
                        className="inline-block text-sm font-semibold text-black hover:text-brand-yellow transition-colors"
                      >
                        Talk to the team →
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
