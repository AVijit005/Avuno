import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { libraryApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  AddToLibraryInput,
  UpdateLibraryItemInput,
  LibraryFilterParams,
} from "@/lib/api/library";

export function useLibrary(params?: LibraryFilterParams) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.library.list(params),
    enabled: !!user,
    queryFn: ({ pageParam }) =>
      libraryApi.listLibrary({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
  });
}

export function useLibraryByStatus(status: string, params?: LibraryFilterParams) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.library.byStatus(status, params),
    enabled: !!user,
    queryFn: ({ pageParam }) =>
      libraryApi.listLibraryByStatus(status, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
  });
}

export function useLibraryByType(type: string, params?: LibraryFilterParams) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.library.byType(type, params),
    enabled: !!user,
    queryFn: ({ pageParam }) =>
      libraryApi.listLibraryByType(type, { ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
  });
}

export function useLibraryItem(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.library.detail(id),
    queryFn: () => libraryApi.getLibraryItem(id),
    enabled: !!id && !!user,
  });
}

export function useLibraryStats() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.library.stats(),
    enabled: !!user,
    queryFn: () => libraryApi.getLibraryStats(),
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddToLibraryInput) => libraryApi.addToLibrary(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useUpdateLibraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLibraryItemInput }) =>
      libraryApi.updateLibraryItem(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.library.detail(id) });
      const previous = queryClient.getQueryData(queryKeys.library.detail(id));
      queryClient.setQueryData(queryKeys.library.detail(id), (old: unknown) => {
        if (!old) return old;
        return { ...(old as Record<string, unknown>), ...input };
      });
      return { previous };
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.library.detail(id), context.previous);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wrapped.all });
    },
  });
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.removeFromLibrary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}
