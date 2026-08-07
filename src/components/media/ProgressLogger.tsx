// Progress logger sheet. Writes to library store + opens reflection when hitting 100%.
import { useEffect, useId, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLibraryStore, snapshotAllItems } from "@/lib/store/libraryStore";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

function suggestedLabel(kind: string | undefined): string {
  switch (kind) {
    case "series":
    case "anime":
      return "e.g. Ep 7";
    case "book":
    case "manga":
      return "e.g. Page 142 / 360";
    case "game":
      return "e.g. Act II — Boss";
    case "podcast":
      return "e.g. Ep #412";
    case "music":
      return "e.g. Track 8";
    case "course":
      return "e.g. Lecture 4";
    default:
      return "Where are you?";
  }
}

export function ProgressLogger({ id, onClose }: { id: string | null; onClose: () => void }) {
  const open = !!id;
  const item = id ? snapshotAllItems().find((m) => m.id === id) : undefined;
  const meta = useLibraryStore((s) => (id ? s.meta[id] : undefined));
  const logProgress = useLibraryStore((s) => s.logProgress);
  const { openReflection } = useMediaActions();

  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  const completionId = useId();
  const labelId = useId();
  const noteId = useId();

  useEffect(() => {
    if (open) {
      setPct(meta?.progress ?? item?.progress ?? 0);
      setLabel(meta?.progressLabel ?? "");
      setNote("");
    }
  }, [open, id, meta?.progress, meta?.progressLabel, item?.progress]);

  function save() {
    if (!id) return;
    logProgress(id, pct, note.trim() || undefined, label.trim() || undefined);
    toast.success(pct >= 100 ? "Marked complete" : `Logged ${pct}%`, { description: item?.title });
    onClose();
    if (pct >= 100) setTimeout(() => openReflection(id), 80);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-border/60 bg-background/95">
        <DialogTitle className="font-display text-xl tracking-tight">Log progress</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {item?.title ?? ""}
        </DialogDescription>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <label htmlFor={completionId} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Completion
            </label>
            <span className="font-display text-2xl tabular-nums">{pct}%</span>
          </div>
          <input
            id={completionId}
            type="range"
            min={0}
            max={100}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="mt-2 w-full accent-[oklch(0.72_0.18_255)]"
          />
        </div>

        <div className="mt-4">
          <label htmlFor={labelId} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Where are you
          </label>
          <input
            id={labelId}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={suggestedLabel(item?.kind)}
            className="mt-1 w-full rounded-xl border border-border/60 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/40"
          />
        </div>

        <div className="mt-3">
          <label htmlFor={noteId} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Note
          </label>
          <textarea
            id={noteId}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="optional · how was this session?"
            className="mt-1 w-full resize-none rounded-xl border border-border/60 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-primary/40"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-primary-foreground press-scale"
          >
            Save progress
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
