import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

class MemStore {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), {
    status: s,
    headers: { "content-type": "application/json" },
  });
}
function ok<T>(d: T) {
  return j({ data: d, requestId: "r", timestamp: "t" }, 200);
}
function jwt() {
  const p = { exp: Math.floor(Date.now() / 1000) + 3600, sub: "u1" };
  const b = Buffer.from(JSON.stringify(p))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `h.${b}.s`;
}

let mod: typeof import("./fetch");
beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal("window", {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
  vi.stubGlobal("sessionStorage", new MemStore());
  vi.stubGlobal(
    "CustomEvent",
    class {
      constructor(public type: string) {}
    },
  );
  mod = await import("./fetch");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/**
 * Behavioural traces for the auth/retry loop, written during review to prove
 * the paths that are hard to reason about: concurrent refresh, abort
 * propagation, and method-dependent 429 handling.
 */
describe("apiFetch adversarial traces", () => {
  it("(g) concurrent 401s share ONE refresh", async () => {
    mod.setAccessToken(jwt());
    let refreshes = 0,
      business = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (u: RequestInfo | URL) => {
        const url = String(u);
        if (url.includes("/auth/refresh")) {
          refreshes++;
          await new Promise((r) => setTimeout(r, 10));
          return ok({ accessToken: jwt(), expiresIn: 900 });
        }
        business++;
        return business <= 5 ? j({ statusCode: 401, message: "x" }, 401) : ok({ id: business });
      }),
    );
    await Promise.all([
      mod.apiGet("/a"),
      mod.apiGet("/b"),
      mod.apiGet("/c"),
      mod.apiGet("/d"),
      mod.apiGet("/e"),
    ]);
    expect(refreshes).toBe(1);
  });

  it("(d) external abort propagates, not swallowed as timeout", async () => {
    mod.setAccessToken(jwt());
    const ac = new AbortController();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        ac.abort();
        throw Object.assign(new DOMException("aborted", "AbortError"));
      }),
    );
    await expect(mod.apiGet("/x", { signal: ac.signal })).rejects.toMatchObject({
      name: "AbortError",
    });
  });

  it("(e) 429 on POST is not retried", async () => {
    mod.setAccessToken(jwt());
    const f = vi.fn(async () => j({ statusCode: 429, message: "slow down" }, 429));
    vi.stubGlobal("fetch", f);
    await expect(mod.apiPost("/x", {})).rejects.toMatchObject({ status: 429 });
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("(e2) 429 on GET IS retried", async () => {
    mod.setAccessToken(jwt());
    const f = vi.fn(async () => j({ statusCode: 429, message: "slow down" }, 429));
    vi.stubGlobal("fetch", f);
    await expect(mod.apiGet("/x")).rejects.toMatchObject({ status: 429 });
    expect(f).toHaveBeenCalledTimes(3);
  }, 20000);

  it("never resolves undefined / never spins forever", async () => {
    mod.setAccessToken(jwt());
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ok({ v: 1 })),
    );
    await expect(mod.apiGet("/x")).resolves.toEqual({ v: 1 });
  });

  it("204 returns null without parsing", async () => {
    mod.setAccessToken(jwt());
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await expect(mod.apiDelete("/x")).resolves.toBeNull();
  });
});
