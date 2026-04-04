"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function Page() {
  const [form, setForm] = useState({ smtp_host: "", smtp_port: "587", smtp_username: "", smtp_password: "", smtp_use_tls: true, from_email: "" });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<{ contact?: Record<string, string | boolean | number> }>("/settings/admin/", token).then((res) => {
      setForm({
        smtp_host: String(res?.contact?.smtp_host || ""),
        smtp_port: String(res?.contact?.smtp_port || 587),
        smtp_username: String(res?.contact?.smtp_username || ""),
        smtp_password: String(res?.contact?.smtp_password || ""),
        smtp_use_tls: Boolean(res?.contact?.smtp_use_tls),
        from_email: String(res?.contact?.from_email || ""),
      });
    });
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost("/settings/admin/update/", { contact: { ...form, smtp_port: Number(form.smtp_port || 587) } }, token);
    if (!res) return alert("Save failed");
    alert("SMTP saved");
  };

  return <AdminShell title="SMTP"><div className="max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} placeholder="SMTP host" />
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: e.target.value })} placeholder="SMTP port" />
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.smtp_username} onChange={(e) => setForm({ ...form, smtp_username: e.target.value })} placeholder="SMTP username" />
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.smtp_password} onChange={(e) => setForm({ ...form, smtp_password: e.target.value })} placeholder="SMTP password" />
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} placeholder="From email" />
    <label className="text-sm"><input type="checkbox" checked={form.smtp_use_tls} onChange={(e) => setForm({ ...form, smtp_use_tls: e.target.checked })} /> <span className="ml-2">Use TLS</span></label>
    <button onClick={save} className="w-fit px-4 py-2 rounded bg-brand-yellow text-black">Save</button>
  </div></AdminShell>;
}
