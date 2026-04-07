"use client";

import Link from "next/link";
import DashboardThemeToggle from "@/components/dashboard/DashboardThemeToggle";
import { BellIcon, MenuIcon, SearchIcon } from "@/components/dashboard/icons";
import type { DashboardTheme } from "@/components/dashboard/useDashboardTheme";

type Props = {
  title: string;
  description?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  onOpenMobileSidebar: () => void;
  actionSlot?: React.ReactNode;
  theme: DashboardTheme;
  onToggleTheme: () => void;
  notificationCount?: number;
};

export default function DashboardHeader({
  title,
  description,
  searchValue = "",
  onSearchValueChange,
  onOpenMobileSidebar,
  actionSlot,
  theme,
  onToggleTheme,
  notificationCount = 0,
}: Props) {
  return (
    <header className="border border-slate-200/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1424]/90">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="mt-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-105 hover:border-[rgba(244,180,0,0.50)] hover:bg-[rgba(244,180,0,0.10)] lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {onSearchValueChange ? (
            <div className="relative min-w-[240px] md:min-w-[320px]">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(e) => onSearchValueChange(e.target.value)}
                placeholder="Search here..."
                className="h-12 w-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-yellow focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
          ) : null}

          {actionSlot}

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <DashboardThemeToggle theme={theme} onToggle={onToggleTheme} iconOnly />
            </div>

            <Link
              href="/dashboard/notifications"
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-105 hover:bg-[rgba(244,180,0,0.10)] dark:border-white/10 dark:bg-white/5 dark:text-white"
              title="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {notificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-brand-yellow px-1.5 py-0.5 text-center text-[10px] font-bold text-slate-900">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}