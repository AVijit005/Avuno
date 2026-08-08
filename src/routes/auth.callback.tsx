import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { setAccessToken } from "@/lib/api/fetch";
import { toast } from "sonner";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const state = urlParams.get("state");

    // Verify OAuth state to prevent login CSRF / session fixation
    const expectedState = (() => {
      try {
        return sessionStorage.getItem("oauth_state");
      } catch {
        return null;
      }
    })();
    try {
      sessionStorage.removeItem("oauth_state");
    } catch {
      // Storage unavailable (private mode). The state comparison below still
      // runs against the value already read into `expectedState`.
    }

    const isStateValid = !!(state && expectedState && state === expectedState);

    if (token && token.trim().length > 0 && isStateValid) {
      setAccessToken(token.trim());
      // Scrub token + state from URL before navigation to prevent leakage
      window.history.replaceState({}, "", "/auth/callback");
      window.location.replace("/app");
    } else if (token && token.trim().length > 0 && !isStateValid) {
      // Token present but state mismatch — possible CSRF attack
      window.history.replaceState({}, "", "/auth/callback");
      toast.error("Authentication failed: invalid session. Please try again.");
      window.location.replace("/auth");
    } else {
      const timer = setTimeout(() => {
        const retryParams = new URLSearchParams(window.location.search);
        const retryToken = retryParams.get("token");
        const retryState = retryParams.get("state");
        const retryValid = !!(retryState && expectedState && retryState === expectedState);
        if (retryToken && retryToken.trim().length > 0 && retryValid) {
          setAccessToken(retryToken.trim());
          window.history.replaceState({}, "", "/auth/callback");
          window.location.replace("/app");
        } else {
          window.history.replaceState({}, "", "/auth/callback");
          toast.error("Authentication failed. Please try again.");
          window.location.replace("/auth");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <AtmosphereBackground intensity="soft" />
      <div className="glass-strong rounded-3xl p-8 text-center max-w-sm">
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
