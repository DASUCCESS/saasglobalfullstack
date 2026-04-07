"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { apiGetResult } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { ADMIN_LOGIN_PATH } from "@/lib/admin";

const links = [
  ["Overview", "/admin/overview"],
  ["Orders", "/admin/orders"],
  ["Products", "/admin/products"],
  ["AI Agent", "/admin/ai-agent"],
  ["Payments", "/admin/payments"],
  ["Cloudinary", "/admin/cloudinary"],
  ["SMTP", "/admin/smtp"],
  ["Settings", "/admin/settings"],
  ["WhatsApp", "/admin/whatsapp"],
  ["Notifications", "/admin/notifications"],
] as const;

export default function AdminShell({ title, children }: { title: string; children?: ReactNode }) {
  const [ok, setOk] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = ADMIN_LOGIN_PATH;
      return;
    }

    apiGetResult<{ is_staff: boolean; name: string }>("/auth/me/", token).then((res) => {
      if (!res.ok || !res.data?.is_staff) {
        clearToken();
        window.location.href = ADMIN_LOGIN_PATH;
        return;
      }
      setOk(true);
    });

    apiGetResult<{ unread: number }>("/admin/notifications/count/", token).then((res) => {
      if (res.ok && res.data) {
        setUnread(res.data.unread || 0);
      }
    });
  }, []);

  if (!ok) {
    return <main className="grid min-h-screen place-items-center bg-neutral-950 text-white">Checking admin access...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex">
        <aside className="hidden w-72 border-r border-neutral-800 bg-neutral-900 p-4 md:block">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <nav className="mt-6 space-y-2 text-sm text-neutral-300">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-800 cursor-pointer">
                <span>{label}</span>
                {href === "/admin/notifications" && unread > 0 ? (
                  <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold text-black">{unread}</span>
                ) : null}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={() => {
                clearToken();
                window.location.href = ADMIN_LOGIN_PATH;
              }}
              className="w-fit rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800 cursor-pointer"
            >
              Logout
            </button>
          </div>
          {children ? <div className="mt-6">{children}</div> : null}
        </section>
      </main>
  );
}
