"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import ToastViewport from "@/components/admin/ui/ToastViewport";
import { apiPostResult } from "@/lib/api";
import { consumePostLoginPath, setToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

type GoogleLoginResponse = {
  token: string;
  user_id: number;
  is_admin: boolean;
  next_path: string;
};

export default function LoginPage() {
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
      "/dashboard";

    router.replace(target);
  };

  return (
    <>
      <ToastViewport />
      <main className="grid min-h-screen place-items-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
          <h1 className="text-2xl font-bold">Continue with Google</h1>
          <p className="mt-2 text-sm text-gray-600">
            This is the public user login flow. It signs in normal users only.
          </p>

          <div className="mt-6">
            <GoogleSignInButton onCredential={onCredential} />
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
