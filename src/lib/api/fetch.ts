import { API_BASE_URL, API_TIMEOUT_MS, API_RETRY_COUNT, API_RETRY_DELAY_MS, REFRESH_ENDPOINT, LOGOUT_ENDPOINT } from './constants';
import { ApiError, NetworkError, TimeoutError } from './errors';
import { analytics } from '../analytics';

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

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      try { sessionStorage.setItem('accessToken', token); } catch {}
    } else {
      try { sessionStorage.removeItem('accessToken'); } catch {}
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    try {
      const ssToken = sessionStorage.getItem('accessToken');
      if (ssToken) { accessToken = ssToken; return ssToken; }
    } catch {}
  }
  return accessToken;
}

async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new ApiError('Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }

  const body = await response.json() as ApiResponse<{ accessToken: string; expiresIn: number }>;
  setAccessToken(body.data.accessToken);
  return body.data.accessToken;
}

async function getValidToken(): Promise<string | null> {
  const stored = getAccessToken();
  if (stored) return stored;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    return await refreshPromise;
  } catch {
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

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    timeout = API_TIMEOUT_MS,
    retries = API_RETRY_COUNT,
    skipAuth = false,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const signal = externalSignal
      ? anySignal([externalSignal, controller.signal])
      : controller.signal;

    try {
      const headers = new Headers(fetchOptions.headers);
      headers.set('ngrok-skip-browser-warning', 'true');

      if (!skipAuth) {
        const token = await getValidToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }

      if (fetchOptions.body && !headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal,
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      if (response.status === 204) {
        return undefined as T;
      }

      if (response.status === 401 && !skipAuth && !path.includes(REFRESH_ENDPOINT)) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            continue;
          }
        } catch {
          // Refresh failed — don't wipe the stored token.
          // Google OAuth users never get a refresh cookie due to cross-domain redirect,
          // so refresh will always fail for them. Let the UI handle gracefully.
        }
        throw new ApiError('Session expired', 401, 'SESSION_EXPIRED');
      }

      let responseBody;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new ApiError(`HTTP Error ${response.status}: ${text.slice(0, 50)}`, response.status);
        }
        responseBody = text as unknown;
      }

      if (!response.ok) {
        const errorBody = responseBody as ApiErrorResponse;
        analytics.track('API Error', { status: response.status, path: errorBody.path || path });
        throw new ApiError(
          Array.isArray(errorBody.message) ? errorBody.message.join(', ') : errorBody.message ?? 'Request failed',
          response.status,
          errorBody.code,
          errorBody.requestId,
          errorBody.path,
        );
      }

      const apiResponse = responseBody as ApiResponse<T>;
      return apiResponse.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        if (error.isRateLimited && attempt < retries) {
          await delay(API_RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (externalSignal?.aborted) {
          throw error;
        }
        throw new TimeoutError();
      }

      if (attempt < retries) {
        await delay(API_RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      throw new NetworkError();
    }
  }

  throw new NetworkError('Max retries exceeded');
}

export function apiGet<T>(path: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = void>(path: string, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'DELETE' });
}

export function apiUpload<T>(path: string, formData: FormData, options?: FetchOptions): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: formData as unknown as BodyInit,
    headers: {},
  });
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

export function logout(): void {
  apiFetch(LOGOUT_ENDPOINT, { method: 'POST', skipAuth: false })
    .catch(() => {})
    .finally(() => setAccessToken(null));
}
