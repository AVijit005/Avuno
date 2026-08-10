import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { setAccessToken, apiPost } from "@/lib/api/fetch";
import { toast } from "sonner";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

interface ExchangeResponse {
  accessToken: string;
}

function AuthCallback() {
  // The code is single-use; React 18/19 StrictMode double-invokes effects in
  // development, and a second exchange would fail against an already-consumed
  // code and bounce the user to /auth.
  const exchanged = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || exchanged.current) return;
    exchanged.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    // Scrub the query string immediately. Even though it now carries only a
    // short-lived single-use code rather than a JWT, there is no reason to
    // leave it in history or expose it via Referer.
    window.history.replaceState({}, "", "/auth/callback");

    const fail = (message: string) => {
      toast.error(message, { duration: 10000 });
      setTimeout(() => {
        window.location.replace("/auth");
      }, 5000);
    };

    if (error) {
      fail(
        error === "invalid_state"
          ? "Sign-in session expired or could not be verified. Please try again."
          : "Authentication failed. Please try again.",
      );
      return;
    }

    if (!code) {
      fail("Authentication failed. Please try again.");
      return;
    }

    // The server verified the CSRF state before issuing this code, so the
    // client does not need to (and cannot meaningfully) re-check it.
    apiPost<ExchangeResponse>("/auth/exchange", { code }, { skipAuth: true })
      .then((res) => {
        if (!res?.accessToken) {
          fail("Authentication failed. Please try again.");
          return;
        }
        setAccessToken(res.accessToken);
        router.navigate({ to: "/app", replace: true });
      })
      .catch((err) => fail(`Authentication failed. ${err.message || "Please try again."}`));
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <AtmosphereBackground intensity="soft" />
      <div className="glass-strong max-w-sm rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <span className="font-display text-xl font-bold leading-none">A</span>
        </div>
        <h2 className="mt-4 font-display text-xl">Logging you into Avuno…</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Setting up your personal media universe
        </p>
      </div>
    </div>
  );
}
