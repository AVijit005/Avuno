import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  API_RETRY_COUNT,
  API_RETRY_DELAY_MS,
  REFRESH_ENDPOINT,
  LOGOUT_ENDPOINT,
} from "./constants";
import { ApiError, NetworkError, TimeoutError } from "./errors";
import { analytics } from "../analytics";

interface ApiResponse<T> {
  data: T;
  requestId: string;
  timestamp: string;
}

interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  requestId?: string;
  timestamp?: string;
  path?: string;
  code?: string;
}

/**
 * Fired once when the session is unrecoverable (refresh failed). Listeners
 * (see __root.tsx) redirect to /auth. Without this, a mid-session expiry
 * leaves the SPA looking authenticated while every request 401s.
 */
export const AUTH_EXPIRED_EVENT = "auth:expired";

let sessionExpiredNotified = false;

function notifySessionExpired(): void {
  if (typeof window === "undefined" || sessionExpiredNotified) return;
  sessionExpiredNotified = true;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

let modAccessToken: string | null = null;
let modRefreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null): void {
  // Guarded: on the server these module globals are shared by every
  // concurrent request, so writing a per-user token here would leak it
  // across requests.
  if (typeof window === "undefined") return;

  modAccessToken = token;
  if (token) {
    sessionExpiredNotified = false;
    try {
      sessionStorage.setItem("accessToken", token);
    } catch {
      // Private mode / storage disabled — the in-memory copy still works.
    }
  } else {
    try {
      sessionStorage.removeItem("accessToken");
    } catch {
      // Nothing to do; the in-memory copy is already cleared.
    }
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (modAccessToken) return modAccessToken;
  try {
    const stored = sessionStorage.getItem("accessToken");
    if (stored) {
      modAccessToken = stored;
      return stored;
    }
  } catch {
    // Storage unavailable — fall through to the in-memory value.
  }
  return modAccessToken;
}

async function refreshAccessToken(): Promise<string> {
  // Bounded independently: this call does not go through apiFetch, so
  // without its own AbortController a hung /auth/refresh would block every
  // queued request forever.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError("Session expired. Please log in again.", 401, "TOKEN_EXPIRED");
    }

    const body = (await response.json()) as ApiResponse<{
      accessToken: string;
      expiresIn: number;
    }>;
    setAccessToken(body.data.accessToken);
    return body.data.accessToken;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Single-flight refresh. The promise is assigned synchronously before the
 * first await so concurrent callers share one in-flight request and we never
 * burn more than one refresh-token rotation at a time.
 */
function forceRefreshValidToken(): Promise<string> {
  if (typeof window === "undefined") {
    return Promise.reject(new ApiError("No session on server", 401, "NO_SESSION"));
  }
  if (!modRefreshPromise) {
    modRefreshPromise = refreshAccessToken().finally(() => {
      modRefreshPromise = null;
    });
  }
  return modRefreshPromise;
}

/** base64url -> JSON. JWT segments are base64url, which plain atob rejects. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  // Undecodable token: treat as usable and let the server decide. Returning
  // "expired" here would trigger a refresh on every single request.
  if (!payload) return false;
  const exp = payload.exp;
  if (typeof exp !== "number") return false;
  return exp * 1000 <= Date.now() + 30_000;
}

async function getValidToken(): Promise<string | null> {
  const stored = getAccessToken();
  if (stored && !isTokenExpired(stored)) return stored;
  if (!stored && typeof window !== "undefined") {
    // No token at all: let the request go out unauthenticated rather than
    // firing a refresh for anonymous traffic.
    return null;
  }

  try {
    return await forceRefreshValidToken();
  } catch {
    setAccessToken(null);
    notifySessionExpired();
    return null;
  }
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Paths where a 401 must NOT trigger a token refresh, because they either are
 * the refresh call itself or do not authenticate via the bearer token.
 * Matched exactly — `/auth/logout-all` IS bearer-authenticated and must keep
 * the normal refresh-and-retry behaviour.
 */
const NO_REFRESH_ON_401_PATHS = new Set<string>([REFRESH_ENDPOINT, LOGOUT_ENDPOINT]);

function shouldSkipRefreshOn401(path: string): boolean {
  const withoutQuery = path.split("?")[0].replace(/\/+$/, "");
  return NO_REFRESH_ON_401_PATHS.has(withoutQuery);
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const {
    timeout = API_TIMEOUT_MS,
    retries = API_RETRY_COUNT,
    skipAuth = false,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const method = (fetchOptions.method || "GET").toUpperCase();
  const isIdempotent = method === "GET" || method === "HEAD" || method === "OPTIONS";

  // Transport retries replay the request, so they are only safe when the
  // request has no side effects. An auth retry is different: a 401 means the
  // server *rejected* the request, so nothing happened and replaying it is
  // safe for any method. Conflating the two is what made every mutation fail
  // with "Max retries exceeded" once the access token expired.
  const maxTransportRetries = isIdempotent ? retries : 0;
  const maxAuthRetries = 1;

  let authRetriesUsed = 0;

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let releaseSignal: (() => void) | undefined;

    let signal: AbortSignal;
    if (externalSignal) {
      const merged = anySignal([externalSignal, controller.signal]);
      signal = merged.signal;
      releaseSignal = merged.release;
    } else {
      signal = controller.signal;
    }

    try {
      const headers = new Headers(fetchOptions.headers);
      if (import.meta.env.DEV) {
        headers.set("ngrok-skip-browser-warning", "true");
      }

      headers.set("X-Requested-With", "XMLHttpRequest");

      if (!skipAuth) {
        const token = await getValidToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      if (
        fetchOptions.body &&
        !headers.has("Content-Type") &&
        !(fetchOptions.body instanceof FormData)
      ) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal,
        credentials: "include",
      });

      if (response.status === 204) {
        return null as unknown as T;
      }

      if (response.status === 401 && !skipAuth && !shouldSkipRefreshOn401(path)) {
        if (authRetriesUsed >= maxAuthRetries) {
          setAccessToken(null);
          notifySessionExpired();
          throw new ApiError("Session expired", 401, "SESSION_EXPIRED");
        }
        authRetriesUsed++;
        try {
          // Deliberately not clearing the token first: a concurrent request
          // may already have stored a fresh one, and nulling it would discard
          // a valid token and burn an extra refresh-token rotation.
          await forceRefreshValidToken();
          continue;
        } catch (refreshError) {
          setAccessToken(null);
          notifySessionExpired();
          throw refreshError;
        }
      }

      // Body is read before the timeout is cleared (see finally): a server
      // that sends headers then stalls the body must still hit the timeout.
      let responseBody: unknown;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new ApiError(
            `HTTP Error ${response.status}: ${text.slice(0, 50)}`,
            response.status,
          );
        }
        responseBody = text;
      }

      if (!response.ok) {
        const errorBody = responseBody as ApiErrorResponse;
        analytics.track("API Error", {
          status: response.status,
          path: errorBody.path || path,
        });
        throw new ApiError(
          Array.isArray(errorBody.message)
            ? errorBody.message.join(", ")
            : (errorBody.message ?? "Request failed"),
          response.status,
          errorBody.code,
          errorBody.requestId,
          errorBody.path,
        );
      }

      const apiResponse = responseBody as ApiResponse<T>;
      return apiResponse.data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.isRateLimited && attempt < maxTransportRetries) {
          await delay(API_RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        if (externalSignal?.aborted) {
          throw error;
        }
        throw new TimeoutError();
      }

      if (attempt < maxTransportRetries) {
        await delay(API_RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      // Keep the user-facing copy, but preserve the original cause instead of
      // discarding it behind a bare NetworkError.
      throw new NetworkError(undefined, { cause: error });
    } finally {
      clearTimeout(timeoutId);
      releaseSignal?.();
    }
  }
}

export function apiGet<T>(path: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    // `body !== undefined`, not `body ?`: 0, "" and false are valid payloads.
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = void>(path: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: "DELETE" });
}

export function apiUpload<T>(path: string, formData: FormData, options?: FetchOptions): Promise<T> {
  // Preserve caller headers but strip Content-Type so the browser can set the
  // multipart boundary itself.
  const headers = new Headers(options?.headers);
  headers.delete("Content-Type");

  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: formData as unknown as BodyInit,
    headers,
  });
}

/**
 * Merge abort signals, returning a `release` that detaches the listeners.
 * Without it, every retry attempt would leave a listener attached to the
 * caller's long-lived signal (React Query reuses one per query), leaking
 * closures for as long as the query is mounted.
 */
function anySignal(signals: AbortSignal[]): { signal: AbortSignal; release: () => void } {
  const controller = new AbortController();
  const cleanups: Array<() => void> = [];

  const release = () => {
    for (const fn of cleanups) fn();
    cleanups.length = 0;
  };

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      release();
      return { signal: controller.signal, release };
    }
    const onAbort = () => {
      controller.abort(signal.reason);
      release();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    cleanups.push(() => signal.removeEventListener("abort", onAbort));
  }

  return { signal: controller.signal, release };
}
