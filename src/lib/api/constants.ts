export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.SSR ? "http://api:3000/api" : "/api");

export const API_TIMEOUT_MS = 30_000;

export const API_RETRY_COUNT = 2;
export const API_RETRY_DELAY_MS = 1_000;

export const REFRESH_ENDPOINT = "/auth/refresh";
export const LOGIN_ENDPOINT = "/auth/login";
export const LOGOUT_ENDPOINT = "/auth/logout";
