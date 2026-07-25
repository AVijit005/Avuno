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
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (token) {
      setAccessToken(token);
      toast.success("Welcome to Avuno!");
      window.location.href = "/app";
    } else {
      toast.error("Authentication failed. Please try again.");
      window.location.href = "/auth";
    }
  }, [token]);

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
