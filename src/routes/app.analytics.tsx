import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export const Route = createFileRoute("/app/analytics")({ 
  component: lazyRouteComponent(() => import("./_app.analytics-page")),
  pendingComponent: PageSkeleton,
});
