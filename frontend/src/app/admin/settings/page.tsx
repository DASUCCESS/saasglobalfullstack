"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SecretInput from "@/components/admin/ui/SecretInput";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "@/lib/toast";

type Settings = {
  site?: {
    site_name?: string;
    ai_agent_label?: string;
    ai_agent_url?: string;
    google_client_id?: string;
    google_client_secret?: string;
    google_redirect_uri?: string;
    google_verified_domain?: string;
    admin_access_pin_configured?: boolean;
  };
};

export default function Page() {
  const [form, setForm] = useState({
    site_name: "",
    ai_agent_label: "",
    ai_agent_url: "",
    google_client_id: "",
    google_client_secret: "",
    google_redirect_uri: "",
    google_verified_domain: "",
  });

  const [pinForm, setPinForm] = useState({
    current_pin: "",
    new_pin: "",
    confirm_new_pin: "",
  });

  const [pinConfigured, setPinConfigured] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<Settings>("/settings/admin/", token).then((res) => {
      if (!res?.site) return;
      setForm({
        site_name: res.site.site_name || "",
        ai_agent_label: res.site.ai_agent_label || "",
        ai_agent_url: res.site.ai_agent_url || "",
        google_client_id: res.site.google_client_id || "",
        google_client_secret: res.site.google_client_secret || "",
        google_redirect_uri: res.site.google_redirect_uri || "",
        google_verified_domain: res.site.google_verified_domain || "",
      });
      setPinConfigured(Boolean(res.site.admin_access_pin_configured));
    });
  }, []);

  const saveSettings = async () => {
    const token = getToken();
    if (!token) return;

    const res = await apiPost<Settings>("/settings/admin/update/", { site: form }, token);
    if (!res) {
      toast.error("Save failed.");
      return;
    }
    toast.success("Site settings saved.");
  };

  const savePin = async () => {
    const token = getToken();
    if (!token) return;

    const res = await apiPost<{ status: string; configured: boolean }>(
      "/auth/admin/access-pin/update/",
      pinForm,
      token
    );

    if (!res) {
      toast.error("PIN update failed.");
      return;
    }

    setPinConfigured(true);
    setPinForm({
      current_pin: "",
      new_pin: "",
      confirm_new_pin: "",
    });
    toast.success("Admin page access PIN updated.");
  };

  return (
    <AdminShell title="Site Settings">
      <div className="grid gap-6">
        <div className="max-w-4xl rounded-xl border border-neutral-700 bg-neutral-900 p-5 text-white grid gap-3">
          <h3 className="text-lg font-semibold">General Site Settings</h3>

          <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} placeholder="Site name" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.ai_agent_label} onChange={(e) => setForm({ ...form, ai_agent_label: e.target.value })} placeholder="AI agent label" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.ai_agent_url} onChange={(e) => setForm({ ...form, ai_agent_url: e.target.value })} placeholder="AI agent URL" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.google_client_id} onChange={(e) => setForm({ ...form, google_client_id: e.target.value })} placeholder="Google Client ID" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <SecretInput value={form.google_client_secret} onChange={(value) => setForm({ ...form, google_client_secret: value })} placeholder="Google Client Secret" />
          <input value={form.google_redirect_uri} onChange={(e) => setForm({ ...form, google_redirect_uri: e.target.value })} placeholder="Redirect URI" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />
          <input value={form.google_verified_domain} onChange={(e) => setForm({ ...form, google_verified_domain: e.target.value })} placeholder="Verified Domain" className="border border-neutral-700 rounded-lg bg-neutral-950 px-3 py-2" />

          <button onClick={saveSettings} className="mt-2 w-fit cursor-pointer rounded bg-brand-yellow px-4 py-2 text-black">
            Save settings
          </button>
        </div>

        <div className="max-w-4xl rounded-xl border border-neutral-700 bg-neutral-900 p-5 text-white grid gap-3">
          <h3 className="text-lg font-semibold">Admin Page Access PIN</h3>
          <p className="text-sm text-neutral-400">
            Status: {pinConfigured ? "Configured" : "Not configured"}
          </p>

          {pinConfigured ? (
            <SecretInput
              value={pinForm.current_pin}
              onChange={(value) => setPinForm({ ...pinForm, current_pin: value })}
              placeholder="Current PIN"
            />
          ) : null}

          <SecretInput
            value={pinForm.new_pin}
            onChange={(value) => setPinForm({ ...pinForm, new_pin: value })}
            placeholder="New PIN"
          />
          <SecretInput
            value={pinForm.confirm_new_pin}
            onChange={(value) => setPinForm({ ...pinForm, confirm_new_pin: value })}
            placeholder="Confirm New PIN"
          />

          <button onClick={savePin} className="mt-2 w-fit cursor-pointer rounded bg-brand-yellow px-4 py-2 text-black">
            Save PIN
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
