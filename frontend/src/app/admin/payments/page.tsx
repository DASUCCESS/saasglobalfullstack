"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function Page() {
  const [form, setForm] = useState({ stripe_public_key: "", stripe_secret_key: "", paystack_public_key: "", paystack_secret_key: "", usd_ngn_rate: "" });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<{ payment?: Record<string, string> }>("/settings/admin/", token).then((res) => {
      setForm({
        stripe_public_key: String(res?.payment?.stripe_public_key || ""),
        stripe_secret_key: String(res?.payment?.stripe_secret_key || ""),
        paystack_public_key: String(res?.payment?.paystack_public_key || ""),
        paystack_secret_key: String(res?.payment?.paystack_secret_key || ""),
        usd_ngn_rate: String(res?.payment?.usd_ngn_rate || ""),
      });
    });
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost("/settings/admin/update/", { payment: { ...form, usd_ngn_rate: Number(form.usd_ngn_rate || 0) } }, token);
    if (!res) return alert("Save failed");
    alert("Payment settings saved");
  };

  return (
    <AdminShell title="Payments Settings">
      <div className="max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.stripe_public_key} onChange={(e) => setForm({ ...form, stripe_public_key: e.target.value })} placeholder="Stripe public key" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.stripe_secret_key} onChange={(e) => setForm({ ...form, stripe_secret_key: e.target.value })} placeholder="Stripe secret key" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.paystack_public_key} onChange={(e) => setForm({ ...form, paystack_public_key: e.target.value })} placeholder="Paystack public key" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.paystack_secret_key} onChange={(e) => setForm({ ...form, paystack_secret_key: e.target.value })} placeholder="Paystack secret key" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.usd_ngn_rate} onChange={(e) => setForm({ ...form, usd_ngn_rate: e.target.value })} placeholder="USD/NGN rate" />
        <button onClick={save} className="w-fit mt-2 px-4 py-2 rounded bg-brand-yellow text-black">Save</button>
      </div>
    </AdminShell>
  );
}
