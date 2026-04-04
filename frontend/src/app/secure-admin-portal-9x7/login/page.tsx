"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { ADMIN_SIGNUP_PATH } from "@/lib/admin";

export default function SecureAdminLoginPage() {
  const [accessPin, setAccessPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await apiPost<{ token: string; is_admin: boolean; detail?: string }>("/auth/admin/login/", { email, password, access_pin: accessPin });
    if (!res?.token || !res.is_admin) return alert(res?.detail || "Admin credentials required");
    setToken(res.token);
    window.location.href = "/admin/overview";
  };

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Private Admin Portal</p>
        <h1 className="text-2xl font-bold mt-2">Admin Login</h1>
        <p className="text-sm text-neutral-400 mt-2">Enter the access PIN and admin credentials.</p>
        <input className="w-full mt-5 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" value={accessPin} onChange={(e) => setAccessPin(e.target.value)} placeholder="Access PIN" />
        <input className="w-full mt-3 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
        <input type="password" className="w-full mt-3 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={submit} className="w-full mt-5 py-2 rounded-lg bg-brand-yellow text-black">Login</button>
        <p className="text-sm text-neutral-400 mt-4">Need admin onboarding? <Link href={ADMIN_SIGNUP_PATH} className="underline text-white">Sign up</Link></p>
      </div>
    </main>
  );
}
