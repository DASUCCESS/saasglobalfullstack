"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function Page() {
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiGet<{ contact?: { whatsapp_number?: string } }>("/settings/admin/", token).then((res) => setWhatsapp(res?.contact?.whatsapp_number || ""));
  }, []);

  const save = async () => {
    const token = getToken();
    if (!token) return;
    const res = await apiPost("/settings/admin/update/", { contact: { whatsapp_number: whatsapp } }, token);
    if (!res) return alert("Save failed");
    alert("WhatsApp number saved");
  };

  return <AdminShell title="WhatsApp"><div className="max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 grid gap-3">
    <input className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Support WhatsApp number" />
    <button onClick={save} className="w-fit px-4 py-2 rounded bg-brand-yellow text-black">Save</button>
  </div></AdminShell>;
}
