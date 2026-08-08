import { motion, AnimatePresence } from "motion/react";
import { CloudSun, Plus, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

export interface DailyMemoryItem {
  icon: LucideIcon;
  label: string;
  title: string;
  note: string;
}

interface Props {
  monthName: string;
  monthIdx: number;
  selectedDay: number | null;
  currentYear: number;
  monthAccent: string;
  items: DailyMemoryItem[];
  mood?: string;
  weather?: string;
  onAddMemory: () => void;
}

export function DailyMemoryPanel({
  monthName,
  monthIdx,
  selectedDay,
  currentYear,
  monthAccent,
  items,
  mood = "Awe",
  weather = "Clear",
  onAddMemory,
}: Props) {
  return (
    <PremiumGlass className="p-6 md:p-8" glow={monthAccent}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${monthIdx}-${selectedDay ?? "none"}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {monthName} {selectedDay ?? "—"}, {currentYear}
          </div>
          <div className="mt-2 font-display text-3xl tracking-tight">
            {selectedDay ? "An evening to remember" : "Pick a day"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedDay
              ? "What happened on this day, through stories."
              : "Tap any cell to see its memories."}
          </p>

          {selectedDay && items.length > 0 && (
            <div className="mt-6 space-y-2">
              {items.map((t) => (
                <PremiumGlass
                  key={t.label}
                  variant="subtle"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-xl p-3 cursor-pointer press-scale relative z-10"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06]">
                    <t.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t.label}
                    </div>
                    <div className="truncate text-sm">{t.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{t.note}</div>
                </PremiumGlass>
              ))}
            </div>
          )}

          {selectedDay && items.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground/70">
              No stories logged for this day yet.
            </p>
          )}

          {selectedDay && (
            <>
              <PremiumGlass
                variant="subtle"
                role="button"
                tabIndex={0}
                aria-label="Add memory"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 p-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer press-scale relative z-10"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddMemory}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAddMemory();
                  }
                }}
              >
                <Plus className="h-3 w-3" /> Add memory
              </PremiumGlass>
              <div className="mt-5 flex flex-col xl:flex-row items-center gap-3">
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="group flex w-full flex-1 items-center gap-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 transition-colors hover:bg-white/[0.04] hover:border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  aria-label={`Mood: ${mood}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 shadow-[0_0_12px_-2px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-110">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-0.5">
                      Mood
                    </span>
                    <span className="font-display text-lg tracking-tight text-foreground/90 leading-none">
                      {mood}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="group flex w-full flex-1 items-center gap-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 transition-colors hover:bg-white/[0.04] hover:border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  aria-label={`Weather: ${weather}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20 shadow-[0_0_12px_-2px_rgba(14,165,233,0.3)] transition-transform duration-300 group-hover:scale-110">
                    <CloudSun className="h-4 w-4 text-sky-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-0.5">
                      Weather
                    </span>
                    <span className="font-display text-lg tracking-tight text-foreground/90 leading-none">
                      {weather}
                    </span>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </PremiumGlass>
  );
}
