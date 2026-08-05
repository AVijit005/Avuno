import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { setAccessToken, apiPost } from "@/lib/api/fetch";
import { toast } from "sonner";
import { AtmosphereBackground } from "@/components/atmosphere/AtmosphereBackground";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const exchanged = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || exchanged.current) return;
    exchanged.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const errorDesc = urlParams.get("error_description");
    const code = urlParams.get("code");
    const token = urlParams.get("token");

    if (error) {
      toast.error(errorDesc ? decodeURIComponent(errorDesc).replace(/\+/g, " ") : "Authentication failed.");
      window.location.href = "/auth";
      return;
    }

    if (code && code.trim().length > 0) {
      apiPost<{ accessToken: string }>('/auth/exchange', { code: code.trim() })
        .then(res => {
          setAccessToken(res.accessToken);
          window.location.href = "/app";
        })
        .catch(() => {
          toast.error("Authentication failed. Please try again.");
          window.location.href = "/auth";
        });
    } else if (token && token.trim().length > 0) {
      setAccessToken(token.trim());
      window.location.href = "/app";
    } else {
      toast.error("Authentication failed. Please try again.");
      window.location.href = "/auth";
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
        <p className="mt-2 text-xs text-muted-foreground">Setting up your personal media universe</p>
      </div>
    </div>
  );
}
