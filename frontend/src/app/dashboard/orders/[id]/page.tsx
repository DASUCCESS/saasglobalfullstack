"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiGetResult, apiPostResult, PaginatedResponse } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Message = {
  id: number;
  message: string;
  is_admin: boolean;
  sender_name: string;
  created_at: string;
};

type Order = {
  id: number;
  product_name: string;
  product_slug: string;
  product_image_url?: string;
  status: "pending" | "paid" | "failed";
  provider: string;
  amount: string;
  amount_ngn: string;
  payment_reference: string;
  provider_status?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string | null;
  fulfilled_at?: string | null;
  download_url: string;
  access_url: string;
  access_label: string;
  access_instructions: string;
  can_access_support_chat: boolean;
  unread_admin_messages: number;
};

type MessagesPayload = {
  order: Order;
  messages: PaginatedResponse<Message>;
};

const PAGE_SIZE = 20;

function OrderConversationPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = getToken();
  const page = Number(searchParams.get("page") || "1");
  const feedRef = useRef<HTMLDivElement>(null);
  const autoVerifyTriggeredRef = useRef(false);

  const [messages, setMessages] = useState<PaginatedResponse<Message> | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [autoVerificationFailed, setAutoVerificationFailed] = useState(false);

  const paymentParam = searchParams.get("payment");
  const providerParam = searchParams.get("provider") || "";
  const sessionId = searchParams.get("session_id") || "";
  const reference = searchParams.get("reference") || "";

  const hasRedirectVerificationParams = useMemo(() => {
    return Boolean(paymentParam || sessionId || reference || providerParam);
  }, [paymentParam, sessionId, reference, providerParam]);

  const clearPaymentQueryParams = useCallback(() => {
    const qp = new URLSearchParams(searchParams.toString());
    qp.delete("payment");
    qp.delete("provider");
    qp.delete("session_id");
    qp.delete("reference");
    const next = qp.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [pathname, router, searchParams]);

  const load = useCallback(async () => {
    if (!params?.id || !token) return null;

    const res = await apiGetResult<MessagesPayload>(
      `/dashboard/orders/${params.id}/messages/?page=${page}&page_size=${PAGE_SIZE}`,
      token
    );

    if (!res.ok || !res.data) {
      setError(res.error?.detail || "Failed to load conversation.");
      return null;
    }

    setError("");
    setOrder(res.data.order);
    setMessages(res.data.messages);

    const latestId = res.data.messages.results[res.data.messages.results.length - 1]?.id;
    if (latestId) {
      await apiPostResult(`/dashboard/orders/${params.id}/mark-read/`, { last_message_id: latestId }, token);
    }

    return res.data;
  }, [params?.id, token, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 15000);

    return () => clearInterval(interval);
  }, [load]);

  const runVerification = useCallback(
    async (source: "auto" | "manual") => {
      if (!token || !params?.id || verifyingPayment) return false;

      const paymentReference = reference || order?.payment_reference || "";
      if (!paymentReference) return false;

      setVerifyingPayment(true);
      setError("");

      const res = await apiPostResult<{ status: string }>(
        "/payments/verify/",
        {
          payment_reference: paymentReference,
          session_id: sessionId,
        },
        token
      );

      setVerifyingPayment(false);

      if (!res.ok) {
        const message = res.error?.detail || "Could not verify payment.";
        setError(message);

        if (source === "auto") {
          setAutoVerificationFailed(true);
        }

        return false;
      }

      const refreshed = await load();

      if (source === "auto") {
        setAutoVerificationFailed(false);
      }

      if (paymentParam === "success" || hasRedirectVerificationParams) {
        clearPaymentQueryParams();
      }

      if (refreshed?.order?.status === "paid") {
        setError("");
      }

      return true;
    },
    [
      token,
      params?.id,
      verifyingPayment,
      reference,
      order?.payment_reference,
      sessionId,
      load,
      paymentParam,
      hasRedirectVerificationParams,
      clearPaymentQueryParams,
    ]
  );

  useEffect(() => {
    if (!token || !params?.id) return;
    if (!hasRedirectVerificationParams) return;
    if (autoVerifyTriggeredRef.current) return;
    if (!order) return;

    autoVerifyTriggeredRef.current = true;

    if (order.status === "paid") {
      clearPaymentQueryParams();
      setAutoVerificationFailed(false);
      return;
    }

    runVerification("auto");
  }, [
    token,
    params?.id,
    hasRedirectVerificationParams,
    order,
    clearPaymentQueryParams,
    runVerification,
  ]);

  const retryVerification = useCallback(async () => {
    const ok = await runVerification("manual");
    if (ok) {
      setAutoVerificationFailed(false);
    }
  }, [runVerification]);

  const sendMessage = async () => {
    if (!params?.id || !token || !text.trim()) return;

    const optimistic: Message = {
      id: -Date.now(),
      message: text.trim(),
      is_admin: false,
      sender_name: "You",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => (prev ? { ...prev, results: [...prev.results, optimistic] } : prev));

    const res = await apiPostResult<Message>(
      `/dashboard/orders/${params.id}/messages/`,
      { message: text.trim() },
      token
    );

    if (!res.ok) {
      setError(res.error?.detail || "Failed to send message.");
      await load();
      return;
    }

    setText("");
    await load();
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil((messages?.count || 0) / PAGE_SIZE)), [messages]);

  const setPage = (next: number) => {
    const qp = new URLSearchParams(searchParams.toString());
    qp.set("page", String(next));
    router.push(`${pathname}?${qp.toString()}`);
  };

  const showRetryVerification =
    order?.status === "pending" && autoVerificationFailed && !verifyingPayment;

  const showAutoVerifyingNotice =
    order?.status === "pending" &&
    hasRedirectVerificationParams &&
    verifyingPayment &&
    !autoVerificationFailed;

  return (
    <DashboardShell>
      {({ openSidebar, theme, onToggleTheme, notificationCount, userName }) => (
        <main className="space-y-6">
          <DashboardHeader
            title={`Welcome ${userName}`}
            description="View order details and support messages."
            onOpenMobileSidebar={openSidebar}
            theme={theme}
            onToggleTheme={onToggleTheme}
            notificationCount={notificationCount}
            actionSlot={
              <Link
                href="/dashboard/orders"
                className="inline-flex h-12 cursor-pointer items-center border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition duration-300 hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                Back to orders
              </Link>
            }
          />

          <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <aside className="border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1424]/90">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Order Summary</h2>
              </div>

              {order ? (
                <div className="mt-3 space-y-3 text-sm">
                  {order.product_image_url ? (
                    <img
                      src={order.product_image_url}
                      alt={order.product_name}
                      className="h-40 w-full border object-cover dark:border-white/10"
                    />
                  ) : null}

                  <p className="font-semibold">{order.product_name}</p>
                  <p>Ref: {order.payment_reference}</p>
                  <p>Status: {order.status.toUpperCase()}</p>
                  <p>
                    Amount: ${order.amount} / ₦{order.amount_ngn}
                  </p>

                  {showAutoVerifyingNotice ? (
                    <div className="border border-[rgba(244,180,0,0.40)] bg-[rgba(244,180,0,0.10)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-yellow-800 dark:text-brand-yellow">
                        Verifying payment
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        We are automatically verifying your payment and unlocking access.
                      </p>
                    </div>
                  ) : null}

                  {showRetryVerification ? (
                    <div className="border border-[rgba(244,180,0,0.40)] bg-[rgba(244,180,0,0.10)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-yellow-800 dark:text-brand-yellow">
                        Verification needed
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        Automatic payment verification did not complete successfully. Click below to try again.
                      </p>

                      <button
                        type="button"
                        onClick={retryVerification}
                        disabled={verifyingPayment}
                        className="mt-3 inline-flex cursor-pointer items-center justify-center bg-brand-yellow px-4 py-2 text-sm font-medium text-slate-900 transition hover:scale-105 disabled:opacity-50"
                      >
                        {verifyingPayment ? "Verifying..." : "Retry Verification"}
                      </button>
                    </div>
                  ) : null}

                  {order.download_url ? (
                    <a
                      href={order.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-brand-yellow px-3 py-2 text-slate-900"
                    >
                      Download ZIP
                    </a>
                  ) : null}

                  {order.access_url ? (
                    <a
                      href={order.access_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block border border-slate-200 px-3 py-2 dark:border-white/10"
                    >
                      {order.access_label || "Open Access"}
                    </a>
                  ) : null}

                  {order.access_instructions ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400">{order.access_instructions}</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
              )}
            </aside>

            <section className="border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1424]/90">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Order Conversation</h1>

                {showRetryVerification ? (
                  <button
                    type="button"
                    onClick={retryVerification}
                    disabled={verifyingPayment}
                    className="inline-flex cursor-pointer items-center justify-center border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:scale-105 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    {verifyingPayment ? "Verifying..." : "Retry Verification"}
                  </button>
                ) : null}
              </div>

              {showAutoVerifyingNotice ? (
                <div className="mt-3 border border-[rgba(244,180,0,0.40)] bg-[rgba(244,180,0,0.10)] p-3 text-sm text-slate-800 dark:text-slate-200">
                  Verifying your payment automatically and unlocking access...
                </div>
              ) : null}

              {verifyingPayment && !showAutoVerifyingNotice ? (
                <div className="mt-3 border border-[rgba(244,180,0,0.40)] bg-[rgba(244,180,0,0.10)] p-3 text-sm text-slate-800 dark:text-slate-200">
                  Verifying your payment and unlocking access...
                </div>
              ) : null}

              {error ? (
                <div className="mt-3 border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              <div ref={feedRef} className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {(messages?.results || []).map((m) => (
                  <div
                    key={m.id}
                    className={`border p-3 ${
                      m.is_admin
                        ? "border-[rgba(244,180,0,0.40)] bg-[rgba(244,180,0,0.10)]"
                        : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {m.sender_name || (m.is_admin ? "Admin" : "You")}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm">{m.message}</p>
                  </div>
                ))}
              </div>

              {order?.can_access_support_chat ? (
                <div className="mt-4 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                  />
                  <button
                    onClick={sendMessage}
                    className="cursor-pointer bg-brand-yellow px-4 py-2 text-slate-900"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <div className="mt-4 border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  Support chat becomes available after payment is confirmed.
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    className="cursor-pointer border border-slate-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="cursor-pointer border border-slate-200 bg-brand-yellow px-3 py-1.5 text-slate-900 disabled:opacity-50 dark:border-white/10"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      )}
    </DashboardShell>
  );
}

export default function OrderConversationPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          {() => (
            <main className="space-y-6">
              <section className="border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1424]/90">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-white/10" />
                  <div className="h-24 w-full bg-slate-200 dark:bg-white/10" />
                  <div className="h-48 w-full bg-slate-200 dark:bg-white/10" />
                </div>
              </section>
            </main>
          )}
        </DashboardShell>
      }
    >
      <OrderConversationPageContent />
    </Suspense>
  );
}
