"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminEmpty, AdminPanel } from "@/components/admin/ui/AdminUI";
import { getToken } from "@/lib/auth";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";

type AdminOrder = {
  id: number;
  product_name: string;
  customer_email: string;
  provider: string;
  amount: string;
  amount_ngn: string;
  status: "pending" | "paid" | "failed";
  payment_reference: string;
  created_at: string;
  unread_user_messages?: number;
};

export default function Page() {
  const token = getToken();
  const [status, setStatus] = useState<"all" | "pending" | "paid" | "failed">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const pathBuilder = useMemo(
    () => (page: number, pageSize: number) =>
      `/admin/orders/?page=${page}&page_size=${pageSize}${status === "all" ? "" : `&status=${status}`}${search ? `&search=${encodeURIComponent(search)}` : ""}&ordering=${ordering}`,
    [status, search, ordering]
  );

  const { data, page, setPage, loading, error } = usePaginatedResource<AdminOrder>(pathBuilder, token, 10);
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10));

  return (
    <AdminShell title="Orders Management">
      <AdminPanel title="Paginated orders">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
              placeholder="Search customer, reference, provider, product"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              onClick={() => {
                setSearch(searchInput.trim());
                setPage(1);
              }}
              className="cursor-pointer rounded-lg border border-neutral-700 px-3 py-2"
            >
              Search
            </button>
          </div>

          <select
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2"
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
          >
            <option value="-created_at">Latest first</option>
            <option value="created_at">Oldest first</option>
            <option value="-amount">Amount high to low</option>
            <option value="amount">Amount low to high</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-neutral-400">
                <th className="py-2">Ref</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Chat</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.results || []).map((order) => (
                <tr key={order.id} className="border-b border-neutral-800">
                  <td className="py-3">{order.payment_reference}</td>
                  <td>{order.customer_email}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span>{order.product_name}</span>
                      <Link href={`/admin/orders/${order.id}`} className="text-xs underline text-brand-yellow">
                        Open
                      </Link>
                    </div>
                  </td>
                  <td>
                    ${order.amount} / ₦{order.amount_ngn}
                  </td>
                  <td className="text-xs uppercase">{order.status}</td>
                  <td>{order.unread_user_messages ? <span className="rounded bg-brand-yellow px-2 py-1 text-xs text-black">{order.unread_user_messages}</span> : "-"}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && !(data?.results || []).length && <AdminEmpty text="No orders found for this filter." />}
          {loading && <p className="mt-4 text-sm text-neutral-400">Loading...</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p>Total: {data?.count || 0}</p>
          <div className="flex items-center gap-2">
            <button className="cursor-pointer rounded border border-neutral-700 px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            <span>
              {page}/{totalPages}
            </span>
            <button className="cursor-pointer rounded border border-neutral-700 px-3 py-1 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
