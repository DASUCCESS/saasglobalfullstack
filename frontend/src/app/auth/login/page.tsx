"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    const res = await apiPost<{ token: string; is_admin: boolean }>("/auth/login/", { email, password });
    if (!res) return alert("Invalid credentials");
    setToken(res.token);
    window.location.href = res.is_admin ? "/admin/overview" : "/dashboard";
  };

  const onGoogle = async () => {
    const googleId = `google-${Date.now()}`;
    const res = await apiPost<{ token: string }>("/auth/google/", { email, full_name: email.split("@")[0], google_id: googleId });
    if (!res) return alert("Google sign-in failed");
    setToken(res.token);
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Login</h1>
        <input className="w-full mt-4 border rounded-lg px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full mt-3 border rounded-lg px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={onLogin} className="w-full mt-4 py-2 rounded-lg bg-black text-white">Login</button>
        <button onClick={onGoogle} className="w-full mt-2 py-2 rounded-lg border">Continue with Google</button>
        <p className="text-sm mt-3">No account? <Link href="/auth/signup" className="underline">Sign up</Link></p>
      </div>
    </main>
  );
}
