import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { createQueryClient } from "./lib/api/query-client";
import { PremiumErrorState } from "./components/common/PremiumErrorState";

export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error }) => (
      <div className="p-8">
        <PremiumErrorState
          title="Unexpected Error"
          description={
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading this page."
          }
        />
      </div>
    ),
  });

  return router;
};
