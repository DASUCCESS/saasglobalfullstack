"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { apiGetResult, apiPostResult } from "@/lib/api";
import { clearToken, setToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

type AdminPinStatus = {
  configured: boolean;
  has_admin_users: boolean;
};

type GoogleLoginResponse = {
  token: string;
  user_id: number;
  is_admin: boolean;
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [status, setStatus] = useState<AdminPinStatus | null>(null);
  const [pin, setPin] = useState("");
  const [pinVerified, setPinVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetResult<AdminPinStatus>("/auth/admin/access-pin/status/").then((res) => {
      if (res.ok && res.data) {
        setStatus(res.data);
      }
    });
  }, []);

  const verifyPin = async () => {
    setError("");

    const res = await apiPostResult<{ status: string }>("/auth/admin/access-pin/verify/", {
      access_pin: pin,
    });

    if (!res.ok) {
      const message = res.error?.detail || "PIN verification failed.";
      setError(message);
      toast.error(message, "Access denied");
      return;
    }

    setPinVerified(true);
    toast.success("Page access PIN verified.");
  };

  const onCredential = async (credential: string) => {
    setError("");

    const res = await apiPostResult<GoogleLoginResponse>("/auth/admin/google/login/", {
      credential,
      access_pin: pin,
    });

    if (!res.ok || !res.data) {
      const message = res.error?.detail || "Admin login failed.";
      setError(message);
      clearToken();
      toast.error(message, "Admin login failed");
      return;
    }

    if (!res.data.is_admin) {
      clearToken();
      setError("This account does not have admin access.");
      toast.error("This account does not have admin access.");
      return;
    }

    setToken(res.data.token);
    toast.success("Admin login successful.");
    router.replace("/admin/overview");
  };

  return (
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-neutral-400">
            This login is for admin accounts only.
          </p>

          {status?.configured === false ? (
            <div className="mt-5 rounded-lg border border-yellow-800 bg-yellow-950/30 p-3 text-sm text-yellow-200">
              Admin page access PIN is not configured yet. Use the admin registration page for first setup.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <input
                type="password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                placeholder="Enter Page Access PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button
                onClick={verifyPin}
                className="w-full cursor-pointer rounded-lg bg-brand-yellow px-4 py-2 text-black"
              >
                Verify PIN
              </button>
            </div>
          )}

          {pinVerified ? (
            <div className="mt-6 rounded-xl bg-white p-4">
              <GoogleSignInButton onCredential={onCredential} />
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </main>
  );
}
