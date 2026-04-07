"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useDashboardTheme, type DashboardTheme } from "@/components/dashboard/useDashboardTheme";
import { apiGetResult } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

type Summary = {
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  failed_orders: number;
  total_unread_admin_messages: number;
  unread_notifications: number;
};

type UserMe = {
  id?: number | string;
  email?: string;
  name?: string;
  is_staff?: boolean;
  profile?: {
    role?: string;
    google_sub?: string;
    avatar_url?: string;
    last_seen_at?: string;
  };
};

type DashboardShellRenderProps = {
  openSidebar: () => void;
  theme: DashboardTheme;
  onToggleTheme: () => void;
  notificationCount: number;
  userName: string;
  userAvatar?: string;
};

type Props = {
  children: (helpers: DashboardShellRenderProps) => React.ReactNode;
};

function resolveUserName(user: UserMe | null): string {
  if (!user) return "User";

  const name = user.name?.trim();
  if (name) return name;

  const email = user.email?.trim();
  if (email) return email.split("@")[0];

  return "User";
}

export default function DashboardShell({ children }: Props) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useDashboardTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("dashboard-sidebar-collapsed")
        : null;
    setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiGetResult<Summary>("/dashboard/summary/", token).then((res) => {
      if (!res.ok || !res.data) return;
      const total =
        Number(res.data.unread_notifications || 0) +
        Number(res.data.total_unread_admin_messages || 0);
      setNotificationCount(total);
    });

    apiGetResult<UserMe>("/auth/me/", token).then((res) => {
      if (!res.ok || !res.data) return;
      setUser(res.data);
    });
  }, [pathname]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-sidebar-collapsed", String(next));
    }
  };

  const handleLogout = () => {
    clearToken();
    window.location.href = "/auth/login";
  };

  const userName = useMemo(() => resolveUserName(user), [user]);
  const userAvatar = user?.profile?.avatar_url || "";

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900 transition-colors dark:bg-[#050b14] dark:text-white">
      <div className="flex min-h-screen">
        <DashboardSidebar
          pathname={pathname}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={toggleTheme}
          notificationCount={notificationCount}
          userName={userName}
          userAvatar={userAvatar}
        />

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1680px] p-4 md:p-6 xl:p-8">
            {children({
              openSidebar: () => setMobileOpen(true),
              theme,
              onToggleTheme: toggleTheme,
              notificationCount,
              userName,
              userAvatar,
            })}
          </div>
        </div>
      </div>
    </main>
  );
}