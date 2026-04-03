"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Testimonial = {
  company: string;
  location: string;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    company: "KamsiParts.com",
    location: "AutoParts Industry , AI & Logistics",
    text:
      "KamsiParts works exclusively with SaaSGlobal Hub for logistics, product apps, and end-to-end AI automation. The partnership has cut delivery times and unlocked real operational efficiency.",
  },
  {
    company: "HaHaa",
    location: "Rwanda , Multi-supplier, Logistics, AI",
    text:
      "With SaaSGlobal Hub, we launched a scalable multi-supplier platform powering logistics across Rwanda. Their support and AI expertise set them apart.",
  },
  {
    company: "AiBlogPlatform",
    location: "United States , AI SaaS",
    text:
      "SaaSGlobal Hub helped us build an AI-powered blogging platform in record time , SEO-ready, scalable, and future-proof.",
  },
  {
    company: "OwnMindAI",
    location: "Global , AI & Automation",
    text:
      "Partnering with SaaSGlobal Hub helped us deploy OwnMindAI faster with reliable SaaS infrastructure and world-class support.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const pairCount = Math.ceil(testimonials.length / 2);

  const pairs = useMemo(() => {
    const out: Testimonial[][] = [];
    for (let i = 0; i < testimonials.length; i += 2) {
      out.push([testimonials[i], testimonials[i + 1]].filter(Boolean) as Testimonial[]);
    }
    return out;
  }, []);

  const goTo = (i: number) => setCurrent((i + pairCount) % pairCount);
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  // ✅ Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % pairCount);
    }, 5000); // every 5s
    return () => clearInterval(timer);
  }, [pairCount]);

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            What Our <span className="text-brand-yellow font-bold">Clients Say</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Trusted across AI, logistics, and multi-supplier industries worldwide.
          </p>
        </motion.div>

        {/* Slider */}
        <div className="relative mt-12">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prev}
              className="hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              ‹
            </button>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {pairs[current].map((t, idx) => (
                    <motion.article
                      key={`${t.company}-${idx}`}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.25 }}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer flex flex-col min-h-[240px]"
                    >
                      <div className="p-7 flex-1 flex flex-col">
                        <p className="text-gray-700 leading-relaxed italic">“{t.text}”</p>
                        <div className="mt-6">
                          <h3 className="font-semibold text-lg">{t.company}</h3>
                          <p className="text-sm text-gray-500">{t.location}</p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={next}
              className="hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pairCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === current ? "w-6 bg-brand-yellow" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
