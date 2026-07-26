import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { setAccessToken } from "@/lib/api/fetch";
import { toast } from "sonner";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";
import { authApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token && token.trim().length > 0) {
      setAccessToken(token.trim());
      window.location.replace("/app");
    } else {
      const timer = setTimeout(() => {
        const retryParams = new URLSearchParams(window.location.search);
        const retryToken = retryParams.get("token");
        if (retryToken && retryToken.trim().length > 0) {
          setAccessToken(retryToken.trim());
          window.location.replace("/app");
        } else {
          toast.error("Authentication failed. Please try again.");
          window.location.replace("/auth");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <AtmosphereBackground intensity="subtle" />
      <div className="glass-strong rounded-3xl p-8 text-center max-w-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <span className="font-display text-xl font-bold leading-none">A</span>
        </div>
        <h2 className="mt-4 font-display text-xl">Logging you into Avuno…</h2>
        <p className="mt-2 text-xs text-muted-foreground">Setting up your personal media universe</p>
      </div>
    </div>
  );
}
