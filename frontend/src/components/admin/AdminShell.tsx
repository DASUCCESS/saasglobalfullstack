"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";

const links = [
  ["Overview", "/admin/overview"],
  ["Orders", "/admin/orders"],
  ["Products", "/admin/products"],
  ["Settings", "/admin/settings"],
  ["AI Agent", "/admin/ai-agent"],
  ["SEO", "/admin/seo"],
  ["Payments", "/admin/payments"],
  ["Cloudinary", "/admin/cloudinary"],
  ["SMTP", "/admin/smtp"],
  ["WhatsApp", "/admin/whatsapp"],
] as const;

export default function AdminShell({ title, children }: { title: string; children?: ReactNode }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    apiGet<{ is_admin: boolean }>("/auth/me/", token).then((res) => {
      if (!res?.is_admin) {
        clearToken();
        window.location.href = "/admin/login";
        return;
      }
      setOk(true);
    });
  }, []);

  if (!ok) return <main className="min-h-screen grid place-items-center">Checking admin access...</main>;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="w-72 bg-neutral-900 border-r border-neutral-800 p-4 hidden md:block">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <nav className="mt-6 space-y-2 text-sm text-neutral-300">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="block px-3 py-2 rounded-lg hover:bg-neutral-800">{label}</Link>
          ))}
        </nav>
      </aside>
      <section className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold">{title}</h2>
        {children && <div className="mt-6">{children}</div>}
      </section>
    </main>
  );
}
