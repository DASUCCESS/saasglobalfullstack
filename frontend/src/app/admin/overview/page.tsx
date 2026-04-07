"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { AdminCard, AdminEmpty, AdminPanel } from "@/components/admin/ui/AdminUI";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";

type AdminSummary = {
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  failed_orders: number;
  unread_notifications: number;
};

type AdminOrder = {
  id: number;
  status: "pending" | "paid" | "failed";
  amount: string;
  customer_email: string;
  product_name: string;
  created_at: string;
};

export default function Page() {
  const [productCount, setProductCount] = useState(0);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [recent, setRecent] = useState<AdminOrder[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    Promise.all([
      apiGet<{ count: number }>("/products/?page=1&page_size=1", token),
      apiGet<AdminSummary>("/admin/orders/summary/", token),
      apiGet<{ results: AdminOrder[] }>("/admin/orders/?page=1&page_size=8", token),
    ]).then(([productsRes, summaryRes, ordersRes]) => {
      setProductCount(productsRes?.count || 0);
      setSummary(summaryRes || null);
      setRecent(ordersRes?.results || []);
    });
  }, []);

  return (
    <AdminShell title="Admin Overview">
      <div className="grid gap-6">
        <div className="flex justify-end">
          <NotificationBell admin />
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminCard title="Products" value={productCount} />
          <AdminCard title="Orders" value={summary?.total_orders || 0} />
          <AdminCard title="Paid Orders" value={summary?.paid_orders || 0} />
          <AdminCard title="Pending Orders" value={summary?.pending_orders || 0} />
          <AdminCard title="Unread Alerts" value={summary?.unread_notifications || 0} />
        </section>

        <AdminPanel title="Recent Orders">
          <div className="space-y-2">
            {recent.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{order.product_name}</p>
                  <p className="text-xs text-neutral-400">{order.customer_email}</p>
                </div>
                <p className="text-xs uppercase">
                  {order.status} • ${order.amount}
                </p>
              </div>
            ))}
            {!recent.length && <AdminEmpty text="No recent orders yet." />}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
