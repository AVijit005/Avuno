// Reflection drawer — opened when a media item is completed.
import { useEffect, useId, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useLibraryStore, snapshotAllItems } from "@/lib/store/libraryStore";
import { cn } from "@/lib/utils";

const MOODS = [
  "🤍 Quiet",
  "🔥 Obsessed",
  "💫 Awe",
  "🌧 Melancholy",
  "🎢 Wild ride",
  "🧠 Thought-provoking",
  "😴 Slow burn",
  "🥲 Tearful",
];

export function ReflectionDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const reflectionId = useId();
  const open = !!id;
  const item = id ? snapshotAllItems().find((m) => m.id === id) : undefined;
  const meta = useLibraryStore((s) => (id ? s.meta[id] : undefined));
  const setReflection = useLibraryStore((s) => s.setReflection);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  const [mood, setMood] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (open) {
      setMood(meta?.mood);
      setText(meta?.reflection ?? "");
      setRating(meta?.rating ?? 0);
      setFav(!!meta?.favorite);
    }
  }, [open, id, meta?.mood, meta?.reflection, meta?.rating, meta?.favorite]);

  function save() {
    if (!id) return;
    setReflection(id, mood, text.trim() || undefined, rating || undefined);
    if (fav !== !!meta?.favorite) toggleFavorite(id);
    toast.success("Reflection saved", { description: item?.title });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg border-border/60 bg-background/95">
        <DialogTitle className="font-display text-2xl tracking-tight">
          What did it leave with you?
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {item?.title}
        </DialogDescription>

        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n === rating ? 0 : n)}
              aria-label={`Rate ${n}`}
              className="press-scale p-1"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition",
                  n <= rating ? "fill-amber-400 text-amber-400" : "text-white/30",
                )}
              />
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={fav}
              onChange={(e) => setFav(e.target.checked)}
              className="h-4 w-4 rounded border-border/60 bg-white/[0.04]"
            />
            Favorite
          </label>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mood</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? undefined : m)}
                aria-label={`Select mood: ${m}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition press-scale",
                  mood === m
                    ? "border-primary/50 bg-primary/15 text-foreground"
                    : "border-border/60 bg-white/[0.03] text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor={reflectionId}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            A paragraph for your future self
          </label>
          <textarea
            id={reflectionId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="What stayed? What surprised you? Who were you while watching this?"
            className="mt-1 w-full resize-none rounded-xl border border-border/60 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/40"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-primary-foreground press-scale"
          >
            Save reflection
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
