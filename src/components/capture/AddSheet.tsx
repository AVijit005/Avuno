import { useEffect, useId, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Film,
  Tv,
  Sparkles,
  BookOpen,
  BookMarked,
  Gamepad2,
  Music2,
  Mic,
  GraduationCap,
  Youtube,
  FileText,
  ArrowLeft,
  Check,
  Search,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { UIMediaKind as MediaKind } from "@/lib/adapters/types";
import { useSearch } from "@/hooks/use-search";
import { useAddToLibrary } from "@/hooks/use-library";
import { useDebounce } from "@/hooks/use-debounce";
import type { MediaStatus } from "@/lib/library";
import { cn } from "@/lib/utils";
import type { SearchResultItem } from "@/lib/api/search";

const TYPES: { kind: MediaKind | "article"; label: string; icon: LucideIcon }[] = [
  { kind: "movie", label: "Movie", icon: Film },
  { kind: "series", label: "Series", icon: Tv },
  { kind: "anime", label: "Anime", icon: Sparkles },
  { kind: "book", label: "Book", icon: BookOpen },
  { kind: "manga", label: "Manga", icon: BookMarked },
  { kind: "game", label: "Game", icon: Gamepad2 },
  { kind: "music", label: "Album", icon: Music2 },
  { kind: "podcast", label: "Podcast", icon: Mic },
  { kind: "course", label: "Course", icon: GraduationCap },
  { kind: "youtube", label: "Video", icon: Youtube },
  { kind: "article", label: "Article", icon: FileText },
];

const STATUS: { value: MediaStatus; label: string; hint: string }[] = [
  { value: "planning", label: "Save for later", hint: "I want to experience this eventually." },
  { value: "in_progress", label: "Starting now", hint: "I'm picking it up today." },
  { value: "completed", label: "Already finished", hint: "Log it into my memory." },
  { value: "paused", label: "Paused", hint: "Begun but set aside." },
];

export function AddSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const addToLibrary = useAddToLibrary();

  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<MediaKind | "article" | null>(null);

  // Search state
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [selectedMedia, setSelectedMedia] = useState<SearchResultItem | null>(null);

  // Metadata state
  const [status, setStatus] = useState<MediaStatus>("planning");
  const [favorite, setFavorite] = useState(false);
  const [reason, setReason] = useState("");

  const { data: searchResults, isLoading: isSearching } = useSearch(
    {
      q: debouncedQuery,
      mode: "media",
      type: kind === "article" ? "youtube" : (kind ?? undefined),
    },
    step === 2 && debouncedQuery.length > 0,
  );

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1);
        setKind(null);
        setQuery("");
        setSelectedMedia(null);
        setStatus("planning");
        setFavorite(false);
        setReason("");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function confirm() {
    if (!selectedMedia || !kind) return;

    const storeKind: MediaKind = kind === "article" ? "youtube" : kind;
    const backendStatus = status === "in_progress" ? "WATCHING" : status.toUpperCase();

    try {
      await addToLibrary.mutateAsync({
        mediaType: storeKind,
        mediaId: selectedMedia.id,
        status: backendStatus,
      });

      toast.success("Added to your library", {
        description: selectedMedia.title,
      });
      onOpenChange(false);
      setTimeout(() => navigate({ to: "/app/media/$id", params: { id: selectedMedia.id } }), 60);
    } catch (err) {
      toast.error("Failed to add media", {
        description: "It might already be in your library or there was an error.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border/60 bg-background/95 p-0">
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Step {step} of 3
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={cn(
                    "h-1 w-6 rounded-full transition",
                    n <= step ? "bg-primary" : "bg-white/10",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="px-6 pb-6 pt-4">
            <DialogTitle className="font-display text-2xl tracking-tight">
              Select Media Type
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose the kind of media you want to add to your library.
            </DialogDescription>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TYPES.map(({ kind: k, label, icon: Icon }) => (
                <button
                  key={k}
                  onClick={() => {
                    setKind(k);
                    setStep(2);
                  }}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-white/[0.02] px-3 py-4 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground press-scale"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 pb-6 pt-4 flex flex-col h-[60vh] max-h-[500px]">
            <DialogTitle className="font-display text-2xl tracking-tight">
              Search Catalog
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground shrink-0">
              Find the exact item you're looking for.
            </DialogDescription>

            <div className="mt-5 relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title..."
                autoFocus
                className="w-full rounded-xl border border-border/60 bg-white/[0.03] pl-10 pr-3 py-3 text-sm outline-none focus:border-primary/40"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-2">
              {debouncedQuery.length > 0 && searchResults?.items.length === 0 && !isSearching && (
                <div className="text-center text-sm text-muted-foreground py-10">
                  No results found.
                </div>
              )}

              {searchResults?.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedMedia(item);
                    setStep(3);
                  }}
                  className="w-full flex items-start gap-4 rounded-xl border border-border/60 bg-white/[0.02] p-3 text-left transition hover:border-primary/40 hover:bg-white/[0.06] press-scale"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-16 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded bg-white/5 text-muted-foreground">
                      <Film className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {item.subtitle || (item.metadata?.releaseYear as string) || "Unknown Year"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 shrink-0 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 pb-6 pt-4">
            <DialogTitle className="font-display text-2xl tracking-tight">
              Where does it belong?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedMedia?.title}
            </DialogDescription>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STATUS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition press-scale",
                    status === s.value
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/60 bg-white/[0.02] hover:border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{s.label}</div>
                    {status === s.value && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{s.hint}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                disabled={addToLibrary.isPending}
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <button
                disabled={addToLibrary.isPending}
                onClick={confirm}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40 press-scale"
              >
                {addToLibrary.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add to Avuno
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
