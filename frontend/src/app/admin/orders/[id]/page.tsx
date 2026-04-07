"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
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
  status: "pending" | "paid" | "failed";
  provider: string;
  amount: string;
  amount_ngn: string;
  payment_reference: string;
  download_url: string;
  access_url: string;
  access_label: string;
  access_instructions: string;
  can_access_support_chat: boolean;
};

type MessagesPayload = {
  order: Order;
  messages: PaginatedResponse<Message>;
};

const PAGE_SIZE = 20;

function AdminOrderDetailPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = getToken();
  const page = Number(searchParams.get("page") || "1");
  const feedRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<PaginatedResponse<Message> | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!params?.id || !token) return;

    const res = await apiGetResult<MessagesPayload>(`/dashboard/orders/${params.id}/messages/?page=${page}&page_size=${PAGE_SIZE}`, token);
    if (!res.ok || !res.data) {
      setError(res.error?.detail || "Failed to load order conversation.");
      return;
    }

    setError("");
    setOrder(res.data.order);
    setMessages(res.data.messages);

    const latestId = res.data.messages.results[res.data.messages.results.length - 1]?.id;
    if (latestId) {
      await apiPostResult(`/dashboard/orders/${params.id}/mark-read/`, { last_message_id: latestId }, token);
    }
  }, [params?.id, token, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!params?.id || !token || !text.trim()) return;

    const res = await apiPostResult<Message>(`/dashboard/orders/${params.id}/messages/`, { message: text.trim() }, token);
    if (!res.ok) {
      setError(res.error?.detail || "Failed to send reply.");
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

  return (
    <AdminShell title="Order Conversation">
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Order Summary</h2>
            <Link href="/admin/orders" className="text-xs text-neutral-400 underline">
              Back
            </Link>
          </div>

          {order ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-semibold">{order.product_name}</p>
              <p>Ref: {order.payment_reference}</p>
              <p>Status: {order.status.toUpperCase()}</p>
              <p>Amount: ${order.amount} / ₦{order.amount_ngn}</p>
              {order.download_url ? (
                <a href={order.download_url} target="_blank" rel="noreferrer" className="inline-block rounded border border-neutral-700 px-3 py-2">
                  Download Asset
                </a>
              ) : null}
              {order.access_url ? (
                <a href={order.access_url} target="_blank" rel="noreferrer" className="inline-block rounded bg-brand-yellow px-3 py-2 text-black">
                  {order.access_label || "Open Access"}
                </a>
              ) : null}
              {order.access_instructions ? <p className="text-xs text-neutral-400">{order.access_instructions}</p> : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-400">Loading…</p>
          )}
        </aside>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          {error ? <div className="rounded border border-red-800 bg-red-950/40 p-3 text-sm text-red-300">{error}</div> : null}

          <div ref={feedRef} className="mt-2 max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {(messages?.results || []).map((m) => (
              <div key={m.id} className={`rounded-lg border p-3 ${m.is_admin ? "border-brand-yellow/40 bg-neutral-950" : "border-neutral-700 bg-neutral-800"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{m.sender_name || (m.is_admin ? "Admin" : "Customer")}</p>
                  <p className="text-xs text-neutral-400">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-sm text-neutral-100">{m.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write an admin reply..."
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
            />
            <button onClick={sendMessage} className="cursor-pointer rounded-lg bg-brand-yellow px-4 py-2 text-black">
              Send
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button className="cursor-pointer rounded border border-neutral-700 px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <button className="cursor-pointer rounded border border-neutral-700 px-3 py-1.5 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <AdminShell title="Order Conversation">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 rounded bg-neutral-800" />
              <div className="h-24 w-full rounded bg-neutral-800" />
              <div className="h-56 w-full rounded bg-neutral-800" />
            </div>
          </section>
        </AdminShell>
      }
    >
      <AdminOrderDetailPageContent />
    </Suspense>
  );
}
