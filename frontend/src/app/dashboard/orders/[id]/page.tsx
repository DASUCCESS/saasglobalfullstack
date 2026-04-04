"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiGetResult, apiPostResult, PaginatedResponse } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Message = { id: number; message: string; is_admin: boolean; sender_name: string; created_at: string };
type Order = {
  id: number;
  product_name: string;
  product_slug: string;
  status: "pending" | "paid" | "failed";
  provider: string;
  amount: string;
  amount_ngn: string;
  payment_reference: string;
  created_at: string;
  paid_at?: string | null;
  download_url: string;
  download_details?: { version?: string; file_size?: string; checksum?: string; changelog?: string; released_at?: string };
  unread_admin_messages: number;
};

const PAGE_SIZE = 20;

export default function OrderConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const token = getToken();

  const [messages, setMessages] = useState<PaginatedResponse<Message> | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!params?.id || !token) return;
    apiGetResult<{ order: Order; messages: PaginatedResponse<Message> }>(`/dashboard/orders/${params.id}/messages/?page=${page}&page_size=${PAGE_SIZE}`, token).then(async (res) => {
      if (!res.ok || !res.data) {
        setError(res.error?.detail || "Failed to load conversation");
        return;
      }
      setError("");
      setOrder(res.data.order);
      setMessages(res.data.messages);
      const latestId = res.data.messages.results[res.data.messages.results.length - 1]?.id;
      if (latestId) {
        await apiPostResult(`/dashboard/orders/${params.id}/mark-read/`, { last_message_id: latestId }, token);
      }
    });
  }, [params?.id, token, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const interval = setInterval(() => load(), 15000);
    return () => clearInterval(interval);
  }, [load]);

  const sendMessage = async () => {
    if (!params?.id || !token || !text.trim()) return;
    const optimistic: Message = {
      id: -Date.now(),
      message: text.trim(),
      is_admin: false,
      sender_name: "You",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => prev ? ({ ...prev, results: [...prev.results, optimistic] }) : prev);
    const res = await apiPostResult<Message>(`/dashboard/orders/${params.id}/messages/`, { message: text.trim() }, token);
    if (!res.ok) {
      setError(res.error?.detail || "Failed to send message");
      load();
      return;
    }
    setText("");
    load();
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil((messages?.count || 0) / PAGE_SIZE)), [messages]);
  const setPage = (next: number) => {
    const qp = new URLSearchParams(searchParams.toString());
    qp.set("page", String(next));
    router.push(`${pathname}?${qp.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[340px_1fr] gap-5">
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Order Summary</h2>
            <Link href="/dashboard" className="text-xs underline text-gray-600">Back</Link>
          </div>
          {order ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-semibold">{order.product_name}</p>
              <p>Ref: {order.payment_reference}</p>
              <p>Status: {order.status.toUpperCase()}</p>
              <p>Amount: ${order.amount} / ₦{order.amount_ngn}</p>
              {order.download_url && <a href={order.download_url} target="_blank" className="inline-block mt-2 px-3 py-2 rounded bg-black text-white">Download ZIP</a>}
            </div>
          ) : <p className="text-sm text-gray-500 mt-3">Loading…</p>}
        </aside>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h1 className="text-2xl font-bold">Order Conversation</h1>
          {error && <div className="mt-2 rounded border border-red-200 bg-red-50 text-red-700 p-2 text-sm">{error}</div>}
          <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {(messages?.results || []).map((m) => (
              <div key={m.id} className={`p-3 rounded-lg border ${m.is_admin ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{m.sender_name || (m.is_admin ? "Admin" : "You")}</p>
                  <p className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-sm">{m.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2" />
            <button onClick={sendMessage} className="px-4 py-2 rounded-lg bg-black text-white">Send</button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <button className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
