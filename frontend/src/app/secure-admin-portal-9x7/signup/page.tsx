"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { ADMIN_LOGIN_PATH } from "@/lib/admin";

export default function SecureAdminSignupPage() {
  const [accessPin, setAccessPin] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    const res = await apiPost<{ token?: string; detail?: string }>("/auth/admin/register/", {
      full_name: fullName,
      email,
      password,
      access_pin: accessPin,
    });
    if (!res?.token) return alert(res?.detail || "Admin signup failed");
    setToken(res.token);
    window.location.href = "/admin/overview";
  };

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Private Admin Portal</p>
        <h1 className="text-2xl font-bold mt-2">Admin Sign up</h1>
        <p className="text-sm text-neutral-400 mt-2">Protected admin onboarding using access PIN.</p>
        <input className="w-full mt-5 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" value={accessPin} onChange={(e) => setAccessPin(e.target.value)} placeholder="Access PIN" />
        <input className="w-full mt-3 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="w-full mt-3 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full mt-3 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={onSignup} className="w-full mt-5 py-2 rounded-lg bg-brand-yellow text-black">Create admin account</button>
        <p className="text-sm text-neutral-400 mt-4">Already onboarded? <Link href={ADMIN_LOGIN_PATH} className="underline text-white">Login</Link></p>
      </div>
    </main>
  );
}
