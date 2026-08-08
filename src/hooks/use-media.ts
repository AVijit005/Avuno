import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import type { MediaFilterParams, MediaSearchParams } from "@/lib/api/media";

export function useMediaList(params?: MediaFilterParams) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.media.list(params),
    enabled: !!user,
    queryFn: ({ pageParam }) =>
      mediaApi.listMedia({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
  });
}

export function useMediaSearch(params: MediaSearchParams, enabled = true) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.media.search(params),
    queryFn: ({ pageParam }) =>
      mediaApi.searchMedia({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!params.search && params.search.length > 0 && !!user,
    staleTime: 0,
  });
}

export function useMedia(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.media.detail(id),
    queryFn: () => mediaApi.getMedia(id),
    enabled: !!id && !!user,
    staleTime: 10 * 60_000,
  });
}

export function useRelatedMedia(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.media.related(id),
    queryFn: () => mediaApi.getRelatedMedia(id),
    enabled: !!id && !!user,
    staleTime: 10 * 60_000,
  });
}

export function useMediaByType(type: string, params?: MediaFilterParams) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.media.list({ ...params, mediaType: type }),
    queryFn: ({ pageParam }) =>
      mediaApi.listMediaByType(type, { ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!type && !!user,
  });
}
