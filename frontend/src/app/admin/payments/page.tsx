"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SecretInput from "@/components/admin/ui/SecretInput";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

export default function Page() {
  const [form, setForm] = useState({
    stripe_public_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    paystack_public_key: "",
    paystack_secret_key: "",
    usd_ngn_rate: "",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<{ payment?: Record<string, string | number> }>("/settings/admin/", token).then((res) => {
      setForm({
        stripe_public_key: String(res?.payment?.stripe_public_key || ""),
        stripe_secret_key: String(res?.payment?.stripe_secret_key || ""),
        stripe_webhook_secret: String(res?.payment?.stripe_webhook_secret || ""),
        paystack_public_key: String(res?.payment?.paystack_public_key || ""),
        paystack_secret_key: String(res?.payment?.paystack_secret_key || ""),
        usd_ngn_rate: String(res?.payment?.usd_ngn_rate || ""),
      });
    });
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost(
      "/settings/admin/update/",
      { payment: { ...form, usd_ngn_rate: Number(form.usd_ngn_rate || 0) } },
      token
    );
    if (!res) {
      toast.error("Save failed.");
      return;
    }
    toast.success("Payment settings saved.");
  };

  const refreshRate = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost<{ usd_ngn_rate: number }>("/settings/payment/refresh-rate/", {}, token);
    if (!res) {
      toast.error("Could not refresh rate.");
      return;
    }
    setForm((prev) => ({ ...prev, usd_ngn_rate: String(res.usd_ngn_rate || prev.usd_ngn_rate) }));
    toast.success("Exchange rate refreshed.");
  };

  return (
    <AdminShell title="Payment Settings">
      <div className="max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.stripe_public_key} onChange={(e) => setForm({ ...form, stripe_public_key: e.target.value })} placeholder="Stripe public key" />
        <SecretInput value={form.stripe_secret_key} onChange={(value) => setForm({ ...form, stripe_secret_key: value })} placeholder="Stripe secret key" />
        <SecretInput value={form.stripe_webhook_secret} onChange={(value) => setForm({ ...form, stripe_webhook_secret: value })} placeholder="Stripe webhook secret" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.paystack_public_key} onChange={(e) => setForm({ ...form, paystack_public_key: e.target.value })} placeholder="Paystack public key" />
        <SecretInput value={form.paystack_secret_key} onChange={(value) => setForm({ ...form, paystack_secret_key: value })} placeholder="Paystack secret key" />

        <div className="flex gap-2">
          <input className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.usd_ngn_rate} onChange={(e) => setForm({ ...form, usd_ngn_rate: e.target.value })} placeholder="USD/NGN rate" />
          <button onClick={refreshRate} className="cursor-pointer rounded border border-neutral-700 px-4 py-2">
            Refresh Rate
          </button>
        </div>

        <button onClick={save} className="w-fit mt-2 cursor-pointer rounded bg-brand-yellow px-4 py-2 text-black">
          Save
        </button>
      </div>
    </AdminShell>
  );
}
