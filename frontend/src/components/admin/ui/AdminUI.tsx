import { ReactNode } from "react";

export function AdminCard({ title, value, subtext }: { title: string; value: ReactNode; subtext?: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {subtext ? <p className="mt-1 text-xs text-neutral-500">{subtext}</p> : null}
    </div>
  );
}

export function AdminPanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AdminEmpty({ text }: { text: string }) {
  return <p className="text-sm text-neutral-400">{text}</p>;
}
