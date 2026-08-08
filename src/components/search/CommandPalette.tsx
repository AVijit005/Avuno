import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ArrowRight,
  Sparkles,
  Film,
  Tv,
  Gamepad2,
  BookOpen,
  Music2,
  Mic,
  Layers,
  NotebookPen,
  Settings as SettingsIcon,
  Clock,
  Command as CmdKey,
} from "lucide-react";
import { SEARCHABLE_SETTINGS, type MediaItem, type MediaKind } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSearch, useRecentSearches, useTrending } from "@/hooks/use-search";
import { analytics } from "@/lib/analytics";

type Row =
  | {
      kind: "media";
      group: string;
      item: {
        id: string;
        title: string;
        kind: string;
        poster?: string | null;
        creator?: string;
        year?: number;
      };
      onSelect: () => void;
    }
  | {
      kind: "collection";
      group: string;
      col: {
        id: string;
        name: string;
        description?: string;
        accent?: string;
        count?: number;
        category?: string;
      };
      onSelect: () => void;
    }
  | {
      kind: "journal";
      group: string;
      j: {
        id: string;
        title: string;
        excerpt?: string;
        date?: string;
        media?: string;
        mood?: string;
      };
      onSelect: () => void;
    }
  | {
      kind: "setting";
      group: string;
      s: (typeof SEARCHABLE_SETTINGS)[number];
      onSelect: () => void;
    }
  | { kind: "action"; group: string; label: string; onSelect: () => void }
  | { kind: "recent"; group: string; term: string; onSelect: () => void }
  | { kind: "trending"; group: string; title: string; subtitle?: string; onSelect: () => void };

const MEDIA_ICONS: Record<MediaKind, typeof Film> = {
  movie: Film,
  series: Tv,
  anime: Sparkles,
  book: BookOpen,
  manga: BookOpen,
  game: Gamepad2,
  music: Music2,
  podcast: Mic,
  course: BookOpen,
  youtube: Film,
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleQ = (val: string) => {
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(val), 300);
  };

  const { data: searchData } = useSearch({ q: debouncedQ });
  const { data: recentData } = useRecentSearches();
  const { data: trendingData } = useTrending();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (q.trim().length > 2) {
      const t = setTimeout(() => {
        analytics.track("search", { query: q.trim() });
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => inputRef.current?.focus(), 60);
    }
    return () => {
      clearTimeout(focusTimerRef.current);
      clearTimeout(debounceRef.current);
    };
  }, [open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  // Stable identity so the `rows` memo below can depend on it without being
  // invalidated on every render.
  const go = useCallback(
    (path: Record<string, unknown>) => () => {
      close();
      navigate(path as never);
    },
    [close, navigate],
  );

  const rows: { title: string; rows: Row[] }[] = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    if (!term) {
      return [
        {
          title: "Recent searches",
          rows: (recentData || []).map(
            (t) =>
              ({
                kind: "recent",
                group: "Recent searches",
                term: t,
                onSelect: () => setQ(t),
              }) as Row,
          ),
        },
        {
          title: "Trending",
          rows: (trendingData || []).slice(0, 3).map(
            (t) =>
              ({
                kind: "trending",
                group: "Trending",
                title: t.title,
                subtitle: t.subtitle,
                onSelect: go({ to: "/app/media/$id", params: { id: t.id } }),
              }) as Row,
          ),
        },

        {
          title: "Quick actions",
          rows: [
            {
              kind: "action",
              group: "Quick actions",
              label: "Add new media",
              onSelect: go({ to: "/app/library" }),
            },
            {
              kind: "action",
              group: "Quick actions",
              label: "Write a journal entry",
              onSelect: go({ to: "/app/journal" }),
            },
            {
              kind: "action",
              group: "Quick actions",
              label: "Open analytics",
              onSelect: go({ to: "/app/analytics" }),
            },
            {
              kind: "action",
              group: "Quick actions",
              label: "View your Wrapped",
              onSelect: go({ to: "/app/wrapped" }),
            },
          ] as Row[],
        },

        {
          title: "Settings",
          rows: SEARCHABLE_SETTINGS.map(
            (s) => ({ kind: "setting", group: "Settings", s, onSelect: go({ to: s.to }) }) as Row,
          ),
        },
      ];
    }

    const out: { title: string; rows: Row[] }[] = [];

    if (searchData && searchData.items.length > 0) {
      // Group by type
      const groups = new Map<string, typeof searchData.items>();
      for (const item of searchData.items) {
        if (!groups.has(item.type)) groups.set(item.type, []);
        groups.get(item.type)!.push(item);
      }

      const groupLabels: Record<string, string> = {
        movie: "Movies",
        series: "Series",
        anime: "Anime",
        book: "Books",
        manga: "Manga",
        game: "Games",
        music: "Music",
        podcast: "Podcasts",
        collection: "Collections",
        journal: "Journal",
      };

      for (const [type, items] of groups.entries()) {
        const title = groupLabels[type] || type;

        if (type === "collection") {
          out.push({
            title,
            rows: items.slice(0, 4).map(
              (item) =>
                ({
                  kind: "collection",
                  group: title,
                  col: { id: item.id, name: item.title, description: item.subtitle || "" },
                  onSelect: go({ to: "/app/collections/$id", params: { id: item.id } }),
                }) as Row,
            ),
          });
        } else if (type === "journal") {
          out.push({
            title,
            rows: items.map(
              (item) =>
                ({
                  kind: "journal",
                  group: title,
                  j: { id: item.id, title: item.title, excerpt: item.subtitle || "" },
                  onSelect: go({ to: "/app/journal" }),
                }) as Row,
            ),
          });
        } else {
          out.push({
            title,
            rows: items.slice(0, 5).map(
              (item) =>
                ({
                  kind: "media",
                  group: title,
                  item: {
                    id: item.id,
                    title: item.title,
                    kind: type,
                    poster: item.imageUrl || "",
                    creator: item.subtitle,
                  },
                  onSelect: go({ to: "/app/media/$id", params: { id: item.id } }),
                }) as Row,
            ),
          });
        }
      }
    }

    // Still include settings locally since they aren't from backend
    const s = SEARCHABLE_SETTINGS.filter(
      (x) => x.label.toLowerCase().includes(term) || x.hint.toLowerCase().includes(term),
    );
    if (s.length)
      out.push({
        title: "Settings",
        rows: s.map(
          (entry) =>
            ({
              kind: "setting",
              group: "Settings",
              s: entry,
              onSelect: go({ to: entry.to }),
            }) as Row,
        ),
      });

    return out;
  }, [debouncedQ, recentData, trendingData, searchData, go]);

  const flat = useMemo(() => rows.flatMap((g) => g.rows), [rows]);
  useEffect(() => {
    setActive(0);
  }, [q]);

  const activeRef = useRef(active);
  activeRef.current = active;
  const flatRef = useRef(flat);
  flatRef.current = flat;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const currentFlat = flatRef.current;
      const currentActive = activeRef.current;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(currentFlat.length - 1, a + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        currentFlat[currentActive]?.onSelect();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // keep focused row in view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-row="${active}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] grid place-items-start overflow-y-auto bg-background/45 px-4 pt-[12vh] pb-12 backdrop-blur-2xl"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-label="Command Palette"
            initial={{ y: -10, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl"
            style={{
              boxShadow: "0 60px 140px -30px oklch(0 0 0 / 0.75), 0 0 0 1px oklch(1 0 0 / 0.04)",
            }}
          >
            {/* top highlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.45), transparent)",
              }}
            />

            <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={q}
                role="combobox"
                aria-expanded={open}
                aria-controls="search-listbox"
                aria-autocomplete="list"
                aria-activedescendant={flat[active] ? `search-option-${active}` : undefined}
                aria-label="Search your library"
                onChange={(e) => handleQ(e.target.value)}
                placeholder="Search your Avuno…"
                className="flex-1 bg-transparent text-base placeholder:text-muted-foreground/70 focus:outline-none focus-visible:!shadow-none"
              />
              <kbd className="rounded-md border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] tracking-wider text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {flat.length} results found
            </div>
            <div
              ref={listRef}
              id="search-listbox"
              role="listbox"
              aria-label="Search results"
              className="max-h-[60vh] overflow-y-auto p-3"
            >
              {rows.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="Nothing matched"
                  description={`We couldn't find "${q}". Try a creator, year, mood or collection.`}
                />
              ) : (
                rows.map((g, gIdx) => {
                  const offset = rows
                    .slice(0, gIdx)
                    .reduce((acc, prevG) => acc + prevG.rows.length, 0);
                  return (
                    <Section key={g.title} title={g.title}>
                      {g.rows.map((r, rIdx) => {
                        const i = offset + rIdx;
                        const focused = i === active;
                        return (
                          <RowView
                            key={i}
                            index={i}
                            focused={focused}
                            onMouseEnter={() => setActive(i)}
                            onClick={r.onSelect}
                          >
                            <RowContent row={r} />
                          </RowView>
                        );
                      })}
                    </Section>
                  );
                })
              )}
            </div>

            {/* footer hints */}
            <div className="flex items-center justify-between border-t border-border/60 px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="flex items-center gap-3">
                <Hint k="↑↓">Navigate</Hint>
                <Hint k="↵">Open</Hint>
                <Hint k="ESC">Close</Hint>
              </div>
              <div className="inline-flex items-center gap-1">
                <CmdKey className="h-3 w-3" /> K
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-3 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function RowView({
  index,
  focused,
  onClick,
  onMouseEnter,
  children,
}: {
  index: number;
  focused: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={`search-option-${index}`}
      role="option"
      aria-selected={focused}
      data-row={index}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus:outline-none"
    >
      {focused && (
        <motion.span
          layoutId="search-selection"
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(120deg, oklch(0.72 0.18 255 / 0.18), oklch(0.65 0.22 295 / 0.12))",
            boxShadow:
              "inset 0 0 0 1px oklch(0.72 0.18 255 / 0.25), 0 0 30px oklch(0.72 0.18 255 / 0.18)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative flex w-full items-center gap-3">{children}</span>
    </button>
  );
}

function RowContent({ row }: { row: Row }) {
  if (row.kind === "media") {
    const Icon = MEDIA_ICONS[row.item.kind as MediaKind] || Sparkles;
    return (
      <>
        <img
          src={row.item.poster || undefined}
          alt={row.item.title}
          className="h-10 w-7 rounded-md object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">{row.item.title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[row.item.creator, row.item.year, row.item.kind]
              .filter((x) => x != null && x !== "" && x !== "undefined")
              .join(" · ")}
          </div>
        </div>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </>
    );
  }
  if (row.kind === "collection") {
    return (
      <>
        <div
          className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-white/10"
          style={{ background: `linear-gradient(135deg, ${row.col.accent}, transparent)` }}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">{row.col.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[row.col.count ? `${row.col.count} items` : null, row.col.category]
              .filter((x) => x != null && x !== "" && x !== "undefined")
              .join(" · ")}
          </div>
        </div>
        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
      </>
    );
  }
  if (row.kind === "journal") {
    return (
      <>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.05] ring-1 ring-white/10">
          <NotebookPen className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">{row.j.title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[row.j.date, row.j.media]
              .filter((x) => x != null && x !== "" && x !== "undefined")
              .join(" · ")}
          </div>
        </div>
      </>
    );
  }
  if (row.kind === "setting") {
    return (
      <>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.05] ring-1 ring-white/10">
          <SettingsIcon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm">{row.s.label}</div>
          <div className="truncate text-xs text-muted-foreground">{row.s.hint}</div>
        </div>
      </>
    );
  }
  if (row.kind === "recent") {
    return (
      <>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04]">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 text-sm">{row.term}</div>
      </>
    );
  }
  if (row.kind === "trending") {
    return (
      <>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04]">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 text-sm">
          <div>{row.title}</div>
          {row.subtitle && <div className="text-xs text-muted-foreground">{row.subtitle}</div>}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </>
    );
  }
  // action
  return (
    <>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05]">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 text-sm">{row.label}</div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
}

function Hint({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="rounded border border-border/60 bg-background/60 px-1 py-px text-[9px] normal-case tracking-normal text-foreground/80">
        {k}
      </kbd>
      {children}
    </span>
  );
}
