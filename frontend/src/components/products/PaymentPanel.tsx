"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";

type Props = {
  slug: string;
  priceUsd: number;
  priceNgn: number;
};

export default function PaymentPanel({ slug, priceUsd, priceNgn }: Props) {
  const [provider, setProvider] = useState<"stripe" | "paystack">("stripe");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<{ email: string; name: string }>("/auth/me/", token).then((me) => {
      if (!me) return;
      setEmail(me.email || "");
      setFullName(me.name || "");
      setAuthed(true);
    });
  }, []);

  const authenticateWithGoogle = async () => {
    if (!email) return alert("Please enter your email first");
    const res = await apiPost<{ token: string }>("/auth/google/", {
      email,
      full_name: fullName || email.split("@")[0],
      google_id: `google-${Date.now()}`,
    });
    if (!res) return alert("Google signup/login failed");
    setToken(res.token);
    setAuthed(true);
  };

  const startPayment = async () => {
    setLoading(true);
    const start = await apiPost<{ payment_reference: string; token: string }>("/payments/start/", {
      email,
      full_name: fullName,
      product_slug: slug,
      provider,
      google_id: authed ? `google-${email}` : "",
    });
    if (!start) {
      alert("Unable to start payment. Complete Google sign in first.");
      setLoading(false);
      return;
    }

    setToken(start.token);
    const verify = await apiPost<{ redirect_url: string; status: string }>("/payments/verify/", {
      payment_reference: start.payment_reference,
      success: true,
    });

    if (verify?.status === "paid") {
      window.location.href = verify.redirect_url;
      return;
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 p-5 rounded-xl border bg-white shadow-xl max-w-2xl">
      <h3 className="font-semibold text-lg">Secure Checkout</h3>
      <p className="text-sm text-gray-600 mt-1">New users should sign up with Google here, then payment continues automatically.</p>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <input className="rounded-lg border px-3 py-2" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {!authed && (
        <button onClick={authenticateWithGoogle} className="mt-3 px-4 py-2 rounded-md border">
          Create account / Sign in with Google
        </button>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <button onClick={() => setProvider("stripe")} className={`px-4 py-2 rounded-md border ${provider === "stripe" ? "bg-black text-white" : "bg-white"}`}>Stripe (USD ${priceUsd})</button>
        <button onClick={() => setProvider("paystack")} className={`px-4 py-2 rounded-md border ${provider === "paystack" ? "bg-black text-white" : "bg-white"}`}>Paystack (₦{priceNgn})</button>
      </div>
      <button disabled={loading || !authed} onClick={startPayment} className="mt-4 px-5 py-2 rounded-md bg-brand-yellow text-black font-medium disabled:opacity-50">
        {loading ? "Processing..." : "Proceed to payment"}
      </button>
    </div>
  );
}
