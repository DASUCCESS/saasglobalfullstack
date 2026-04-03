"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        "shadow-[0_4px_15px_rgba(0,0,0,0.08)]",
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]"
          : "bg-white/60 backdrop-blur-md",
      ].join(" ")}
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div className="pointer-events-none h-[3px] w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 opacity-90" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:py-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md p-1 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        >
          <Image
            src="/saasglobalhublogo.png"
            alt="SaaSGlobal Hub"
            width={140}
            height={56}
            className="h-12 w-auto md:h-14"
            priority
            sizes="(max-width: 768px) 120px, 140px"
          />
          <span className="sr-only">SaaSGlobal Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                  "transition-all duration-200 hover:scale-[1.03] hover:text-amber-600 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400",
                  active ? "text-amber-700" : "text-gray-700",
                ].join(" ")}
              >
                {item.label}
                <span
                  className={[
                    "pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-amber-500",
                    "transition-all duration-300 group-hover:w-8",
                    active ? "w-8" : "w-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}

          {/* Primary CTA */}
          <div className="ml-2 flex items-center">
            <Link
              href="https://wa.me/17163420826"
              className={[
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold",
                "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_12px_24px_-10px_rgba(234,179,8,0.6)]",
                "transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400",
              ].join(" ")}
            >
              Talk To Us
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={[
            "md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md",
            "transition-transform duration-200 hover:scale-105 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400",
          ].join(" ")}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={[
          "md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={[
          "md:hidden fixed top-[3px] left-0 right-0 z-50 mx-3 mt-3 rounded-2xl border border-black/5",
          "bg-white/95 backdrop-blur-xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]",
          "origin-top transition-all duration-300",
          menuOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 -translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md p-1 transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <Image
              src="/saasglobalhublogo.png"
              alt="SaaSGlobal Hub"
              width={120}
              height={48}
              className="h-10 w-auto"
              sizes="120px"
              priority
            />
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-transform duration-200 hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-2">
            {NAV_LINKS.map((item, idx) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex h-12 items-center justify-between rounded-xl border",
                    "px-4 text-base font-medium shadow-sm",
                    "transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer",
                    active
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-800",
                  ].join(" ")}
                  style={{ transitionDelay: `${idx * 20}ms` }}
                >
                  {item.label}
                  <span
                    className={[
                      "ml-3 inline-block h-2 w-2 rounded-full",
                      active ? "bg-amber-500" : "bg-gray-300",
                    ].join(" ")}
                  />
                </Link>
              );
            })}

            <Link
              href="/contact"
              className={[
                "mt-2 inline-flex h-12 items-center justify-center rounded-xl",
                "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-semibold",
                "shadow-[0_16px_36px_-12px_rgba(234,179,8,0.6)]",
                "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer",
              ].join(" ")}
            >
              Talk To Us
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <span className="text-sm text-gray-600">Need help?</span>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-800 transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
            >
              Contact Us
            </Link>
          </div>

          <div className="py-3" />
        </div>
      </div>
    </header>
  );
}
