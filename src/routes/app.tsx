import { createFileRoute, Outlet, redirect, isRedirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { authApi } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ context }) => {
    if (typeof window === "undefined") return;

    const { getAccessToken } = await import("@/lib/api/fetch");
    const token = getAccessToken();
    if (!token) {
      throw redirect({ to: "/auth" });
    }

    const { queryClient } = context;
    try {
      await queryClient.fetchQuery({
        queryKey: ["auth", "me"],
        queryFn: () => authApi.getCurrentUser(),
        staleTime: 5 * 60_000,
      });
    } catch (error) {
      if (isRedirect(error)) {
        throw error;
      }
      if (error instanceof ApiError && error.status === 401) {
        throw redirect({ to: "/auth" });
      }
      // Network error or other transient failure — allow rendering /app
      // The user still has a token; retry will happen naturally
    }
  },
  component: () => (
    <AppShell>
      <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">App content could not load.</div>}>
        <Outlet />
      </ErrorBoundary>
    </AppShell>
  ),
});
