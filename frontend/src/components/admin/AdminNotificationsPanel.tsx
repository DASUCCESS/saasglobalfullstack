"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { apiPostResult } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  link: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

function getMetadataOrderId(metadata: Record<string, unknown> | undefined): number | null {
  if (!metadata) return null;

  const direct = metadata.order_id;
  if (typeof direct === "number") return direct;
  if (typeof direct === "string" && direct.trim() && !Number.isNaN(Number(direct))) {
    return Number(direct);
  }

  const nestedOrder = metadata.order;
  if (nestedOrder && typeof nestedOrder === "object" && "id" in nestedOrder) {
    const nestedId = (nestedOrder as { id?: unknown }).id;
    if (typeof nestedId === "number") return nestedId;
    if (typeof nestedId === "string" && nestedId.trim() && !Number.isNaN(Number(nestedId))) {
      return Number(nestedId);
    }
  }

  return null;
}

function getOrderIdFromLink(link: string): number | null {
  if (!link) return null;

  const patterns = [
    /\/dashboard\/orders\/(\d+)/i,
    /\/admin\/orders\/(\d+)/i,
    /\/orders\/(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match?.[1]) {
      const id = Number(match[1]);
      if (!Number.isNaN(id)) return id;
    }
  }

  return null;
}

function resolveAdminNotificationHref(item: NotificationItem): string | null {
  const metadataOrderId = getMetadataOrderId(item.metadata);
  const linkOrderId = getOrderIdFromLink(item.link || "");
  const orderId = metadataOrderId ?? linkOrderId;

  if (orderId) return `/admin/orders/${orderId}`;
  if (item.link) return item.link;
  return null;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function AdminNotificationsPanel() {
  const token = getToken();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const basePath = "/admin/notifications/";
  const markReadPath = "/admin/notifications/mark-read/";

  const pathBuilder = useMemo(
    () => (page: number, pageSize: number) =>
      `${basePath}?page=${page}&page_size=${pageSize}${unreadOnly ? "&unread=1" : ""}`,
    [basePath, unreadOnly]
  );

  const { data, loading, error, page, setPage, reload } =
    usePaginatedResource<NotificationItem>(pathBuilder, token, 10);

  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10));

  const markAllRead = async () => {
    const res = await apiPostResult(markReadPath, { mark_all: true }, token);
    if (res.ok) reload();
  };

  const markOneRead = async (id: number) => {
    setBusyId(id);
    const res = await apiPostResult(markReadPath, { notification_ids: [id] }, token);
    setBusyId(null);
    if (res.ok) reload();
  };

  const handleOpen = async (id: number, isRead: boolean) => {
    if (isRead) return;
    await markOneRead(id);
  };

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Admin Notifications</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Review admin alerts, order activity, and user support events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked);
                setPage(1);
              }}
              className="accent-[rgb(244,180,0)]"
            />
            Unread only
          </label>

          <button
            onClick={markAllRead}
            className="cursor-pointer rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 transition hover:bg-neutral-800"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading && <p className="text-sm text-neutral-400">Loading notifications...</p>}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !(data?.results || []).length && (
          <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
            No notifications found.
          </div>
        )}

        {(data?.results || []).map((item) => {
          const resolvedHref = resolveAdminNotificationHref(item);

          return (
            <article
              key={item.id}
              className={`rounded-xl border p-4 ${
                item.is_read
                  ? "border-neutral-800 bg-neutral-900"
                  : "border-brand-yellow/40 bg-neutral-950"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    {!item.is_read && (
                      <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-semibold text-black">
                        New
                      </span>
                    )}
                  </div>

                  {item.body ? (
                    <p className="mt-1 text-sm text-neutral-300">{item.body}</p>
                  ) : null}

                  <p className="mt-2 text-xs text-neutral-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  {resolvedHref ? (
                    isExternalHref(resolvedHref) ? (
                      <a
                        href={resolvedHref}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleOpen(item.id, item.is_read)}
                        className="mt-3 inline-flex cursor-pointer text-sm font-medium text-brand-yellow underline"
                      >
                        Open
                      </a>
                    ) : (
                      <Link
                        href={resolvedHref}
                        onClick={() => handleOpen(item.id, item.is_read)}
                        className="mt-3 inline-flex cursor-pointer text-sm font-medium text-brand-yellow underline"
                      >
                        Open
                      </Link>
                    )
                  ) : null}
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => markOneRead(item.id)}
                    disabled={busyId === item.id}
                    className="cursor-pointer rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {busyId === item.id ? "Marking..." : "Mark read"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            className="cursor-pointer rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}