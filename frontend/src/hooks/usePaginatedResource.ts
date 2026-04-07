"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetResult, PaginatedResponse } from "@/lib/api";

export function usePaginatedResource<T>(
  pathBuilder: (page: number, pageSize: number) => string,
  token: string,
  pageSize = 10
) {
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);

  const path = useMemo(() => pathBuilder(page, pageSize), [page, pageSize, pathBuilder]);

  const fetchResource = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) return;

      setLoading(true);
      setError("");

      const res = await apiGetResult<PaginatedResponse<T>>(path, token, undefined, signal);

      if (!res.ok) {
        if (res.error?.status !== 499) {
          setError(res.error?.detail || "Failed to load");
          setLoading(false);
        }
        return;
      }

      setData(res.data);
      setLoading(false);
    },
    [token, path]
  );

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    fetchResource(controller.signal);

    return () => controller.abort();
  }, [token, fetchResource]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    pageSize,
    reload: () => fetchResource(),
  };
}