import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import type { SearchParams } from "@/lib/api/search";

export function useSearch(params: SearchParams, enabled = true) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.search.query(params),
    queryFn: () => searchApi.search(params),
    enabled: enabled && !!params.q && params.q.length > 0 && !!user,
    staleTime: 0,
  });
}

export function useSearchSuggestions(q: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.search.suggestions(q),
    queryFn: () => searchApi.getSuggestions(q),
    enabled: !!q && q.length >= 2 && !!user,
    staleTime: 10_000,
  });
}

export function useRecentSearches() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.search.recent(),
    enabled: !!user,
    queryFn: () => searchApi.getRecentSearches(),
  });
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => searchApi.clearRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.search.recent() });
    },
  });
}

export function useTrending() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.search.trending(),
    enabled: !!user,
    queryFn: () => searchApi.getTrending(),
    staleTime: 5 * 60_000,
  });
}

export function useFilterOptions() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.search.filterOptions(),
    enabled: !!user,
    queryFn: () => searchApi.getFilterOptions(),
    staleTime: 10 * 60_000,
  });
}
