import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useAttachMemory, useDetachMemory } from './use-journal';
import { journalApi } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

vi.mock('@/lib/api', () => ({
  journalApi: {
    attachMemoryToLibraryItem: vi.fn().mockResolvedValue({}),
    detachMemoryFromLibraryItem: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/hooks/use-auth', () => ({
  useCurrentUser: () => ({ data: { sub: 'test-user' } }),
}));

describe('Memory Cache Invalidation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  it('invalidates memories, library, and media on attach', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAttachMemory(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ memoryId: 'm1', libraryId: 'l1', mediaType: 'movie' });
    });

    expect(journalApi.attachMemoryToLibraryItem).toHaveBeenCalledWith('l1', 'm1', 'movie');
    
    // Check invalidations
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.memories.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.library.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.media.all });
  });

  it('invalidates memories, library, and media on detach', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDetachMemory(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ memoryId: 'm1', libraryId: 'l1', mediaType: 'movie' });
    });

    expect(journalApi.detachMemoryFromLibraryItem).toHaveBeenCalledWith('l1', 'm1', 'movie');
    
    // Check invalidations
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.memories.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.library.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.media.all });
  });
});
