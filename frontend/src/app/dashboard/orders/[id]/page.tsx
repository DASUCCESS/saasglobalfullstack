"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Message = { id: number; message: string; is_admin: boolean; sender_name: string; created_at: string };

export default function OrderConversationPage() {
  const params = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const token = getToken();

  useEffect(() => {
    if (!params?.id || !token) return;
    apiGet<{ messages: Message[] }>(`/dashboard/orders/${params.id}/messages/`, token).then((res) => setMessages(res?.messages || []));
  }, [params?.id, token]);

  const sendMessage = async () => {
    if (!params?.id || !token || !text.trim()) return;
    const res = await apiPost<Message>(`/dashboard/orders/${params.id}/messages/`, { message: text }, token);
    if (!res) return;
    setMessages((prev) => [...prev, res]);
    setText("");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto rounded-xl border bg-white p-5">
        <h1 className="text-2xl font-bold">Order Conversation</h1>
        <div className="mt-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`p-3 rounded-lg ${m.is_admin ? "bg-yellow-50" : "bg-gray-50"}`}>
              <p className="text-sm font-medium">{m.sender_name || (m.is_admin ? "Admin" : "You")}</p>
              <p>{m.message}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="flex-1 border rounded-lg px-3 py-2" />
          <button onClick={sendMessage} className="px-4 py-2 rounded bg-black text-white">Send</button>
        </div>
      </div>
    </main>
  );
}
