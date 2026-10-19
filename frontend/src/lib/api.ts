import { supabase } from "./supabase";

const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "/api";
// Clean trailing slashes so BASE + "/path" doesn't produce "//path"
const BASE = RAW_BASE.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function call<T>(method: string, path: string, body?: unknown, form?: FormData): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = `${BASE}${cleanPath}`;

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch (networkErr: unknown) {
    const msg = networkErr instanceof Error ? networkErr.message : "Network error";
    throw new ApiError(
      0,
      "network_error",
      `Unable to reach backend at ${targetUrl}. (${msg}). Make sure the backend server is running and accessible.`,
    );
  }

  if (!res.ok) {
    let code = "http_error";
    let message = res.statusText || `Request failed with status ${res.status}`;

    try {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        code = json.code || json.error?.code || code;
        message = json.message || json.error?.message || json.detail || message;
      } else {
        const text = await res.text();
        if (text && text.length < 200) {
          message = text;
        }
      }
    } catch {
      /* Fallback to default status text */
    }

    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return {} as T;
}

export const api = {
  get: <T>(p: string) => call<T>("GET", p),
  post: <T>(p: string, b?: unknown) => call<T>("POST", p, b ?? {}),
  put: <T>(p: string, b: unknown) => call<T>("PUT", p, b),
  patch: <T>(p: string, b: unknown) => call<T>("PATCH", p, b),
  del: <T>(p: string) => call<T>("DELETE", p),
  upload: <T>(p: string, form: FormData) => call<T>("POST", p, undefined, form),
};
