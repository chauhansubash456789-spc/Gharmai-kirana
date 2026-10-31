export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]> | undefined;

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const TOKEN_KEY = "gharmai_kirana_token";

export function getStoredToken(): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // Ignore storage issues
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: options.body
      ? { "Content-Type": "application/json", ...headers }
      : headers,
  });

  if (!res.ok) {
    if (res.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/register") {
      setStoredToken(null);
    }
    let body: { error?: string; fieldErrors?: Record<string, string[]> } = {};
    try {
      body = await res.json();
    } catch {
      /* ignore malformed body */
    }
    throw new ApiError(res.status, body.error || `Request failed (${res.status})`, body.fieldErrors);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body == null ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body == null ? undefined : JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function toForm(body: Record<string, string | number | boolean | undefined | null>) {
  return Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
}