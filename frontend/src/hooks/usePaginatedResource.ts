"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGetResult, PaginatedResponse } from "@/lib/api";

export function usePaginatedResource<T>(pathBuilder: (page: number, pageSize: number) => string, token: string, pageSize = 10) {
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    if (!token) return;
    requestSeq.current += 1;
    const seq = requestSeq.current;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const res = await apiGetResult<PaginatedResponse<T>>(pathBuilder(page, pageSize), token, undefined, controller.signal);
    if (seq !== requestSeq.current) return;
    if (!res.ok) {
      setError(res.error?.detail || "Failed to load");
      setLoading(false);
      return;
    }
    setData(res.data);
    setLoading(false);
    return () => controller.abort();
  }, [token, page, pageSize, pathBuilder]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    pageSize,
    reload: load,
  };
}
