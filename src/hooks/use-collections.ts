import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddCollectionItemInput,
} from "@/lib/api/collections";

export function useCollections() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.collections.list(),
    enabled: !!user,
    queryFn: () => collectionsApi.listCollections(),
  });
}

export function useCollection(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.collections.detail(id),
    queryFn: () => collectionsApi.getCollection(id),
    enabled: !!id && !!user,
  });
}

export function useCollectionStats(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.collections.stats(id),
    queryFn: () => collectionsApi.getCollectionStats(id),
    enabled: !!id && !!user,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCollectionInput) => collectionsApi.createCollection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCollectionInput }) =>
      collectionsApi.updateCollection(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useAddCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      input,
    }: {
      collectionId: string;
      input: AddCollectionItemInput;
    }) => collectionsApi.addCollectionItem(collectionId, input),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.detail(collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
  });
}

export function useRemoveCollectionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      collectionsApi.removeCollectionItem(collectionId, itemId),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.detail(collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
  });
}

export function useShelves() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.shelves.list(),
    enabled: !!user,
    queryFn: () => collectionsApi.listShelves(),
  });
}

export function useShelf(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.shelves.detail(id),
    queryFn: () => collectionsApi.getShelf(id),
    enabled: !!id && !!user,
  });
}

export function useCreateShelf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string }) =>
      collectionsApi.createShelf(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shelves.all });
    },
  });
}

export function useDeleteShelf() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.deleteShelf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shelves.all });
    },
  });
}
