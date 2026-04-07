"use client";

type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "yellow" | "green" | "blue" | "red" | "slate";
};

const accentStyles: Record<NonNullable<Props["accent"]>, string> = {
  yellow:
    "border-[rgba(244,180,0,0.30)] bg-[rgba(244,180,0,0.10)] text-slate-900 dark:bg-[rgba(244,180,0,0.10)] dark:text-white",
  green:
    "border-green-200 bg-green-50 text-slate-900 dark:border-green-500/20 dark:bg-green-500/10 dark:text-white",
  blue:
    "border-blue-200 bg-blue-50 text-slate-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-white",
  red:
    "border-red-200 bg-red-50 text-slate-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-white",
  slate:
    "border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white",
};

export default function DashboardStatCard({
  title,
  value,
  icon,
  accent = "slate",
}: Props) {
  return (
    <div
      className={`rounded-3xl border p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:scale-[1.02] ${accentStyles[accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-white/10">
          {icon}
        </div>
      </div>
    </div>
  );
}