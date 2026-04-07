"use client";

import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import UserNotificationsPanel from "@/components/dashboard/UserNotificationsPanel";

export default function DashboardNotificationsPage() {
  return (
    <DashboardShell>
      {({ openSidebar, theme, onToggleTheme, notificationCount, userName }) => (
        <main className="space-y-6">
          <DashboardHeader
            title={`Welcome ${userName}`}
            description="Stay updated with your latest notifications."
            onOpenMobileSidebar={openSidebar}
            theme={theme}
            onToggleTheme={onToggleTheme}
            notificationCount={notificationCount}
            actionSlot={
              <Link
                href="/dashboard"
                className="inline-flex h-12 cursor-pointer items-center border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition duration-300 hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                Back to dashboard
              </Link>
            }
          />

          <UserNotificationsPanel />
        </main>
      )}
    </DashboardShell>
  );
}