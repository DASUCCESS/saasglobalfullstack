"use client";

import { useEffect, useState } from "react";

export type DashboardTheme = "light" | "dark";

const STORAGE_KEY = "dashboard-theme";

export function useDashboardTheme() {
  const [theme, setTheme] = useState<DashboardTheme>("light");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const systemDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme: DashboardTheme =
      saved === "dark" || saved === "light" ? saved : systemDark ? "dark" : "light";

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const setDashboardTheme = (next: DashboardTheme) => {
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const toggleTheme = () => {
    setDashboardTheme(theme === "dark" ? "light" : "dark");
  };

  return {
    theme,
    setTheme: setDashboardTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
}