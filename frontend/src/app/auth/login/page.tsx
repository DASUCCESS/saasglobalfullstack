"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { apiPostResult } from "@/lib/api";
import { consumePostLoginPath, setToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

type GoogleLoginResponse = {
  token: string;
  user_id: number;
  is_admin: boolean;
  next_path: string;
};

function LoginCardSkeleton() {
  return (
    <section className="w-full max-w-md rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        <Sparkles size={14} />
        Secure access
      </div>
      <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">Continue with Google</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">Loading login page...</p>
    </section>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  const onCredential = async (credential: string) => {
    setError("");

    const res = await apiPostResult<GoogleLoginResponse>("/auth/google/", {
      credential,
      next_path: nextPath,
    });

    if (!res.ok || !res.data) {
      const message = res.error?.detail || "Google sign-in failed.";
      setError(message);
      toast.error(message, "Login failed");
      return;
    }

    setToken(res.data.token);
    toast.success("Login successful.", "Welcome back");

    const target =
      res.data.next_path ||
      nextPath ||
      consumePostLoginPath() ||
      (res.data.is_admin ? "/admin/overview" : "/dashboard");

    router.replace(target);
  };

  return (
    <section className="w-full max-w-md rounded-3xl border border-amber-100 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        <ShieldCheck size={14} />
        Trusted sign in
      </div>

      <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">Continue with Google</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Sign in securely to access your products, billing, dashboard, and support conversations.
      </p>

      <div className="mt-6">
        <GoogleSignInButton onCredential={onCredential} />
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-6 grid gap-2 text-sm text-gray-600 sm:grid-cols-2 sm:gap-3">
        <Link
          href="/auth/signup"
          className="rounded-lg border border-gray-200 px-3 py-2 text-center transition hover:border-amber-300 hover:text-amber-700"
        >
          New here? Create account
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-gray-200 px-3 py-2 text-center transition hover:border-amber-300 hover:text-amber-700"
        >
          Need help? Contact us
        </Link>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-gray-100 px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="order-2 rounded-3xl border border-black/5 bg-black px-6 py-8 text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] sm:px-8 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
              SaaSGlobal Hub
            </p>
            <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">Welcome back to your workspace.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
              Fast, secure login powered by Google. Continue to your personalized dashboard to manage products,
              orders, and customer conversations.
            </p>
          </section>

          <div className="order-1 lg:order-2">
            <Suspense fallback={<LoginCardSkeleton />}>
              <LoginPageContent />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
