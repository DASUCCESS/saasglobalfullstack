"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { getToken } from "@/lib/auth";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";
import { AdminEmpty, AdminPanel } from "@/components/admin/ui/AdminUI";

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
};

export default function Page() {
  const token = getToken();
  const [status, setStatus] = useState<"all" | "pending" | "paid" | "failed">("all");

  const pathBuilder = useMemo(
    () => (page: number, pageSize: number) => `/admin/orders/?page=${page}&page_size=${pageSize}${status === "all" ? "" : `&status=${status}`}`,
    [status]
  );

  const { data, page, setPage, loading } = usePaginatedResource<AdminOrder>(pathBuilder, token, 10);
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10));

  return (
    <AdminShell title="Orders Management">
      <AdminPanel title="Paginated orders">
        <div className="flex items-center justify-between gap-3">
          <select className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}>
            <option value="all">All</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-neutral-400 border-b border-neutral-800"><th className="py-2">Ref</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {(data?.results || []).map((order) => (
                <tr key={order.id} className="border-b border-neutral-800">
                  <td className="py-3">{order.payment_reference}</td><td>{order.customer_email}</td><td>{order.product_name}</td>
                  <td>${order.amount} / ₦{order.amount_ngn}</td><td className="uppercase text-xs">{order.status}</td><td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !(data?.results || []).length && <AdminEmpty text="No orders found for this filter." />}
          {loading && <p className="text-sm text-neutral-400 mt-4">Loading...</p>}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p>Total: {data?.count || 0}</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-neutral-700 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>{page}/{totalPages}</span>
            <button className="px-3 py-1 rounded border border-neutral-700 disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
