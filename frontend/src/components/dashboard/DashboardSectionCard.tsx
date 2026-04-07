"use client";

type Props = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardSectionCard({
  title,
  action,
  children,
  className = "",
}: Props) {
  return (
    <section
      className={`rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1424]/90 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}