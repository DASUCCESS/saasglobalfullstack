"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, UserRoundPlus } from "lucide-react";
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
    <section className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-yellow-200 bg-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.45)]">
      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
        <div className="hidden border-r border-yellow-100 bg-black p-10 lg:block" />
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-[28px] border border-yellow-100 bg-white p-8 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow text-black shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-center text-2xl font-semibold text-slate-900">
              Continue to your account
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              Loading access options...
            </p>
          </div>
        </div>
      </div>
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
    toast.success("Login successful.", "Welcome");

    const target =
      res.data.next_path ||
      nextPath ||
      consumePostLoginPath() ||
      (res.data.is_admin ? "/admin/overview" : "/dashboard");

    router.replace(target);
  };

  return (
    <section className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-yellow-200 bg-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.45)]">
      <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-black lg:block">
          <div className="absolute inset-0">
            <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-brand-yellow/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-brand-yellow/10 blur-3xl" />
            <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
          </div>

          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-200">
                SaaSGlobal Hub
              </div>

              <h2 className="mt-8 max-w-sm text-4xl font-semibold leading-tight">
                Access your workspace with one secure account
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                Sign in if you already have an account, or continue with Google to create one instantly.
                This page is used for both login and account access.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow text-black">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Secure access</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      Continue safely with Google authentication and enter your dashboard in seconds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                    <UserRoundPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">New here?</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      No separate setup is required. New users can continue here and get started immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-gradient-to-b from-yellow-50/70 via-white to-white p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="rounded-[28px] border border-yellow-100 bg-white p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow text-black shadow-lg ring-4 ring-yellow-100">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  Sign in or create account
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Continue with Google
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use your Google account to sign in to your existing profile or create a new one automatically.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-yellow-100 bg-yellow-50/70 p-4">
                <GoogleSignInButton onCredential={onCredential} />
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  Need help with access?
                </Link>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-6 text-slate-500">
                By continuing, you can access your dashboard, orders, products, and support conversations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffdf6] px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-yellow/15 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-yellow-100/70 blur-3xl" />
          <div className="absolute right-10 top-1/3 h-48 w-48 rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          <Suspense fallback={<LoginCardSkeleton />}>
            <LoginPageContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}