"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SecretInput from "@/components/admin/ui/SecretInput";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

export default function Page() {
  const [form, setForm] = useState({ cloud_name: "", api_key: "", api_secret: "", folder: "products" });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<{ cloudinary?: Record<string, string> }>("/settings/admin/", token).then((res) => {
      setForm({
        cloud_name: String(res?.cloudinary?.cloud_name || ""),
        api_key: String(res?.cloudinary?.api_key || ""),
        api_secret: String(res?.cloudinary?.api_secret || ""),
        folder: String(res?.cloudinary?.folder || "products"),
      });
    });
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost("/settings/admin/update/", { cloudinary: form }, token);
    if (!res) {
      toast.error("Save failed.");
      return;
    }
    toast.success("Cloudinary settings saved.");
  };

  return (
    <AdminShell title="Cloudinary">
      <div className="max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.cloud_name} onChange={(e) => setForm({ ...form, cloud_name: e.target.value })} placeholder="Cloud name" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder="API key" />
        <SecretInput value={form.api_secret} onChange={(value) => setForm({ ...form, api_secret: value })} placeholder="API secret" />
        <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={form.folder} onChange={(e) => setForm({ ...form, folder: e.target.value })} placeholder="Folder" />
        <button onClick={save} className="w-fit cursor-pointer rounded bg-brand-yellow px-4 py-2 text-black">
          Save
        </button>
      </div>
    </AdminShell>
  );
}
