import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemories } from "@/hooks/use-journal";
import { Lock, Globe, BookOpen, Quote, Image as ImageIcon, Calendar } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/app/memories/")({
  component: MemoryVault,
});

function MemoryVault() {
  const { data, isLoading, isError } = useMemories({ limit: 50 });

  const memories = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 max-w-5xl mx-auto space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight">
          Memory Vault
        </h1>
        <p className="text-xl text-muted-foreground font-light max-w-xl">Things I chose to keep.</p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-foreground/[0.05] ring-1 ring-foreground/[0.04] animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-red-400 p-4 rounded-xl bg-red-400/10">
          Failed to load your memory vault.
        </div>
      )}

      {!isLoading && !isError && memories.length === 0 && (
        <div className="text-center py-24 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-subtle text-muted-foreground mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display text-foreground">No memories preserved yet.</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Memories are intentionally preserved moments. You can create them from your journal
            entries.
          </p>
          <div className="mt-8">
            <Link
              to="/app/journal"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-[background-color,transform,box-shadow] duration-[140ms] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-[1px] active:scale-[0.98]"
            >
              Go to Journal
            </Link>
          </div>
        </div>
      )}

      {!isLoading && memories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <Link
              key={memory.id}
              to="/app/memories/$id"
              params={{ id: memory.id }}
              className="block group"
            >
              <div className="h-full p-6 rounded-3xl glass-elevated card-interactive transition-all duration-[140ms] active:scale-[0.98] hover:-translate-y-[1px] flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-display text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2">
                    {memory.title}
                  </h3>
                  <div className="text-muted-foreground shrink-0 mt-1">
                    {memory.isPrivate ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <time>
                      {format(new Date(memory.memoryDate || memory.createdAt), "MMM d, yyyy")}
                    </time>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                    {memory.journalId && (
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="Journal Evidence"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Journal</span>
                      </div>
                    )}
                    {memory.quoteId && (
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="Quote Evidence"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span>Quote</span>
                      </div>
                    )}
                    {(memory.mediaCount > 0 || (memory.mediaIds && memory.mediaIds.length > 0)) && (
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="Media Evidence"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
