"use client";

import { useEffect, useMemo, useState } from "react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import SubscriptionPlanSelector from "@/components/products/SubscriptionPlanSelector";
import { apiGetResult, apiPostResult } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

type Props = {
  slug: string;
  priceUsd: number;
  priceNgn: number;
  showNaira?: boolean;
  isNigeria?: boolean;
  subscriptionEnabled?: boolean;
  subscriptionPlans?: Array<{
    id: string;
    name: string;
    billing_period: string;
    price_usd: number;
    price_ngn?: number;
  }>;
};

type MeResponse = {
  email: string;
  name: string;
};

type PaymentStartResponse = {
  order_id: number;
  payment_reference: string;
  provider: "stripe" | "paystack";
  checkout_url: string;
  status: "pending" | "paid" | "failed";
  idempotency_key: string;
};

type GoogleLoginResponse = {
  token: string;
  is_admin: boolean;
};

function createIdempotencyKey(slug: string, provider: string) {
  const randomPart =
    typeof window !== "undefined" && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${slug}-${provider}-${randomPart}`;
}

function ProviderLogo({
  src,
  alt,
  active,
}: {
  src: string;
  alt: string;
  active: boolean;
}) {
  return (
    <span
      className={`flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-2 shadow-sm ${
        active ? "border border-white/30" : "border border-gray-200"
      }`}
    >
      <img
        src={src}
        alt={alt}
        className="h-10 w-auto object-contain"
        loading="lazy"
      />
    </span>
  );
}
export default function PaymentPanel({
  slug,
  priceUsd,
  priceNgn,
  showNaira = false,
  isNigeria = false,
  subscriptionEnabled = false,
  subscriptionPlans = [],
}: Props) {
  const [provider, setProvider] = useState<"stripe" | "paystack">(
    isNigeria ? "paystack" : "stripe"
  );
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [autoCheckout, setAutoCheckout] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<"one_time" | "subscription">("one_time");
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState("");
  const showPaystackOption = isNigeria || process.env.NODE_ENV !== "production";

  const selectedPlan = useMemo(
    () => subscriptionPlans.find((plan) => plan.id === selectedSubscriptionPlan),
    [subscriptionPlans, selectedSubscriptionPlan]
  );
  const effectivePriceUsd =
    purchaseMode === "subscription" && selectedPlan ? selectedPlan.price_usd : priceUsd;
  const effectivePriceNgn =
    purchaseMode === "subscription" && selectedPlan && typeof selectedPlan.price_ngn === "number"
      ? selectedPlan.price_ngn
      : priceNgn;

  const currentPath = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : `/products/${slug}`,
    [slug]
  );

  useEffect(() => {
    setProvider(isNigeria ? "paystack" : "stripe");
  }, [isNigeria]);

  useEffect(() => {
    if (subscriptionEnabled && subscriptionPlans.length) {
      setSelectedSubscriptionPlan(subscriptionPlans[0].id);
    } else {
      setPurchaseMode("one_time");
      setSelectedSubscriptionPlan("");
    }
  }, [subscriptionEnabled, subscriptionPlans]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiGetResult<MeResponse>("/auth/me/", token).then((res) => {
      if (!res.ok || !res.data) return;
      setAuthed(true);
      setUserEmail(res.data.email || "");
      setUserName(res.data.name || "");
    });
  }, []);

  const startPayment = async (activeToken?: string) => {
    const token = activeToken || getToken();

    if (!token) {
      setAutoCheckout(true);
      toast.info("Continue with Google first to start checkout.");
      return;
    }

    const resolvedProvider: "stripe" | "paystack" =
      provider === "paystack" && !showPaystackOption ? "stripe" : provider;
    const resolvedPurchaseMode: "one_time" | "subscription" =
      purchaseMode === "subscription" && subscriptionEnabled ? "subscription" : "one_time";
    if (resolvedPurchaseMode === "subscription" && !selectedSubscriptionPlan) {
      toast.error("Select a subscription plan to continue.");
      return;
    }

    setError("");
    setLoading(true);

    const res = await apiPostResult<PaymentStartResponse>(
      "/payments/start/",
      {
        product_slug: slug,
        provider: resolvedProvider,
        purchase_mode: resolvedPurchaseMode,
        subscription_plan_id: resolvedPurchaseMode === "subscription" ? selectedSubscriptionPlan : "",
        idempotency_key: createIdempotencyKey(slug, resolvedProvider),
        return_path: currentPath,
      },
      token
    );

    if (!res.ok || !res.data?.checkout_url) {
      setLoading(false);
      const message = res.error?.detail || "Could not start payment.";
      setError(message);
      toast.error(message, "Checkout failed");
      return;
    }

    toast.success("Redirecting to payment provider...");
    window.location.assign(res.data.checkout_url);
  };

  const handleGoogleCredential = async (credential: string) => {
    setError("");

    const res = await apiPostResult<GoogleLoginResponse>("/auth/google/", {
      credential,
      next_path: currentPath,
    });

    if (!res.ok || !res.data) {
      const message = res.error?.detail || "Google sign-in failed.";
      setError(message);
      toast.error(message, "Login failed");
      return;
    }

    setToken(res.data.token);

    const me = await apiGetResult<MeResponse>("/auth/me/", res.data.token);
    if (me.ok && me.data) {
      setAuthed(true);
      setUserEmail(me.data.email || "");
      setUserName(me.data.name || "");
    }

    toast.success("Google sign-in completed.");

    if (autoCheckout) {
      await startPayment(res.data.token);
    }
  };

  return (
    <>
      <div className="mt-2 max-w-2xl rounded-2xl border bg-white p-5 shadow-xl">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          {authed ? (
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-gray-900">
                {userName || "Authenticated user"}
              </p>
              <p className="text-gray-600">{userEmail}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Sign in with Google to continue checkout.
              </p>
              <GoogleSignInButton
                onCredential={handleGoogleCredential}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {subscriptionEnabled ? (
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Purchase Type</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm ${purchaseMode === "one_time" ? "bg-black text-white" : "border border-gray-300 bg-white text-black"}`}
                  onClick={() => setPurchaseMode("one_time")}
                >
                  Full Purchase
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm ${purchaseMode === "subscription" ? "bg-black text-white" : "border border-gray-300 bg-white text-black"}`}
                  onClick={() => setPurchaseMode("subscription")}
                >
                  Subscription
                </button>
              </div>

              {purchaseMode === "subscription" ? (
                <div className="mt-3">
                  <SubscriptionPlanSelector
                    plans={subscriptionPlans}
                    value={selectedSubscriptionPlan}
                    onChange={setSelectedSubscriptionPlan}
                    showNaira={showNaira}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setProvider("stripe")}
            className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition hover:scale-105 ${
              provider === "stripe"
                ? "border-black bg-black text-white"
                : "border-gray-200 bg-white text-black hover:border-gray-300"
            }`}
          >
            <ProviderLogo
              src="/stripe.png"
              alt="Stripe"
              active={provider === "stripe"}
            />
            <span className="flex flex-col items-start text-left">
              <span className="text-sm font-semibold">Stripe</span>
                <span
                  className={`text-xs ${
                    provider === "stripe" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  USD ${effectivePriceUsd.toLocaleString()}
                </span>
              </span>
            </button>

          {showPaystackOption ? (
            <button
              type="button"
              onClick={() => setProvider("paystack")}
              className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition hover:scale-105 ${
                provider === "paystack"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-black hover:border-gray-300"
              }`}
            >
              <ProviderLogo
                src="/paystack.png"
                alt="Paystack"
                active={provider === "paystack"}
              />
              <span className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold">Paystack</span>
                <span
                  className={`text-xs ${
                    provider === "paystack" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  ₦{effectivePriceNgn.toLocaleString()}
                </span>
              </span>
            </button>
          ) : null}
        </div>

        {!isNigeria ? (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {showPaystackOption
              ? "Checkout defaults to USD via Stripe outside Nigeria (Paystack visible in development)."
              : "Checkout is available in USD via Stripe."}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          disabled={loading}
          onClick={() => {
            if (!authed) setAutoCheckout(true);
            startPayment();
          }}
          className="mt-5 cursor-pointer rounded-md bg-brand-yellow px-5 py-2 font-medium text-black shadow-lg transition hover:scale-105 disabled:opacity-50"
        >
          {loading
            ? "Redirecting..."
            : authed
              ? provider === "paystack" && showPaystackOption
                ? "Proceed to Paystack"
                : "Proceed to Stripe"
              : "Continue with Google to pay"}
        </button>
      </div>
    </>
  );
}
