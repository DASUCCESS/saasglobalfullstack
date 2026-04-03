"use client";

import Image from "next/image";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { MessageCircle, Package } from "lucide-react";

// Easing constants
const EASE_OUT: readonly [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT: readonly [number, number, number, number] = [0.42, 0, 0.58, 1];

// minimal variants
const fadeUp = (delay = 0): MotionProps => ({
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  },
});

function BgFX() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      <div className="absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full blur-3xl bg-gradient-to-tr from-brand-yellow/30 via-amber-200/20 to-transparent" />
      <div className="absolute -bottom-48 -right-24 h-[560px] w-[560px] rounded-full blur-3xl bg-gradient-to-tl from-blue-500/10 via-sky-300/10 to-transparent" />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(0,0,0,0.045)_1px,transparent_1.4px)] [background-size:22px_22px] opacity-40" />

      {!prefersReducedMotion && (
        <>
          <motion.div
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{
              y: [0, -10, 0, 12, 0],
              x: [0, 10, 0, -8, 0],
              opacity: [0, 0.25, 0.25, 0.25, 0.25],
            }}
            transition={{ repeat: Infinity, duration: 12, ease: EASE_IN_OUT }}
            className="absolute left-[12%] top-[18%] h-32 w-32 rounded-2xl bg-white/50 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          />
          <motion.div
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{
              y: [0, 12, 0, -10, 0],
              x: [0, -8, 0, 8, 0],
              opacity: [0, 0.25, 0.25, 0.25, 0.25],
            }}
            transition={{ repeat: Infinity, duration: 10, ease: EASE_IN_OUT, delay: 0.6 }}
            className="absolute right-[14%] bottom-[20%] h-28 w-28 rounded-full bg-white/40 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          />
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="group rounded-xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-md p-4 text-center h-full flex flex-col items-center justify-center hover:shadow-[0_18px_50px_rgba(0,0,0,0.14)] hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
      <div className="mt-3 h-px w-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <BgFX />

      <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-28">
        {/* On mobile: image first, then copy */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12">
          {/* Left (copy) */}
          <motion.div {...fadeUp(0)} className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white shadow-sm px-3 py-1 text-xs font-medium text-gray-700">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              AI • Logistics • Multi-supplier
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
              Ship faster with{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-yellow">production-ready SaaS</span>
                <span aria-hidden className="absolute -inset-1 -z-0 rounded-lg bg-brand-yellow/25 blur-lg" />
              </span>
              <br className="hidden md:block" />
              Built to scale.
            </h1>

            <p className="mt-4 text-base md:text-lg text-gray-600 max-w-xl">
              Premium products for growth: AI SAAS (WhatsApp + Web AI), Logistics SaaS, and a robust multi-supplier
              platform fast, secure, and reliable.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="https://wa.me/17163420826"
                className="inline-flex items-center gap-2 bg-brand-yellow text-black px-6 py-3 rounded-lg font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.16)] hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-yellow"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="#products"
                className="inline-flex items-center gap-2 border border-black px-6 py-3 rounded-lg font-semibold hover:bg-black hover:text-white transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
              >
                <Package className="h-5 w-5" aria-hidden />
                <span>Explore Products</span>
              </a>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-4 max-w-lg">
              <Stat value="99.9%" label="Uptime" />
              <Stat value="50k+" label="Daily Requests" />
              <Stat value="24/7" label="Support" />
            </div>
          </motion.div>

          {/* Right (bigger, responsive, bouncing image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE_OUT, delay: 0.05 },
            }}
            className="flex-1 w-full flex justify-center md:justify-end"
          >
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 rounded-3xl blur-2xl bg-gradient-to-tr from-brand-yellow/35 via-white/0 to-blue-500/25" />

              {/* Bouncing, larger, mobile-first responsive image */}
              {prefersReducedMotion ? (
                <Image
                  src="/saasglobalhero.png"
                  alt="Screenshot and illustration of modern SaaS solutions"
                  width={1200}
                  height={900}
                  className="relative z-10 w-[92vw] max-w-[30rem] md:max-w-[34rem] lg:max-w-[38rem] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                  priority
                  sizes="(max-width: 768px) 92vw, (max-width: 1024px) 34rem, 38rem"
                />
              ) : (
                <motion.div
                  initial={{ y: 0, scale: 1 }}
                  animate={{ y: [0, -14, 0, 10, 0], scale: [1, 1.02, 1, 1.015, 1] }}
                  transition={{ repeat: Infinity, duration: 6.5, ease: EASE_IN_OUT }}
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10"
                >
                  <Image
                    src="/saasglobalhero.png"
                    alt="Screenshot and illustration of modern SaaS solutions"
                    width={1200}
                    height={900}
                    className="w-[92vw] max-w-[30rem] md:max-w-[34rem] lg:max-w-[38rem] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                    priority
                    sizes="(max-width: 768px) 92vw, (max-width: 1024px) 34rem, 38rem"
                  />
                </motion.div>
              )}

              {!prefersReducedMotion && (
                <motion.div
                  aria-hidden
                  initial={{ y: 0, opacity: 0.9 }}
                  animate={{ y: [0, -10, 0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 9, ease: EASE_IN_OUT }}
                  className="absolute -bottom-6 -right-6 h-16 w-16 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
