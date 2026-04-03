"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    const res = await apiPost<{ token: string }>("/auth/register/", { full_name: fullName, email, password });
    if (!res) return alert("Signup failed");
    setToken(res.token);
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Sign up</h1>
        <input className="w-full mt-4 border rounded-lg px-3 py-2" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input className="w-full mt-3 border rounded-lg px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full mt-3 border rounded-lg px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={onSignup} className="w-full mt-4 py-2 rounded-lg bg-black text-white">Create account</button>
        <p className="text-sm mt-3">Already registered? <Link href="/auth/login" className="underline">Login</Link></p>
      </div>
    </main>
  );
}
