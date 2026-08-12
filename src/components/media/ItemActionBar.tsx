import { memo, useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  Heart,
  Play,
  Pause,
  Check,
  RotateCcw,
  Archive,
  Bookmark,
  NotebookPen,
  Plus,
  Trash2,
  MoreHorizontal,
  Quote,
  Sparkles,
  ListPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { useLibraryStore } from "@/lib/store/libraryStore";
import { useMediaActions } from "@/lib/store/MediaActionsContext";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";
import { t as motionT } from "@/lib/motion";
import { useShortcuts } from "@/lib/shortcuts";
import { QuickPromptDialog } from "@/components/media/QuickPromptDialog";
import { useLibrarySync } from "@/lib/store/useLibrarySync";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface Props {
  id: string;
  title: string;
  variant?: "inline" | "overlay" | "hero";
  className?: string;
}

interface Verb {
  key: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
  primary?: boolean;
  danger?: boolean;
}

function ItemActionBarImpl({ id, title, variant = "inline", className }: Props) {
  const navigate = useNavigate();
  const meta = useLibraryStore((s) => s.meta[id]);
  const collections = useLibraryStore((s) => s.collections);
  const { openProgress, openReflection } = useMediaActions();
  const [bookmarked, setBookmarked] = useState(() => isBookmarked("media", id));
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const reduced = useReducedMotion();
  const heroMotion =
    variant === "hero" && !reduced
      ? {
          whileHover: { scale: 1.03, transition: motionT.spring },
          whileTap: { scale: 0.96, transition: motionT.spring },
        }
      : {};

  const status = meta?.status;
  const fav = !!meta?.favorite;

  const { syncStatus, syncFavorite, syncRewatch } = useLibrarySync();

  // Each handler writes locally for instant feedback, then persists. These
  // were previously localStorage-only, so every status change and favourite
  // was lost on logout or on another device.
  const s = useCallback(
    (next: typeof status, msg: string) => {
      if (!next) return;
      useLibraryStore.getState().setStatus(id, next);
      void syncStatus(id, next);
      toast.success(msg, { description: title });
    },
    [id, title, syncStatus],
  );

  const handleToggleFavorite = useCallback(() => {
    const nextFav = !fav;
    useLibraryStore.getState().toggleFavorite(id);
    void syncFavorite(id, nextFav);
    toast(nextFav ? "Favorited" : "Removed from favorites", { description: title });
  }, [id, title, fav, syncFavorite]);

  const handleToggleBookmark = useCallback(() => {
    const v = toggleBookmark({ kind: "media", refId: id, title, to: `/app/media/${id}` });
    setBookmarked(v);
    toast(v ? "Bookmarked" : "Bookmark removed");
  }, [id, title]);

  useShortcuts(variant === "hero" ? { f: handleToggleFavorite, b: handleToggleBookmark } : {});

  const verbs = useMemo<Verb[]>(() => {
    if (!status)
      return [
        {
          key: "plan",
          label: "Save to Planning",
          icon: Plus,
          run: () => s("planning", "Saved to Planning"),
          primary: true,
        },
        {
          key: "start",
          label: "Start now",
          icon: Play,
          run: () => s("in_progress", "Journey started"),
        },
      ];
    const v: Verb[] = [];
    if (status === "planning") {
      v.push({
        key: "start",
        label: "Start journey",
        icon: Play,
        run: () => s("in_progress", "Journey started"),
        primary: true,
      });
      v.push({
        key: "pause",
        label: "Move to Paused",
        icon: Pause,
        run: () => s("paused", "Moved to Paused"),
      });
    }
    if (status === "in_progress" || status === "rewatching") {
      v.push({
        key: "log",
        label: "Log progress",
        icon: Sparkles,
        run: () => openProgress(id),
        primary: true,
      });
      v.push({ key: "pause", label: "Pause", icon: Pause, run: () => s("paused", "Paused") });
      v.push({
        key: "done",
        label: "Complete",
        icon: Check,
        run: () => {
          s("completed", "Marked complete");
          timeoutRef.current = setTimeout(() => openReflection(id), 60);
        },
      });
    }
    if (status === "paused") {
      v.push({
        key: "resume",
        label: "Resume",
        icon: Play,
        run: () => s("in_progress", "Resumed"),
        primary: true,
      });
      v.push({ key: "drop", label: "Drop", icon: Trash2, run: () => s("dropped", "Dropped") });
      v.push({
        key: "done",
        label: "Mark complete",
        icon: Check,
        run: () => {
          s("completed", "Marked complete");
          timeoutRef.current = setTimeout(() => openReflection(id), 60);
        },
      });
    }
    if (status === "completed") {
      v.push({
        key: "rewatch",
        label: "Rewatch",
        icon: RotateCcw,
        run: () => {
          useLibraryStore.getState().incrementRewatch(id);
          void syncRewatch(id);
          toast.success("Rewatch started", { description: title });
        },
        primary: true,
      });
      v.push({
        key: "reflect",
        label: "Reflect",
        icon: NotebookPen,
        run: () => openReflection(id),
      });
      v.push({
        key: "archive",
        label: "Archive",
        icon: Archive,
        run: () => s("archived", "Archived"),
      });
    }
    if (status === "dropped") {
      v.push({
        key: "restart",
        label: "Restart",
        icon: Play,
        run: () => s("in_progress", "Restarted"),
        primary: true,
      });
      v.push({
        key: "archive",
        label: "Archive",
        icon: Archive,
        run: () => s("archived", "Archived"),
      });
    }
    if (status === "archived") {
      v.push({
        key: "restore",
        label: "Restore",
        icon: RotateCcw,
        run: () => s("in_progress", "Restored"),
        primary: true,
      });
    }
    return v;
  }, [status, id, title, s, openProgress, openReflection, syncRewatch]);

  const primary = verbs.filter((v) => v.primary);
  const secondary = verbs.filter((v) => !v.primary);

  // Style per variant
  const wrap = cn(
    variant === "overlay" &&
      "flex w-full items-center justify-between gap-1 rounded-full glass-subtle bg-black/40 p-1.5 shadow-[var(--shadow-glass)] ring-1 ring-white/10",
    variant === "hero" && "flex flex-wrap items-center gap-2",
    variant === "inline" && "flex items-center gap-1.5",
    className,
  );

  return (
    <div className={wrap} onClick={(e) => e.stopPropagation()}>
      {primary.map((v) => (
        <motion.button
          key={v.key}
          onClick={v.run}
          title={v.label}
          {...heroMotion}
          className={cn(
            "press-scale overflow-hidden min-h-0 min-w-0 transition-[transform,background-color,color,box-shadow] duration-300 ease-out",
            variant === "overlay"
              ? "flex aspect-square flex-1 items-center justify-center rounded-full bg-white/[0.10] text-white ring-1 ring-white/15 hover:-translate-y-[2px] hover:bg-white hover:text-black hover:shadow-[0_8px_16px_-4px_var(--primary)]"
              : "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-medium text-primary-foreground",
            variant === "hero" ? "px-4 py-2 text-sm" : variant === "inline" ? "px-3 py-1.5" : "",
          )}
        >
          <v.icon
            className={cn("shrink-0", variant === "overlay" ? "h-3.5 w-3.5" : "h-3.5 w-3.5")}
          />
          {variant !== "overlay" && <span>{v.label}</span>}
        </motion.button>
      ))}

      <motion.button
        onClick={handleToggleFavorite}
        aria-label="Favorite"
        aria-pressed={fav}
        {...heroMotion}
        className={cn(
          "press-scale shrink-0 min-h-0 min-w-0 overflow-hidden transition-[transform,background-color,box-shadow] duration-300 ease-out",
          variant === "overlay"
            ? "flex aspect-square flex-1 items-center justify-center rounded-full ring-1 ring-white/10 hover:-translate-y-[2px] hover:shadow-[0_8px_16px_-4px_var(--primary)]"
            : "grid h-8 w-8 place-items-center rounded-full ring-1 ring-white/10",
          variant === "hero" && "tap-target",
          fav
            ? variant === "overlay"
              ? "bg-rose-500/30 text-rose-300 hover:bg-rose-500/40 hover:ring-rose-500/50"
              : "bg-rose-500/20 text-rose-300"
            : variant === "overlay"
              ? "bg-white/[0.06] text-white hover:bg-white/[0.15] hover:ring-white/20"
              : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.15] hover:text-foreground",
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
      </motion.button>

      <motion.button
        onClick={handleToggleBookmark}
        aria-label="Bookmark"
        aria-pressed={bookmarked}
        {...heroMotion}
        className={cn(
          "press-scale shrink-0 min-h-0 min-w-0 overflow-hidden transition-[transform,background-color,box-shadow] duration-300 ease-out",
          variant === "overlay"
            ? "flex aspect-square flex-1 items-center justify-center rounded-full ring-1 ring-white/10 hover:-translate-y-[2px] hover:shadow-[0_8px_16px_-4px_var(--primary)]"
            : "grid h-8 w-8 place-items-center rounded-full ring-1 ring-white/10",
          variant === "hero" && "tap-target",
          bookmarked
            ? variant === "overlay"
              ? "bg-primary/30 text-primary-foreground hover:bg-primary/40 hover:ring-primary/50"
              : "bg-primary/15 text-primary"
            : variant === "overlay"
              ? "bg-white/[0.06] text-white hover:bg-white/[0.15] hover:ring-white/20"
              : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.15] hover:text-foreground",
        )}
      >
        <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current")} />
      </motion.button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            aria-label="More actions"
            {...heroMotion}
            className={cn(
              "press-scale shrink-0 min-h-0 min-w-0 overflow-hidden transition-[transform,background-color,color,box-shadow] duration-300 ease-out",
              variant === "overlay"
                ? "flex aspect-square flex-1 items-center justify-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/10 hover:-translate-y-[2px] hover:bg-white/[0.15] hover:ring-white/20 hover:shadow-[0_8px_16px_-4px_oklch(0.72_0.18_255/0.3)]"
                : "grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-muted-foreground ring-1 ring-white/10 hover:bg-white/[0.15] hover:text-foreground",
              variant === "hero" && "tap-target",
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {secondary.map((v) => (
            <DropdownMenuItem
              key={v.key}
              onSelect={v.run}
              className={cn(v.danger && "text-rose-300 focus:text-rose-200")}
            >
              <v.icon className="mr-2 h-4 w-4" />
              {v.label}
            </DropdownMenuItem>
          ))}
          {secondary.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onSelect={() => navigate({ to: "/app/journal" })}>
            <NotebookPen className="mr-2 h-4 w-4" />
            Add journal entry
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setQuoteOpen(true);
            }}
          >
            <Quote className="mr-2 h-4 w-4" />
            Save a quote
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListPlus className="mr-2 h-4 w-4" />
              Add to collection
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              {collections.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">No collections yet</div>
              )}
              {collections.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => {
                    useLibraryStore.getState().toggleCollectionItem(c.id, id);
                    toast.success(
                      c.itemIds?.includes(id) ? `Removed from ${c.name}` : `Added to ${c.name}`,
                    );
                  }}
                >
                  {c.itemIds?.includes(id) ? (
                    <Check className="mr-2 h-4 w-4 text-primary" />
                  ) : (
                    <span className="mr-2 inline-block h-4 w-4" />
                  )}
                  {c.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setCollectionOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New collection…
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {status && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  useLibraryStore.getState().removeItem(id);
                  toast("Removed from library", { description: title });
                }}
                className="text-rose-300 focus:text-rose-200"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from library
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <QuickPromptDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        title={`Save a quote from ${title}`}
        placeholder="Type or paste the quote…"
        confirmLabel="Save quote"
        multiline
        onConfirm={(text) => {
          useLibraryStore.getState().addUserQuote(text, { id, title });
          toast.success("Quote saved", { description: title });
        }}
      />
      <QuickPromptDialog
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
        title="New collection"
        placeholder="Collection name…"
        confirmLabel="Create"
        onConfirm={(name) => {
          const cid = useLibraryStore.getState().createCollection(name);
          useLibraryStore.getState().toggleCollectionItem(cid, id);
          toast.success(`Added to ${name}`);
        }}
      />
    </div>
  );
}

export const ItemActionBar = memo(ItemActionBarImpl);
