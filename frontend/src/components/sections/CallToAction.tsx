"use client";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="relative py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold"
        >
          Ready to <span className="text-brand-yellow">Scale Your Business</span> 
          with SaaSGlobal Hub?
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-4 text-gray-300 max-w-2xl mx-auto"
        >
          Let’s build the future of your business with AI, logistics, and SaaS innovation. 
          Contact us today to get started.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="https://wa.me/17163420826"
            className="flex items-center justify-center gap-2 bg-brand-yellow text-black px-6 py-3 rounded-lg font-semibold shadow-card hover:shadow-hover hover:scale-105 transition-transform duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            Chat on WhatsApp
          </a>
          <a
            href="#products"
            className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-300"
          >
            Explore Products
          </a>
        </motion.div>
      </div>
    </section>
  );
}
