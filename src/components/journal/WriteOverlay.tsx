import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  promptIndex: number;
  timeContext: string;
  prompts?: string[];
  journalText: string;
  isSealing: boolean;
  isDraftSaved: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onTextChange: (text: string) => void;
  onClose: () => void;
  onSeal: () => void;
}

export function WriteOverlay({
  isOpen,
  promptIndex,
  timeContext,
  prompts = [],
  journalText,
  isSealing,
  isDraftSaved,
  textareaRef,
  onTextChange,
  onClose,
  onSeal,
}: Props) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60"
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/10 via-transparent to-primary/5" />

          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            aria-label="Close writing mode"
            onClick={onClose}
            className="absolute top-8 right-8 md:top-12 md:right-12 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="h-6 w-6" />
          </motion.button>

          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              if (journalText.length > 5 && !isSealing) onSeal();
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", damping: 25 }}
            className="w-full max-w-3xl flex flex-col items-center px-6"
            role="dialog"
            aria-modal="true"
            aria-label="Write journal entry"
          >
            <div className="text-primary/70 text-[11px] tracking-[0.25em] uppercase font-bold mb-8">
              {timeContext} · Focus Mode
            </div>
            {isDraftSaved && (
              <div className="mb-6 flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs text-amber-200">
                <AlertCircle className="h-3 w-3" /> Draft restored from your last session
              </div>
            )}
            <h2 className="text-3xl md:text-5xl font-display text-white text-center mb-16 drop-shadow-lg leading-tight">
              &ldquo;{prompts[promptIndex] ?? ""}&rdquo;
            </h2>

            <textarea
              ref={textareaRef}
              value={journalText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Start typing..."
              aria-label="Journal entry text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  if (journalText.length > 5 && !isSealing) onSeal();
                }
              }}
              className="w-full min-h-[250px] bg-transparent border-none outline-none resize-none text-2xl md:text-3xl font-serif text-white/95 placeholder:text-white/20 text-left leading-relaxed"
              style={{ boxShadow: "none" }}
            />

            <AnimatePresence>
              {journalText.length > 5 && (
                <motion.button
                  type="submit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  disabled={isSealing}
                  className="mt-8 flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition-all shadow-[0_0_40px_oklch(0.72_0.18_255/0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSealing ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {isSealing ? "Saving..." : "Save entry"}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
