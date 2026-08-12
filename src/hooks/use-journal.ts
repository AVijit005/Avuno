import { useCurrentUser } from "@/hooks/use-auth";
import { nextPageParam } from "@/lib/api/pagination";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { journalApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  CreateMemoryInput,
  UpdateMemoryInput,
} from "@/lib/api/journal";
import { analytics } from "@/lib/analytics";

export function useJournalEntries(params?: { cursor?: string; limit?: number }) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.journal.entries(params),
    enabled: !!user,
    queryFn: ({ pageParam }) =>
      journalApi.listJournalEntries({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: nextPageParam,
    initialPageParam: undefined as string | undefined,
  });
}

export function useJournalEntry(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.journal.entry(id),
    queryFn: () => journalApi.getJournalEntry(id),
    enabled: !!id && !!user,
  });
}

export function useQuote(id: string) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.journal.quote(id),
    queryFn: () => journalApi.getQuote(id),
    enabled: !!id && !!user,
  });
}

export function useJournalStats() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.journal.stats(),
    enabled: !!user,
    queryFn: () => journalApi.getJournalStats(),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJournalEntryInput) => journalApi.createJournalEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });

      if (typeof window !== "undefined" && !localStorage.getItem("chronicle_first_entry_tracked")) {
        analytics.track("first_entry");
        localStorage.setItem("chronicle_first_entry_tracked", "true");
      }
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJournalEntryInput }) =>
      journalApi.updateJournalEntry(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.entry(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalApi.deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useMemories(params?: {
  cursor?: string;
  limit?: number;
  mediaId?: string;
  journalId?: string;
}) {
  const { data: user } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: queryKeys.memories.list(params),
    enabled: !!user,
    queryFn: ({ pageParam }) =>
      journalApi.listMemories({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: nextPageParam,
    initialPageParam: undefined as string | undefined,
  });
}

export function useAttachMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      libraryId,
      mediaType,
    }: {
      memoryId: string;
      libraryId: string;
      mediaType: string;
    }) => journalApi.attachMemoryToLibraryItem(libraryId, memoryId, mediaType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useDetachMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memoryId,
      libraryId,
      mediaType,
    }: {
      memoryId: string;
      libraryId: string;
      mediaType: string;
    }) => journalApi.detachMemoryFromLibraryItem(libraryId, memoryId, mediaType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useMemory(id: string) {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: [...queryKeys.memories.all, id],
    enabled: !!user && !!id,
    queryFn: () => journalApi.getMemory(id),
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMemoryInput) => journalApi.createMemory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMemoryInput }) =>
      journalApi.updateMemory(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.memories.all, id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalApi.deleteMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useTimelineEvents(params?: { year?: number; month?: number }) {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.timeline.events(params),
    enabled: !!user,
    queryFn: () => journalApi.listTimelineEvents(params),
  });
}

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: string; title: string; description?: string; eventDate: string }) =>
      journalApi.createTimelineEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useAttachTimelineMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ timelineId, memoryId }: { timelineId: string; memoryId: string }) =>
      journalApi.attachTimelineMemory(timelineId, memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
    },
  });
}

export function useDetachTimelineMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ timelineId, memoryId }: { timelineId: string; memoryId: string }) =>
      journalApi.detachTimelineMemory(timelineId, memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.all });
    },
  });
}

export function useJournalPrompts() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: [...queryKeys.journal.all, "prompts"] as const,
    enabled: !!user,
    queryFn: () => journalApi.getJournalPrompts(),
    staleTime: 60 * 60_000,
  });
}
