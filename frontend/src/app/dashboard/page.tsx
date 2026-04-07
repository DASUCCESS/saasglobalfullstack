"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiGetResult, PaginatedResponse } from "@/lib/api";
import { getToken } from "@/lib/auth";

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
  unread_admin_messages: number;
};

type Summary = {
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  failed_orders: number;
  total_unread_admin_messages: number;
  unread_notifications: number;
};

const PAGE_SIZE = 10;

function statusPill(status: Order["status"]) {
  if (status === "paid") return "border-green-200 bg-green-100 text-green-800";
  if (status === "pending") return "border-yellow-200 bg-yellow-100 text-yellow-900";
  return "border-red-200 bg-red-100 text-red-800";
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
  const [summary, setSummary] = useState<Summary | null>(null);
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
      if (!res.ok) {
        setError(res.error?.detail || "Failed to load orders.");
        return;
      }
      setError("");
      setPayload(res.data);
    });
  }, [token, page, status, search, ordering]);

  useEffect(() => {
    if (!token) return;
    apiGetResult<Summary>("/dashboard/summary/", token).then((res) => {
      if (res.ok && res.data) {
        setSummary(res.data);
      }
    });
  }, [token]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const stats = useMemo(() => {
    const rows = payload?.results || [];
    return {
      totalAcrossPages: summary?.total_orders ?? payload?.count ?? 0,
      paid: summary?.paid_orders ?? rows.filter((o) => o.status === "paid").length,
      pending: summary?.pending_orders ?? rows.filter((o) => o.status === "pending").length,
      failed: summary?.failed_orders ?? rows.filter((o) => o.status === "failed").length,
      unreadMessages:
        summary?.total_unread_admin_messages ??
        rows.reduce((sum, order) => sum + Number(order.unread_admin_messages || 0), 0),
      unreadNotifications: summary?.unread_notifications ?? 0,
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
    <DashboardShell>
      {({ openSidebar, theme, onToggleTheme, notificationCount, userName }) => (
        <main className="space-y-6">
          <DashboardHeader
            title={`Welcome ${userName}`}
            description="Track your purchases, payment status, and support messages."
            searchValue={searchInput}
            onSearchValueChange={setSearchInput}
            onOpenMobileSidebar={openSidebar}
            theme={theme}
            onToggleTheme={onToggleTheme}
            notificationCount={notificationCount}
            actionSlot={
              <button
                onClick={() => applyQuery({ search: searchInput || null, page: "1" })}
                className="h-12 cursor-pointer border border-slate-200 bg-brand-yellow px-5 text-sm font-semibold text-slate-900 shadow-lg transition duration-300 hover:scale-105"
              >
                Search
              </button>
            }
          />

          <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs text-slate-500">Total Orders</p>
              <p className="text-lg font-bold">{stats.totalAcrossPages}</p>
            </div>
            <div className="border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
              <p className="text-xs text-green-700 dark:text-green-300">Paid</p>
              <p className="text-lg font-bold">{stats.paid}</p>
            </div>
            <div className="border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/20 dark:bg-yellow-500/10">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">Pending</p>
              <p className="text-lg font-bold">{stats.pending}</p>
            </div>
            <div className="border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
              <p className="text-xs text-red-700 dark:text-red-300">Failed</p>
              <p className="text-lg font-bold">{stats.failed}</p>
            </div>
            <div className="border border-[rgba(244,180,0,0.40)] bg-[rgba(244,180,0,0.10)] p-4">
              <p className="text-xs text-slate-700 dark:text-slate-300">Unread Alerts</p>
              <p className="text-lg font-bold">{stats.unreadNotifications + stats.unreadMessages}</p>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1424]/90">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
              <div className="flex gap-2">
                <input
                  className="w-full border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                  placeholder="Search product, reference, or provider"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  onClick={() => applyQuery({ search: searchInput || null, page: "1" })}
                  className="cursor-pointer border border-slate-200 bg-brand-yellow px-4 py-2 font-medium text-slate-900"
                >
                  Search
                </button>
              </div>

              <select
                className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                value={status}
                onChange={(e) => applyQuery({ status: e.target.value, page: "1" })}
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                value={ordering}
                onChange={(e) => applyQuery({ ordering: e.target.value, page: "1" })}
              >
                <option value="-created_at">Latest first</option>
                <option value="created_at">Oldest first</option>
                <option value="-amount">Amount high to low</option>
                <option value="amount">Amount low to high</option>
              </select>

              <button
                className="cursor-pointer border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
                onClick={() => applyQuery({ status: null, search: null, ordering: "-created_at", page: "1" })}
              >
                Reset
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              {error ? (
                <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              {(payload?.results || []).map((order) => (
                <article key={order.id} className="border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{order.product_name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        /{order.product_slug} • Ref: {order.payment_reference}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`border px-2.5 py-1 text-xs ${statusPill(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      {order.unread_admin_messages > 0 ? (
                        <span className="bg-brand-yellow px-2 py-1 text-xs text-slate-900">
                          {order.unread_admin_messages} unread
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="cursor-pointer border border-slate-200 px-3 py-2 dark:border-white/10"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              ))}

              {!(payload?.results || []).length ? (
                <div className="border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-white/10 dark:text-slate-400">
                  No orders on this page.
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="cursor-pointer border border-slate-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10"
                  disabled={page <= 1}
                  onClick={() => applyQuery({ page: String(page - 1) })}
                >
                  Previous
                </button>
                <button
                  className="cursor-pointer border border-slate-200 bg-brand-yellow px-3 py-1.5 text-slate-900 disabled:opacity-50 dark:border-white/10"
                  disabled={page >= totalPages}
                  onClick={() => applyQuery({ page: String(page + 1) })}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      )}
    </DashboardShell>
  );
}