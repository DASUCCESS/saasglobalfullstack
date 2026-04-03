"use client";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="relative py-24 bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_center,rgba(255,255,0,0.3)_1px,transparent_1.4px)] [background-size:22px_22px]" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            About <span className="text-brand-yellow">Us</span>
          </h2>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            SaaSGlobal Hub builds modern SaaS products that empower businesses
            to scale faster. From AI automation to logistics and multi-supplier
            platforms, we deliver technology engineered for growth, speed, and trust.
          </p>
        </motion.div>

        {/* Core Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="rounded-xl bg-gradient-to-br from-brand-yellow to-yellow-400 text-black shadow-lg p-8 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold">Our Mission</h3>
            <p className="mt-3 text-sm">
              Empower companies with world-class SaaS tools that accelerate growth
              and efficiency across industries.
            </p>
          </div>

          <div className="rounded-xl bg-black border border-yellow-400 shadow-lg p-8 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-brand-yellow">Our Values</h3>
            <p className="mt-3 text-sm text-gray-300">
              Innovation, reliability, and trust form the foundation of
              everything we create and deliver.
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-brand-yellow to-yellow-500 text-black shadow-lg p-8 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold">Our Vision</h3>
            <p className="mt-3 text-sm">
              To set the global standard for SaaS innovation and deliver scalable
              solutions that shape the future.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
