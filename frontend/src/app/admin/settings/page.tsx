"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Settings = {
  site?: {
    google_client_id?: string;
    google_client_secret?: string;
    google_redirect_uri?: string;
    google_verified_domain?: string;
  };
};

export default function Page() {
  const [form, setForm] = useState({
    google_client_id: "",
    google_client_secret: "",
    google_redirect_uri: "",
    google_verified_domain: "",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<Settings>("/settings/admin/", token).then((res) => {
      if (!res?.site) return;
      setForm({
        google_client_id: res.site.google_client_id || "",
        google_client_secret: res.site.google_client_secret || "",
        google_redirect_uri: res.site.google_redirect_uri || "",
        google_verified_domain: res.site.google_verified_domain || "",
      });
    });
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost<Settings>("/settings/admin/update/", { site: form }, token);
    if (!res) return alert("Save failed");
    alert("Google OAuth settings saved");
  };

  return (
    <AdminShell title="Settings Page">
      <div className="max-w-3xl rounded-xl border border-neutral-700 bg-neutral-900 p-5 text-white">
        <h3 className="text-lg font-semibold">Google OAuth Credentials / Verification</h3>
        <div className="grid gap-3 mt-3">
          <input value={form.google_client_id} onChange={(e) => setForm({ ...form, google_client_id: e.target.value })} placeholder="Google Client ID" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.google_client_secret} onChange={(e) => setForm({ ...form, google_client_secret: e.target.value })} placeholder="Google Client Secret" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.google_redirect_uri} onChange={(e) => setForm({ ...form, google_redirect_uri: e.target.value })} placeholder="Redirect URI" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.google_verified_domain} onChange={(e) => setForm({ ...form, google_verified_domain: e.target.value })} placeholder="Verified Domain" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
        </div>
        <button onClick={save} className="mt-4 px-4 py-2 rounded bg-brand-yellow text-black">Save settings</button>
      </div>
    </AdminShell>
  );
}
