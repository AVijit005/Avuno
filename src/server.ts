import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const err = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(err);
  const errMsg = err instanceof Error ? (err.stack || err.message) : String(err);

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>SSR Diagnostic Error</title></head><body style="font-family:monospace;padding:2rem;background:#111;color:#f87171;"><h1>SSR Runtime Error</h1><pre style="white-space:pre-wrap;background:#222;padding:1rem;border-radius:8px;">${errMsg}</pre><pre style="white-space:pre-wrap;background:#222;padding:1rem;border-radius:8px;">${body}</pre></body></html>`,
    {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? (error.stack || error.message) : String(error);
      return new Response(
        `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>SSR Diagnostic Error</title></head><body style="font-family:monospace;padding:2rem;background:#111;color:#f87171;"><h1>SSR Fetch Error</h1><pre style="white-space:pre-wrap;background:#222;padding:1rem;border-radius:8px;">${errMsg}</pre></body></html>`,
        {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }
      );
    }
  },
};
