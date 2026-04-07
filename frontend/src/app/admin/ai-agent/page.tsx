"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SecretInput from "@/components/admin/ui/SecretInput";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

export default function Page() {
  const [form, setForm] = useState({
    groq_api_key: "",
    model_name: "llama-3.1-8b-instant",
    system_prompt: "",
    training_text: "",
    include_products_context: true,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<Record<string, string | boolean>>("/ai/settings/", token).then((res) => {
      if (!res) return;
      setForm({
        groq_api_key: String(res.groq_api_key || ""),
        model_name: String(res.model_name || "llama-3.1-8b-instant"),
        system_prompt: String(res.system_prompt || ""),
        training_text: String(res.training_text || ""),
        include_products_context: Boolean(res.include_products_context),
      });
    });
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost("/ai/settings/update/", form, token);
    if (!res) {
      toast.error("Save failed.");
      return;
    }
    toast.success("AI settings saved.");
  };

  return (
    <AdminShell title="AI Agent">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="Model name" />
        <SecretInput value={form.groq_api_key} onChange={(value) => setForm({ ...form, groq_api_key: value })} placeholder="Groq API key" />
        <textarea className="min-h-24 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.system_prompt} onChange={(e) => setForm({ ...form, system_prompt: e.target.value })} placeholder="System prompt" />
        <textarea className="min-h-48 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.training_text} onChange={(e) => setForm({ ...form, training_text: e.target.value })} placeholder="Training text" />
        <label className="text-sm">
          <input type="checkbox" checked={form.include_products_context} onChange={(e) => setForm({ ...form, include_products_context: e.target.checked })} />
          <span className="ml-2">Include product context</span>
        </label>
        <button onClick={save} className="w-fit cursor-pointer rounded bg-brand-yellow px-4 py-2 text-black">
          Save
        </button>
      </div>
    </AdminShell>
  );
}
