"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import ToastViewport from "@/components/admin/ui/ToastViewport";
import { apiGetResult, apiPostResult } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

type AdminPinStatus = {
  configured: boolean;
  has_admin_users: boolean;
};

type GoogleRegisterResponse = {
  token: string;
  user_id: number;
  is_admin: boolean;
};

export default function AdminSignupPage() {
  const router = useRouter();

  const [status, setStatus] = useState<AdminPinStatus | null>(null);
  const [existingPin, setExistingPin] = useState("");
  const [existingPinVerified, setExistingPinVerified] = useState(false);

  const [setupPin, setSetupPin] = useState("");
  const [setupPinConfirm, setSetupPinConfirm] = useState("");

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
      access_pin: existingPin,
    });

    if (!res.ok) {
      const message = res.error?.detail || "PIN verification failed.";
      setError(message);
      toast.error(message);
      return;
    }

    setExistingPinVerified(true);
    toast.success("Page access PIN verified.");
  };

  const onCredential = async (credential: string) => {
    setError("");

    const payload =
      status?.configured
        ? {
            credential,
            access_pin: existingPin,
          }
        : {
            credential,
            setup_pin: setupPin,
            setup_pin_confirm: setupPinConfirm,
          };

    const res = await apiPostResult<GoogleRegisterResponse>("/auth/admin/google/register/", payload);

    if (!res.ok || !res.data) {
      const message = res.error?.detail || "Admin registration failed.";
      setError(message);
      toast.error(message);
      return;
    }

    setToken(res.data.token);
    toast.success("Admin registration successful.");
    router.replace("/admin/overview");
  };

  const firstSetupMode = status?.configured === false && status?.has_admin_users === false;

  return (
    <>
      <ToastViewport />
      <main className="grid min-h-screen place-items-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
          <h1 className="text-2xl font-bold">Admin Registration</h1>
          <p className="mt-2 text-sm text-neutral-400">
            This registration path creates admin accounts only.
          </p>

          {firstSetupMode ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-blue-900 bg-blue-950/30 p-3 text-sm text-blue-200">
                First admin setup mode. Create your Page Access PIN now.
              </div>

              <input
                type="password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                placeholder="Create Page Access PIN"
                value={setupPin}
                onChange={(e) => setSetupPin(e.target.value)}
              />
              <input
                type="password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                placeholder="Confirm Page Access PIN"
                value={setupPinConfirm}
                onChange={(e) => setSetupPinConfirm(e.target.value)}
              />

              {setupPin && setupPinConfirm && setupPin === setupPinConfirm ? (
                <div className="mt-4 rounded-xl bg-white p-4">
                  <GoogleSignInButton onCredential={onCredential} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <input
                type="password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
                placeholder="Enter existing Page Access PIN"
                value={existingPin}
                onChange={(e) => setExistingPin(e.target.value)}
              />
              <button
                onClick={verifyPin}
                className="w-full cursor-pointer rounded-lg bg-brand-yellow px-4 py-2 text-black"
              >
                Verify PIN
              </button>

              {existingPinVerified ? (
                <div className="mt-4 rounded-xl bg-white p-4">
                  <GoogleSignInButton onCredential={onCredential} />
                </div>
              ) : null}
            </div>
          )}

          {error ? (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
