import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { ApiError } from "./errors";
import { toast } from "sonner";

export function createQueryClient(): QueryClient {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        toast.error("Failed to refresh data", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    },
  });

  const mutationCache = new MutationCache({
    onError: (error) => {
      toast.error("Action failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if (error.isUnauthorized || error.isForbidden || error.isNotFound || error.isConflict) {
              return false;
            }
            if (error.isRateLimited && failureCount < 3) {
              return true;
            }
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
