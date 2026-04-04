const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiError = {
  status: number;
  detail: string;
};

export type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function defaultCacheForPath(path: string): RequestCache {
  if (path.startsWith("/products-page/") || path.startsWith("/settings/public/") || path.startsWith("/products/") && path.includes("?")) {
    return "force-cache";
  }
  return "no-store";
}

async function apiRequestDetailed<T>(
  path: string,
  options?: { method?: HttpMethod; payload?: unknown; token?: string; cache?: RequestCache; signal?: AbortSignal }
): Promise<ApiResult<T>> {
  const method = options?.method || "GET";
  const payload = options?.payload;
  const token = options?.token;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      cache: options?.cache || defaultCacheForPath(path),
      signal: options?.signal,
      headers: {
        ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        data: null,
        error: { status: response.status, detail: body?.detail || "Request failed" },
      };
    }
    return { ok: true, data: body as T, error: null };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return { ok: false, data: null, error: { status: 499, detail: "Request aborted" } };
    }
    return { ok: false, data: null, error: { status: 0, detail: "Network error" } };
  }
}

async function apiRequest<T>(path: string, options?: { method?: HttpMethod; payload?: unknown; token?: string; cache?: RequestCache; signal?: AbortSignal }): Promise<T | null> {
  const res = await apiRequestDetailed<T>(path, options);
  return res.data;
}

export async function apiGet<T>(path: string, token?: string, cache?: RequestCache, signal?: AbortSignal): Promise<T | null> {
  return apiRequest<T>(path, { method: "GET", token, cache, signal });
}
export async function apiGetResult<T>(path: string, token?: string, cache?: RequestCache, signal?: AbortSignal): Promise<ApiResult<T>> {
  return apiRequestDetailed<T>(path, { method: "GET", token, cache, signal });
}

export async function apiPost<T>(path: string, payload: unknown, token?: string): Promise<T | null> {
  return apiRequest<T>(path, { method: "POST", payload, token });
}
export async function apiPostResult<T>(path: string, payload: unknown, token?: string): Promise<ApiResult<T>> {
  return apiRequestDetailed<T>(path, { method: "POST", payload, token });
}

export async function apiPatch<T>(path: string, payload: unknown, token?: string): Promise<T | null> {
  return apiRequest<T>(path, { method: "PATCH", payload, token });
}
export async function apiPatchResult<T>(path: string, payload: unknown, token?: string): Promise<ApiResult<T>> {
  return apiRequestDetailed<T>(path, { method: "PATCH", payload, token });
}

export async function apiPut<T>(path: string, payload: unknown, token?: string): Promise<T | null> {
  return apiRequest<T>(path, { method: "PUT", payload, token });
}

export async function apiDelete<T>(path: string, token?: string): Promise<T | null> {
  return apiRequest<T>(path, { method: "DELETE", token });
}

export { API_BASE };
