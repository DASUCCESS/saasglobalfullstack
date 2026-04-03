"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";

type Order = {
  id: number;
  product_name: string;
  status: string;
  provider: string;
  payment_reference: string;
  download_url: string;
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    apiGet<{ orders: Order[] }>("/dashboard/", token).then((res) => {
      if (!res) return;
      setOrders(res.orders || []);
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <button className="px-4 py-2 rounded border" onClick={() => { clearToken(); window.location.href = "/auth/login"; }}>Logout</button>
        </div>
        <div className="grid gap-4 mt-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">{order.product_name}</p>
              <p className="text-sm text-gray-600">Ref: {order.payment_reference} • {order.provider} • {order.status}</p>
              <div className="mt-3 flex gap-2">
                <a href={`/dashboard/orders/${order.id}`} className="px-3 py-2 rounded border">View details</a>
                {order.download_url ? (
                  <a href={order.download_url} target="_blank" className="px-3 py-2 rounded bg-black text-white">Download ZIP</a>
                ) : (
                  <button className="px-3 py-2 rounded border opacity-50" disabled>Download locked</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
