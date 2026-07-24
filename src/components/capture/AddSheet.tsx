// Universal capture flow. Frontend-only, writes into useLibraryStore.
import { useEffect, useState } from "react";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { UIMediaItem as MediaItem, UIMediaKind as MediaKind } from "@/lib/adapters/types";
import { useLibraryStore } from "@/lib/store/libraryStore";
import type { MediaStatus } from "@/lib/library";
import { cn } from "@/lib/utils";

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

const DEFAULT_POSTER =
  "";

export function AddSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const addCustomItem = useLibraryStore((s) => s.addCustomItem);

  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<MediaKind | "article" | null>(null);
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [poster, setPoster] = useState("");
  const [status, setStatus] = useState<MediaStatus>("planning");
  const [favorite, setFavorite] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      // Reset after close animation.
      const t = setTimeout(() => {
        setStep(1);
        setKind(null);
        setTitle("");
        setCreator("");
        setYear(String(new Date().getFullYear()));
        setPoster("");
        setStatus("planning");
        setFavorite(false);
        setReason("");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const canConfirm = title.trim().length > 0 && kind;

  function confirm() {
    if (!canConfirm || !kind) return;
    const id = `u_${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40)}_${Date.now().toString(36)}`;
    const yearNum = Number(year) || new Date().getFullYear();
    const storeKind: MediaKind = kind === "article" ? "youtube" : kind;
    const item: MediaItem = {
      id,
      mediaId: id,
      title: title.trim(),
      kind: storeKind,
      year: yearNum,
      poster: poster.trim() || DEFAULT_POSTER,
      backdrop: null,
      rating: 0,
      progress: 0,
      progressLabel: null,
      status:
        status === "completed"
          ? "completed"
          : status === "planning"
            ? "planning"
            : status === "paused"
              ? "paused"
              : "in_progress",
      genres: [],
      runtime: null,
      creator: creator.trim() || null,
      synopsis: reason.trim() || "Added by you.",
      accent: null,
      favorite: favorite,
      slug: id,
      mediaType: storeKind,
      lastInteractionAt: new Date().toISOString(),
      rewatchCount: 0,
    };
    addCustomItem(item, {
      status,
      favorite: favorite || undefined,
      reasonSaved: reason.trim() || undefined,
      addedAt: "Just now",
      ...(status === "completed" ? { completedAt: "Today", progress: 100 } : {}),
    });
    toast.success("Added to Chronicle", { description: title.trim() });
    onOpenChange(false);
    setTimeout(() => navigate({ to: "/app/media/$id", params: { id } }), 60);
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
              What story are you bringing into your life?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Pick the kind of media. You can always add more later.
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
          <div className="px-6 pb-6 pt-4">
            <DialogTitle className="font-display text-2xl tracking-tight">
              Tell Chronicle about it
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Just the basics — you can refine later.
            </DialogDescription>
            <div className="mt-5 space-y-3">
              <Field
                label="Title"
                value={title}
                onChange={setTitle}
                placeholder="e.g. Severance"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Creator / Author"
                  value={creator}
                  onChange={setCreator}
                  placeholder="optional"
                />
                <Field
                  label="Year"
                  value={year}
                  onChange={setYear}
                  placeholder={String(new Date().getFullYear())}
                />
              </div>
              <Field
                label="Poster URL"
                value={poster}
                onChange={setPoster}
                placeholder="optional · jpg/png"
              />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <button
                disabled={!title.trim()}
                onClick={() => setStep(3)}
                className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40 press-scale"
              >
                Continue
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
              This decides where it lives in your library.
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
            <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="h-4 w-4 rounded border-border/60 bg-white/[0.04]"
              />
              Mark as a favorite
            </label>
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Why are you saving this?
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="optional · one line is plenty"
                className="mt-1 w-full resize-none rounded-xl border border-border/60 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/40"
              />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <button
                disabled={!canConfirm}
                onClick={confirm}
                className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40 press-scale"
              >
                Add to Chronicle
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="mt-1 w-full rounded-xl border border-border/60 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/40"
      />
    </div>
  );
}
