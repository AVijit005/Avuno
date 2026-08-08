import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Regression tests for the auth/retry semantics in apiFetch.
 *
 * These exist because the bugs they cover were invisible to both
 * `tsc --noEmit` and ESLint: a mutation that received a 401 would refresh the
 * token successfully and then throw NetworkError("Max retries exceeded"),
 * silently discarding the write while showing the user a connectivity error.
 *
 * Runs without jsdom by stubbing the small surface fetch.ts touches.
 */

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  clear() {
    this.map.clear();
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function ok<T>(data: T): Response {
  return jsonResponse({ data, requestId: "req_test", timestamp: "now" }, 200);
}

/** A JWT with a far-future exp, base64url-encoded (contains - and _). */
function futureJwt(): string {
  const payload = { exp: Math.floor(Date.now() / 1000) + 3600, sub: "u1?~" };
  const b64 = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${b64}.sig`;
}

let apiPost: typeof import("./fetch").apiPost;
let apiGet: typeof import("./fetch").apiGet;
let setAccessToken: typeof import("./fetch").setAccessToken;

beforeEach(async () => {
  vi.resetModules();

  const storage = new MemoryStorage();
  vi.stubGlobal("window", {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("CustomEvent", class {
    constructor(public type: string) {}
  });

  const mod = await import("./fetch");
  apiPost = mod.apiPost;
  apiGet = mod.apiGet;
  setAccessToken = mod.setAccessToken;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiFetch — auth retry on 401", () => {
  it("replays a POST after a successful token refresh instead of throwing", async () => {
    setAccessToken(futureJwt());

    const calls: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      if (url.includes("/auth/refresh")) {
        return ok({ accessToken: futureJwt(), expiresIn: 900 });
      }
      // First business call 401s, the replay succeeds.
      const businessCalls = calls.filter((c) => c.includes("/library")).length;
      if (businessCalls === 1) return jsonResponse({ statusCode: 401, message: "expired" }, 401);
      return ok({ id: "lib_1" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiPost<{ id: string }>("/library", { mediaId: "m1" });

    expect(result).toEqual({ id: "lib_1" });
    expect(calls.filter((c) => c.includes("/auth/refresh"))).toHaveLength(1);
    expect(calls.filter((c) => c.includes("/library"))).toHaveLength(2);
  });

  it("does not retry a POST more than once for auth", async () => {
    setAccessToken(futureJwt());

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/auth/refresh")) {
        return ok({ accessToken: futureJwt(), expiresIn: 900 });
      }
      return jsonResponse({ statusCode: 401, message: "expired" }, 401);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiPost("/library", { mediaId: "m1" })).rejects.toMatchObject({
      status: 401,
    });
  });
});

describe("apiFetch — transport retries", () => {
  it("does NOT replay a failed POST (non-idempotent)", async () => {
    setAccessToken(futureJwt());

    const fetchMock = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiPost("/library", { mediaId: "m1" })).rejects.toMatchObject({
      name: "NetworkError",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does replay a failed GET (idempotent)", async () => {
    setAccessToken(futureJwt());

    const fetchMock = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiGet("/library")).rejects.toMatchObject({ name: "NetworkError" });
    // 1 initial + API_RETRY_COUNT (2) retries
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 15_000);

  it("preserves the underlying error as `cause`", async () => {
    setAccessToken(futureJwt());
    const underlying = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn(async () => { throw underlying; }));

    await expect(apiPost("/library", {})).rejects.toMatchObject({ cause: underlying });
  });
});

describe("apiPost — body encoding", () => {
  it("sends falsy bodies instead of dropping them", async () => {
    setAccessToken(futureJwt());

    let sentBody: unknown;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        sentBody = init?.body;
        return ok({ done: true });
      }),
    );

    await apiPost("/things", 0);
    expect(sentBody).toBe("0");

    await apiPost("/things", false);
    expect(sentBody).toBe("false");

    await apiPost("/things", "");
    expect(sentBody).toBe('""');
  });

  it("omits the body when it is undefined", async () => {
    setAccessToken(futureJwt());

    let sentBody: unknown = "sentinel";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        sentBody = init?.body;
        return ok({ done: true });
      }),
    );

    await apiPost("/things");
    expect(sentBody).toBeUndefined();
  });
});

describe("token expiry parsing", () => {
  it("accepts base64url payloads without triggering a refresh storm", async () => {
    // A payload containing '-'/'_' after base64url encoding would make plain
    // atob throw, which the old code treated as "expired" and refreshed on
    // every single request.
    setAccessToken(futureJwt());

    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        calls.push(String(input));
        return ok({ ok: true });
      }),
    );

    await apiGet("/library");
    await apiGet("/library");

    expect(calls.filter((c) => c.includes("/auth/refresh"))).toHaveLength(0);
  });
});
