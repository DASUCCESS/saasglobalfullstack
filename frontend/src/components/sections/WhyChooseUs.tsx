"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Cpu, TrendingUp, Headset } from "lucide-react";

const features = [
  {
    title: "Scalable",
    description: "Built to grow with your business, from startup to enterprise.",
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    gradient: "from-brand-yellow to-orange-500",
  },
  {
    title: "AI-Powered",
    description: "Harness cutting-edge AI to automate and optimize workflows.",
    icon: <Cpu className="w-8 h-8 text-white" />,
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    title: "Secure",
    description: "Enterprise-grade security and compliance to protect your data.",
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    title: "24/7 Support",
    description: "Our dedicated team is always available when you need help.",
    icon: <Headset className="w-8 h-8 text-white" />,
    gradient: "from-pink-500 to-red-500",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why" className="relative py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Why <span className="text-brand-yellow">Choose Us</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We blend innovation, AI, and enterprise-grade security to deliver SaaS solutions that scale globally and keep you ahead.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                         hover:scale-105 transition-transform duration-500 border border-gray-100 hover:border-brand-yellow"
            >
              {/* Icon with gradient circle */}
              <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-md inline-flex`}>
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-semibold group-hover:text-brand-yellow transition">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom Glow Line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brand-yellow transition-all duration-500 group-hover:w-full rounded-b-xl"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
