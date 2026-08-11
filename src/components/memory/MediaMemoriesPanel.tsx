import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { Plus, X, Lock, Globe, Bookmark, Calendar, Unlink } from "lucide-react";
import { toast } from "sonner";
import { useMemories, useAttachMemory, useDetachMemory } from "@/hooks/use-journal";
import type { UIMediaItem } from "@/lib/adapters/types";
import type { MemoryResponse } from "@/lib/api/journal";

export function MediaMemoriesPanel({ item }: { item: UIMediaItem }) {
  const [isAdding, setIsAdding] = useState(false);
  const { data, isLoading } = useMemories({ mediaId: item.mediaId });
  const memories = data?.pages.flatMap((p) => p.items) || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Preserved Moments
          </div>
          <h3 className="font-display text-2xl tracking-tight">Your memories</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-foreground hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add a memory
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <AttachMemoryView
              item={item}
              onCancel={() => setIsAdding(false)}
              existingMemoryIds={memories.map((m) => m.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isAdding && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading ? (
            <div className="h-32 rounded-3xl bg-white/5 animate-pulse" />
          ) : memories.length === 0 ? (
            <div className="p-8 text-center md:col-span-2 rounded-[32px] bg-surface-1 border border-border/40 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Vault
              </div>
              <div className="mt-2 font-display text-2xl tracking-tight text-foreground">
                No memories linked
              </div>
              <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground">
                Attach a memory from your vault to remember exactly how this made you feel.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Add a memory
              </button>
            </div>
          ) : (
            memories.map((memory) => (
              <LinkedMemoryCard key={memory.id} memory={memory} item={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function LinkedMemoryCard({ memory, item }: { memory: MemoryResponse; item: UIMediaItem }) {
  const [confirming, setConfirming] = useState(false);
  const detach = useDetachMemory();
  const date = memory.memoryDate ? new Date(memory.memoryDate) : new Date(memory.createdAt);

  const handleDetach = () => {
    detach.mutate(
      { memoryId: memory.id, libraryId: item.id, mediaType: item.mediaType },
      {
        onSuccess: () => {
          toast.success("Memory unlinked from this media");
          setConfirming(false);
        },
        onError: () => {
          toast.error("Failed to remove memory link");
          setConfirming(false);
        },
      },
    );
  };

  return (
    <div className="group relative p-5 flex flex-col justify-between overflow-hidden rounded-3xl bg-surface-1 border border-border/40 shadow-sm transition-all hover:bg-surface-2 hover:border-border/60">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <time className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
            <Calendar className="h-3 w-3" />
            {format(date, "MMM d, yyyy")}
          </time>
          {memory.isPrivate ? (
            <span aria-label="Private memory">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          ) : (
            <span aria-label="Visible on profile">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
        </div>
        <Link to="/app/memories/$id" params={{ id: memory.id }} className="block">
          <h4 className="font-display text-xl text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {memory.title}
          </h4>
        </Link>
        {memory.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {memory.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex items-center gap-3">
          {memory.emotion && (
            <span className="text-xs px-2 py-1 bg-surface-3 rounded-full text-foreground/80">
              {memory.emotion}
            </span>
          )}
        </div>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Remove link?</span>
            <button
              onClick={handleDetach}
              disabled={detach.isPending}
              aria-label="Confirm remove link"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-red-400/10 text-red-400 text-xs font-medium px-3 hover:bg-red-400/20 transition-colors"
            >
              {detach.isPending ? "…" : "Yes"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              aria-label="Cancel remove"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white/5 text-muted-foreground text-xs font-medium px-3 hover:bg-white/10 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label={`Remove link between memory "${memory.title}" and this media`}
            className="min-h-[36px] flex items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Unlink className="h-3.5 w-3.5" />
            Remove link
          </button>
        )}
      </div>
    </div>
  );
}

function AttachMemoryView({
  item,
  onCancel,
  existingMemoryIds,
}: {
  item: UIMediaItem;
  onCancel: () => void;
  existingMemoryIds: string[];
}) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMemories({ limit: 20 });
  const allMemories = data?.pages.flatMap((p) => p.items) || [];

  // Filter out memories that are already linked
  const availableMemories = allMemories.filter((m) => !existingMemoryIds.includes(m.id));

  const attach = useAttachMemory();

  return (
    <div className="p-6 rounded-3xl bg-surface-1 border border-border/40 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-display text-xl tracking-tight">Select a Memory from your Vault</h4>
        <button
          onClick={onCancel}
          aria-label="Close memory selection"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
      ) : availableMemories.length === 0 && !hasNextPage ? (
        <div className="text-center py-8">
          <Bookmark className="h-8 w-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {allMemories.length === 0
              ? "You don't have any memories in your vault yet."
              : "All your memories are already linked to this media."}
          </p>
          <Link to="/app/journal" className="text-primary hover:underline text-sm mt-2 block min-h-[44px] py-3">
            Go to Journal to write a new one
          </Link>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableMemories.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  attach.mutate(
                    { memoryId: m.id, libraryId: item.id, mediaType: item.mediaType },
                    {
                      onSuccess: () => {
                        toast.success(`"${m.title}" linked to this media`);
                        onCancel();
                      },
                      onError: () => {
                        toast.error("Failed to link memory");
                      },
                    },
                  );
                }}
                disabled={attach.isPending}
                className="text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group relative min-h-[56px]"
              >
                <h5 className="font-serif text-lg mb-1 truncate group-hover:text-primary transition-colors">
                  {m.title}
                </h5>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <time>
                    {format(
                      m.memoryDate ? new Date(m.memoryDate) : new Date(m.createdAt),
                      "MMM d, yyyy",
                    )}
                  </time>
                  {m.emotion && <span>{m.emotion}</span>}
                </div>
                {attach.isPending && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {hasNextPage && (
            <div className="pt-6 pb-2 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-h-[44px] text-xs text-muted-foreground hover:text-foreground transition-colors px-6 py-2 rounded-full border border-border/40 hover:bg-white/5"
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
