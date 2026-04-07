"use client";

import AdminShell from "@/components/admin/AdminShell";
import AdminNotificationsPanel from "@/components/admin/AdminNotificationsPanel";

export default function AdminNotificationsPage() {
  return (
    <AdminShell title="Notifications">
      <AdminNotificationsPanel />
    </AdminShell>
  );
}