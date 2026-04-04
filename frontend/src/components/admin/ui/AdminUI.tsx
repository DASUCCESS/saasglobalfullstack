import { ReactNode } from "react";

export function AdminCard({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AdminEmpty({ text }: { text: string }) {
  return <p className="text-sm text-neutral-400">{text}</p>;
}
