"use client";

import Link from "next/link";
import { useMemo } from "react";
import DashboardThemeToggle from "@/components/dashboard/DashboardThemeToggle";
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  OrdersIcon,
} from "@/components/dashboard/icons";
import type { DashboardTheme } from "@/components/dashboard/useDashboardTheme";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  count?: number;
};

type Props = {
  pathname: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onLogout: () => void;
  theme: DashboardTheme;
  onToggleTheme: () => void;
  notificationCount?: number;
  userName: string;
  userAvatar?: string;
};

export default function DashboardSidebar({
  pathname,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapsed,
  onLogout,
  theme,
  onToggleTheme,
  notificationCount = 0,
  userName,
  userAvatar,
}: Props) {
  const items = useMemo<NavItem[]>(
    () => [
      { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/dashboard/orders", label: "My Orders", icon: OrdersIcon },
      { href: "/dashboard/notifications", label: "Notifications", icon: BellIcon, count: notificationCount },
    ],
    [notificationCount]
  );

  const content = (
    <div
      className={`flex h-full flex-col border-r border-slate-200/70 bg-white/95 px-3 py-4 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#09111f]/95 ${
        collapsed ? "w-[92px]" : "w-[300px]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-3">

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">SAAS GLOBAL HUB</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard"  
            title="Dashboard"
          >
          </Link>
        )}

        <div className="hidden lg:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-10 w-10 cursor-pointer items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-105 hover:border-[rgba(244,180,0,0.50)] hover:bg-[rgba(244,180,0,0.10)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          className="flex h-10 w-10 cursor-pointer items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className={`mb-5 border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 px-4 py-5 shadow-lg dark:border-white/10 dark:from-[#0e1728] dark:to-[#0a1220] ${
          collapsed ? "px-2 py-3" : ""
        }`}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-14 w-14 overflow-hidden border border-slate-200 bg-slate-100 shadow-md dark:border-white/10 dark:bg-white/5">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-300">
                  {userName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 overflow-hidden border-2 border-brand-yellow bg-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:bg-white/5">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-300">
                  {userName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <p className="mt-4 w-full truncate text-base font-bold text-slate-900 dark:text-white">
              {userName}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Customer Account
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center ${
                collapsed ? "justify-center" : "justify-between gap-3"
              } px-3 py-3 text-sm font-medium transition duration-300 hover:scale-[1.02] ${
                active
                  ? "bg-brand-yellow text-slate-900 shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </div>

              {!collapsed && item.count && item.count > 0 ? (
                <span className="min-w-[22px] rounded-full bg-brand-yellow px-2 py-0.5 text-center text-[10px] font-bold text-slate-900">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              ) : null}

              {collapsed ? (
                <>
                  {item.count && item.count > 0 ? (
                    <span className="absolute right-2 top-2 min-w-[18px] rounded-full bg-brand-yellow px-1 py-0.5 text-center text-[9px] font-bold text-slate-900">
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                  ) : null}
                  <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                    {item.label}
                  </span>
                </>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3">
        <DashboardThemeToggle theme={theme} onToggle={onToggleTheme} collapsed={collapsed} />

        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full cursor-pointer items-center ${
            collapsed ? "justify-center" : "gap-3"
          } border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700 shadow-sm transition duration-300 hover:scale-[1.02] hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300`}
        >
          <LogoutIcon className="h-5 w-5" />
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">{content}</aside>

      <div
        className={`fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm transition lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      >
        <div
          className={`h-full w-[300px] transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    </>
  );
}