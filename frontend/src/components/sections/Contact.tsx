"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare, ArrowUpRight } from "lucide-react";

export default function Contact() {
  const ADDRESS = "828 Lane Allen Rd, Ste 219, Lexington, Kentucky 40504, US";
  const EMAIL = "support@saasglobalhub.com";
  const PHONE = "+1 716 342 0826";

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold">
            Get in <span className="text-brand-yellow">Touch</span>
          </h1>
          <p className="mt-3 text-gray-600">
            Reach us by email, phone, or WhatsApp.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.a
            href={`https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="group bg-gray-50 p-6 rounded-xl shadow-card hover:shadow-hover hover:scale-105 transition cursor-pointer flex flex-col justify-between min-h-36"
            aria-label="Open address in Google Maps"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-brand-yellow mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <p className="text-gray-700 mt-1">{ADDRESS}</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-gray-800 group-hover:underline">
              View on Maps <ArrowUpRight className="w-4 h-4" />
            </span>
          </motion.a>

          <motion.a
            href={`mailto:${EMAIL}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            viewport={{ once: true }}
            className="group bg-gray-50 p-6 rounded-xl shadow-card hover:shadow-hover hover:scale-105 transition cursor-pointer flex flex-col justify-between min-h-36"
            aria-label="Send email"
          >
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-brand-yellow mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-700 mt-1">{EMAIL}</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-gray-800 group-hover:underline">
              Write to us <ArrowUpRight className="w-4 h-4" />
            </span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-6 rounded-xl shadow-card hover:shadow-hover hover:scale-105 transition cursor-pointer flex flex-col justify-between min-h-36"
          >
            <div className="flex items-start gap-3">
              <Phone className="w-6 h-6 text-brand-yellow mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <a href={`tel:${PHONE}`} className="text-gray-700 mt-1 block hover:underline">
                  {PHONE}
                </a>
              </div>
            </div>

            <a
              href="https://wa.me/17163420826"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-brand-yellow text-black px-4 py-2 rounded-lg font-semibold shadow-card hover:shadow-hover hover:scale-105 transition w-fit cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
