import type { UIMediaItem } from "@/lib/adapters/types";

export function PersonalMemory({ item }: { item: UIMediaItem }) {
  // Option A: Hide PersonalMemory entirely when media-scoped retrieval cannot be verified.
  // The current useMemories hook cannot filter by mediaId, and the MemoryResponse
  // does not return mediaIds. To prevent a global memory from leaking into an
  // unrelated media detail page, we hide this component entirely.
  return null;
}
