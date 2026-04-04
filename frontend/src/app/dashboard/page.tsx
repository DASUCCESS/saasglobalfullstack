"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiGetResult, PaginatedResponse } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";

type Order = {
  id: number;
  product_name: string;
  product_slug: string;
  status: "pending" | "paid" | "failed";
  provider: string;
  payment_reference: string;
  amount: string;
  amount_ngn: string;
  created_at: string;
  paid_at?: string | null;
  download_url: string;
  download_details?: { version?: string; file_size?: string; checksum?: string; changelog?: string; released_at?: string };
  unread_admin_messages: number;
};

const PAGE_SIZE = 10;

function statusPill(status: Order["status"]) {
  if (status === "paid") return "bg-green-100 text-green-800 border-green-200";
  if (status === "pending") return "bg-yellow-100 text-yellow-900 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = getToken();

  const page = Number(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const ordering = searchParams.get("ordering") || "-created_at";

  const [payload, setPayload] = useState<PaginatedResponse<Order> | null>(null);
  const [summary, setSummary] = useState<{ total_orders: number; paid_orders: number; pending_orders: number; failed_orders: number; total_unread_admin_messages: number } | null>(null);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("page_size", String(PAGE_SIZE));
    if (status !== "all") query.set("status", status);
    if (search) query.set("search", search);
    if (ordering) query.set("ordering", ordering);

    apiGetResult<PaginatedResponse<Order>>(`/dashboard/?${query.toString()}`, token).then((res) => {
      if (!res.ok) return setError(res.error?.detail || "Failed to load orders");
      setError("");
      setPayload(res.data);
    });
  }, [token, page, status, search, ordering]);

  useEffect(() => {
    if (!token) return;
    apiGetResult<{ total_orders: number; paid_orders: number; pending_orders: number; failed_orders: number; total_unread_admin_messages: number }>("/dashboard/summary/", token).then((res) => {
      if (res.ok) setSummary(res.data);
    });
  }, [token]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const stats = useMemo(() => {
    const rows = payload?.results || [];
    const paid = rows.filter((o) => o.status === "paid");
    return {
      totalVisible: rows.length,
      totalAcrossPages: summary?.total_orders ?? payload?.count ?? 0,
      paid: summary?.paid_orders ?? paid.length,
      pending: summary?.pending_orders ?? rows.filter((o) => o.status === "pending").length,
      failed: summary?.failed_orders ?? rows.filter((o) => o.status === "failed").length,
      unread: summary?.total_unread_admin_messages ?? rows.reduce((sum, order) => sum + Number(order.unread_admin_messages || 0), 0),
    };
  }, [payload, summary]);

  const applyQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === "all") params.delete(k);
      else params.set(k, v);
    });
    if (!params.get("page")) params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.max(1, Math.ceil((payload?.count || 0) / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">User dashboard</p>
              <h1 className="text-2xl md:text-3xl font-bold">Orders & Payment History</h1>
              <p className="text-sm text-gray-600 mt-1">Server-synced filtering, sorting and pagination.</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => { clearToken(); window.location.href = "/auth/login"; }}>Logout</button>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3"><p className="text-xs text-gray-500">Total (all pages)</p><p className="font-bold text-lg">{stats.totalAcrossPages}</p></div>
            <div className="rounded-xl bg-green-50 border border-green-200 p-3"><p className="text-xs text-green-700">Paid (this page)</p><p className="font-bold text-lg">{stats.paid}</p></div>
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3"><p className="text-xs text-yellow-800">Pending</p><p className="font-bold text-lg">{stats.pending}</p></div>
            <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-xs text-red-700">Failed</p><p className="font-bold text-lg">{stats.failed}</p></div>
            <div className="rounded-xl bg-brand-yellow/20 border border-brand-yellow/40 p-3"><p className="text-xs text-gray-700">Unread admin replies</p><p className="font-bold text-lg">{stats.unread}</p></div>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm space-y-4">
          <div className="grid md:grid-cols-[1fr_auto_auto_auto] gap-3">
            <div className="flex gap-2">
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Search product/reference/provider" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <button onClick={() => applyQuery({ search: searchInput || null, page: "1" })} className="px-3 py-2 rounded border border-gray-300">Search</button>
            </div>
            <select className="rounded-lg border border-gray-300 px-3 py-2" value={status} onChange={(e) => applyQuery({ status: e.target.value, page: "1" })}>
              <option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option>
            </select>
            <select className="rounded-lg border border-gray-300 px-3 py-2" value={ordering} onChange={(e) => applyQuery({ ordering: e.target.value, page: "1" })}>
              <option value="-created_at">Latest first</option><option value="created_at">Oldest first</option><option value="-amount">Amount high → low</option><option value="amount">Amount low → high</option>
            </select>
            <button className="rounded-lg border border-gray-300 px-3 py-2" onClick={() => applyQuery({ status: null, search: null, ordering: "-created_at", page: "1" })}>Reset</button>
          </div>

          <div className="grid gap-4">
            {error && <div className="rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
            {(payload?.results || []).map((order) => (
              <article key={order.id} className="rounded-xl border border-gray-200 p-4 md:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lg">{order.product_name}</p>
                    <p className="text-xs text-gray-500 mt-1">/{order.product_slug} • Ref: {order.payment_reference}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${statusPill(order.status)}`}>{order.status.toUpperCase()}</span>
                    {order.unread_admin_messages > 0 && <span className="text-xs px-2 py-1 rounded-full bg-brand-yellow">{order.unread_admin_messages} unread</span>}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/dashboard/orders/${order.id}`} className="px-3 py-2 rounded border border-gray-300">View details</Link>
                  {order.download_url ? <a href={order.download_url} target="_blank" className="px-3 py-2 rounded bg-black text-white">Download ZIP</a> : <button disabled className="px-3 py-2 rounded border border-gray-300 opacity-50">Download locked</button>}
                </div>
              </article>
            ))}
            {!(payload?.results || []).length && <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">No orders on this page.</div>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50" disabled={page <= 1} onClick={() => applyQuery({ page: String(page - 1) })}>Previous</button>
              <button className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50" disabled={page >= totalPages} onClick={() => applyQuery({ page: String(page + 1) })}>Next</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
