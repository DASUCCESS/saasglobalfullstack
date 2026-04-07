"use client";

import { MoonIcon, SunIcon } from "@/components/dashboard/icons";
import type { DashboardTheme } from "@/components/dashboard/useDashboardTheme";

type Props = {
  theme: DashboardTheme;
  onToggle: () => void;
  collapsed?: boolean;
  iconOnly?: boolean;
};

export default function DashboardThemeToggle({
  theme,
  onToggle,
  collapsed = false,
  iconOnly = false,
}: Props) {
  if (collapsed || iconOnly) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-300 hover:scale-105 hover:bg-[rgba(244,180,0,0.10)] dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-between border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 shadow-sm transition duration-300 hover:scale-[1.02] hover:border-[rgba(244,180,0,0.50)] hover:bg-[rgba(244,180,0,0.10)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
    >
      <span className="flex items-center gap-3">
        {theme === "dark" ? (
          <SunIcon className="h-5 w-5 text-brand-yellow" />
        ) : (
          <MoonIcon className="h-5 w-5 text-brand-yellow" />
        )}
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
      <span
        className={`relative h-6 w-11 transition ${
          theme === "dark" ? "bg-brand-yellow" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 bg-white shadow transition ${
            theme === "dark" ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}