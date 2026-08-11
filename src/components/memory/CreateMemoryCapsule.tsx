import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Globe, Image as ImageIcon, Calendar } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { toast } from "sonner";
import { useCreateMemory } from "@/hooks/use-journal";
import type { UIJournalEntry } from "@/lib/adapters/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Optional context to pre-fill the capsule with evidence.
   */
  sourceJournal?: UIJournalEntry;
  // sourceQuote?: UIQuote; // If quotes are added later
  // defaultMediaIds?: string[];
}

export function CreateMemoryCapsule({ isOpen, onClose, sourceJournal }: Props) {
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createMemory } = useCreateMemory();

  const handlePreserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMemory({
        title,
        isPrivate,
        journalId: sourceJournal?.id,
      });
      toast.success("Memory preserved.");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to preserve memory";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title.trim() && !window.confirm("Abandon this memory? Your title will be lost.")) {
      return;
    }
    onClose();
  };

  if (typeof document === "undefined") return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(32px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 p-4 md:p-6"
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/10 via-transparent to-primary/5" />

          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-label="Close"
            onClick={handleClose}
            className="absolute top-6 right-6 md:top-12 md:right-12 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="h-6 w-6" />
          </motion.button>

          <motion.form
            onSubmit={handlePreserve}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
            className="w-full max-w-2xl relative"
            role="dialog"
            aria-label="Preserve as Memory"
          >
            {/* The Capsule */}
            <PremiumGlass
              variant="strong"
              className="p-8 md:p-12 overflow-hidden shadow-2xl relative border-white/20"
              glow="oklch(0.7 0.18 200 / 0.3)"
            >
              {/* Subtle ambient light inside the capsule */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="text-primary/70 text-[10px] tracking-[0.25em] uppercase font-bold mb-6 flex items-center justify-between">
                  <span>Preserve this moment</span>
                  {sourceJournal && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(sourceJournal.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <input
                  autoFocus
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to remember?"
                  className="w-full bg-transparent border-none outline-none text-3xl md:text-5xl font-display tracking-tight text-white/95 placeholder:text-white/20 mb-8"
                />

                {sourceJournal && (
                  <div className="mb-8 rounded-2xl bg-black/20 border border-white/5 p-5">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                      From your journal
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3 italic">
                      "{sourceJournal.content}"
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-white transition-colors"
                      aria-label="Toggle Privacy"
                    >
                      {isPrivate ? (
                        <>
                          <Lock className="h-4 w-4 text-primary" />
                          <span>For your eyes only</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4" />
                          <span>Visible on profile</span>
                        </>
                      )}
                    </button>

                    {/* Placeholder for Media Attachment UI (Not yet supported by UI logic in this phase) */}
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/30 cursor-not-allowed"
                      title="Media attachment API is ready in backend, but frontend integration is Phase 4C-4"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Attach Media</span>
                    </button>
                  </div>

                  <PremiumButton
                    type="submit"
                    variant="primary"
                    disabled={!title.trim() || isSubmitting}
                    className="w-full sm:w-auto shadow-[0_0_24px_oklch(0.72_0.18_255/0.4)]"
                  >
                    {isSubmitting ? "Preserving..." : "Preserve Memory"}
                  </PremiumButton>
                </div>
              </div>
            </PremiumGlass>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
