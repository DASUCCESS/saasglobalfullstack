"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGetResult } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Props = {
  admin?: boolean;
};

export default function NotificationBell({ admin = false }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const path = admin ? "/admin/notifications/count/" : "/notifications/count/";

    const load = () => {
      apiGetResult<{ unread: number }>(path, token).then((res) => {
        if (res.ok && res.data) {
          setCount(res.data.unread || 0);
        }
      });
    };

    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [admin]);

  const href = admin ? "/admin/notifications" : "/dashboard/notifications";

  return (
    <Link href={href} className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
      Notifications
      {count > 0 && (
        <span className="ml-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}
