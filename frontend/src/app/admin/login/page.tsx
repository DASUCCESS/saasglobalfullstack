"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await apiPost<{ token: string; is_admin: boolean }>("/auth/login/", { email, password });
    if (!res?.is_admin) return alert("Admin credentials required");
    setToken(res.token);
    window.location.href = "/admin/overview";
  };

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <input className="w-full mt-4 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
        <input type="password" className="w-full mt-3 border border-neutral-700 bg-neutral-950 rounded-lg px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={submit} className="w-full mt-4 py-2 rounded-lg bg-brand-yellow text-black">Login</button>
      </div>
    </main>
  );
}
