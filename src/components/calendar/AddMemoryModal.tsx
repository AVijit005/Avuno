import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Film, Tv, BookOpen, BookImage, Gamepad2, Music, Mic, GraduationCap, PlaySquare, Sparkles,
} from "lucide-react";

import { toast } from "sonner";
import { useCreateJournalEntry } from "@/hooks/use-journal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: number | null;
  monthName: string;
  currentYear: number;
}

const TYPE_TO_MOOD: Record<string, string> = {
  movies: "Inspired", anime: "Excited", series: "Relaxed", books: "Thoughtful",
  manga: "Excited", games: "Excited", music: "Emotional", podcasts: "Thoughtful",
  courses: "Inspired", youtube: "Relaxed",
};

const mediaTypes = [
  { id: "movies", icon: Film, label: "Movies", color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "anime", icon: Sparkles, label: "Anime", color: "text-pink-400", bg: "bg-pink-500/10" },
  { id: "series", icon: Tv, label: "Series", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { id: "books", icon: BookOpen, label: "Books", color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "manga", icon: BookImage, label: "Manga", color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "games", icon: Gamepad2, label: "Games", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "music", icon: Music, label: "Music", color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "podcasts", icon: Mic, label: "Podcasts", color: "text-violet-400", bg: "bg-violet-500/10" },
  { id: "courses", icon: GraduationCap, label: "Courses", color: "text-teal-400", bg: "bg-teal-500/10" },
  { id: "youtube", icon: PlaySquare, label: "YouTube", color: "text-red-400", bg: "bg-red-500/10" },
];

export function AddMemoryModal({ isOpen, onClose, selectedDay, monthName, currentYear }: Props) {
  const [savingType, setSavingType] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const createEntry = useCreateJournalEntry();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        
        // Focus trap
        if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          
          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSelect = async (type: string) => {
    setSavingType(type);
    try {
      await createEntry.mutateAsync({
        content: `Started a new ${type} entry on ${monthName} ${selectedDay ?? ""}, ${currentYear}.`,
        mood: TYPE_TO_MOOD[type] ?? "Reflective",
      });
      toast.success("Memory logged for this day.");
    } catch {
      toast.error("Could not log memory. Try again.");
    } finally {
      setSavingType(null);
      onClose();
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-[32px] saturate-150"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="relative w-full max-w-3xl z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <PremiumGlass className="overflow-hidden p-0 rounded-[2.5rem]" glow="oklch(0.7 0.1 250)">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
              <div className="relative p-8 md:p-12">
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute right-6 top-6 rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="mb-10 text-center">
                  <h2 id="modal-title" className="font-display text-4xl tracking-tight text-foreground/90">Log a memory</h2>
                  <p className="mt-2 text-sm text-muted-foreground/80">
                    {selectedDay ? `${monthName} ${selectedDay}, ${currentYear}` : "Select a medium to chronicle"}
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-8 gap-x-4">
                  {mediaTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ y: -6, scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      disabled={savingType === type.id}
                      onClick={() => handleSelect(type.id)}
                      className="group flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait"
                    >
                      <div className={`relative flex h-[72px] w-[72px] sm:h-[84px] sm:w-[84px] items-center justify-center rounded-[1.5rem] sm:rounded-[1.75rem] border border-white/[0.06] ${type.bg} transition-all duration-500 group-hover:shadow-[0_0_40px_-10px_currentColor] group-hover:border-white/[0.2] ${type.color} overflow-hidden shadow-xl`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <type.icon className="h-7 w-7 sm:h-8 sm:w-8 relative z-10 drop-shadow-md transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="text-[11px] sm:text-xs font-medium text-foreground/60 tracking-wide transition-colors duration-300 group-hover:text-foreground/90">
                        {type.label}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </PremiumGlass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}



