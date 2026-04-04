"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiGet, PaginatedResponse } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { AdminCard, AdminEmpty, AdminPanel } from "@/components/admin/ui/AdminUI";

type AdminOrder = { id: number; status: "pending" | "paid" | "failed"; amount: string; customer_email: string; product_name: string; created_at: string };

export default function Page() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [recent, setRecent] = useState<AdminOrder[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    Promise.all([
      apiGet<PaginatedResponse<{ slug: string }>>("/products/?page=1&page_size=1", token),
      apiGet<PaginatedResponse<AdminOrder>>("/admin/orders/?page=1&page_size=8", token),
    ]).then(([productsRes, ordersRes]) => {
      setProductCount(productsRes?.count || 0);
      const all = ordersRes?.results || [];
      setOrderCount(ordersRes?.count || 0);
      setPaidCount(all.filter((o) => o.status === "paid").length);
      setRecent(all);
    });
  }, []);

  return (
    <AdminShell title="Admin Overview">
      <div className="grid gap-6">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminCard title="Products" value={productCount} />
          <AdminCard title="Orders" value={orderCount} />
          <AdminCard title="Paid (recent page)" value={paidCount} />
        </section>

        <AdminPanel title="Recent Orders">
          <div className="space-y-2">
            {recent.map((order) => (
              <div key={order.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-medium">{order.product_name}</p>
                  <p className="text-xs text-neutral-400">{order.customer_email}</p>
                </div>
                <p className="text-xs uppercase">{order.status} • ${order.amount}</p>
              </div>
            ))}
            {!recent.length && <AdminEmpty text="No recent orders yet." />}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
