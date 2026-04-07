import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import SupportPhoneLink from "@/components/site/SupportPhoneLink";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 pt-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <Image
                src="/saasglobalhublogo.png"
                alt="SaaSGlobal Hub"
                width={112}
                height={56}
                className="h-14 w-auto"
                priority
                sizes="112px"
              />
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Driving innovation in AI, logistics, and SaaS platforms worldwide.
          </p>
        </div>

        {/* Quick Links + Products grouped for mobile */}
        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-2">
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand-yellow transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-yellow transition">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-yellow transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-3">Our Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-brand-yellow transition">
                  AI SAAS (WhatsApp + Web AI)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-yellow transition">
                  Logistics SaaS
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-yellow transition">
                  Multi-supplier Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
              <span>828 Lane Allen Rd, Ste 219, Lexington, KY 40504, US</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-yellow shrink-0" />
              support@saasglobalhub.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-yellow shrink-0" />
              <SupportPhoneLink />
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t border-gray-700 py-5 text-center text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} SaaSGlobal Hub. All rights reserved. |{" "}
          <Link href="/privacy" className="hover:text-brand-yellow">
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link href="/terms" className="hover:text-brand-yellow">
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  );
}
