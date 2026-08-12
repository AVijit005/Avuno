import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy } from "lucide-react";

interface CellData {
  day: number;
  hasMedia: boolean;
  hasJournal: boolean;
  hasAchievement: boolean;
  intensity: number;
  mediaCount: number;
  poster: string;
}

interface Props {
  monthIdx: number;
  grid: (CellData | null)[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

export function MonthlyGrid({ monthIdx, grid, selectedDay, onSelectDay }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellIndex = useCallback(
    (day: number | null): number | null => {
      if (day === null) return null;
      const idx = grid.findIndex((c) => c?.day === day);
      return idx >= 0 ? idx : null;
    },
    [grid],
  );

  const focusCell = useCallback((day: number | null) => {
    if (day === null || !gridRef.current) return;
    const buttons = gridRef.current.querySelectorAll<HTMLButtonElement>("[data-day]");
    const target = Array.from(buttons).find((b) => Number(b.dataset.day) === day);
    target?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, cellDay: number) => {
      const idx = getCellIndex(cellDay);
      if (idx === null) return;

      const cols = 7;
      let nextIdx: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIdx = idx + 1;
          break;
        case "ArrowLeft":
          nextIdx = idx - 1;
          break;
        case "ArrowDown":
          nextIdx = idx + cols;
          break;
        case "ArrowUp":
          nextIdx = idx - cols;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelectDay(cellDay);
          return;
        default:
          return;
      }

      if (nextIdx !== null && nextIdx >= 0 && nextIdx < grid.length && grid[nextIdx] !== null) {
        e.preventDefault();
        focusCell(grid[nextIdx]!.day);
      }
    },
    [grid, getCellIndex, focusCell, onSelectDay],
  );

  return (
    <PremiumGlass className="p-6 md:p-8">
      <div
        className="mb-3 grid grid-cols-7 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        role="row"
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center" role="columnheader">
            {d}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          ref={gridRef}
          key={monthIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-7 gap-2"
          role="grid"
        >
          {grid.map((c, i) => {
            if (!c) return <div key={i} className="aspect-square" role="gridcell" aria-hidden />;
            const isSel = selectedDay === c.day;
            return (
              <motion.button
                key={i}
                data-day={c.day}
                onClick={() => onSelectDay(c.day)}
                onKeyDown={(e) => handleKeyDown(e, c.day)}
                onFocus={() => onSelectDay(c.day)}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                role="gridcell"
                aria-selected={isSel}
                aria-label={`${c.day}${c.hasMedia ? ", has media" : ""}${c.hasJournal ? ", journal entry" : ""}${c.hasAchievement ? ", achievement" : ""}`}
                className="group relative aspect-square overflow-hidden rounded-[12px] transition-[box-shadow] duration-400 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:z-20"
                style={{
                  background: c.hasMedia ? "transparent" : "rgba(255,255,255,0.02)",
                  backdropFilter: c.hasMedia ? "none" : "blur(12px)",
                  WebkitBackdropFilter: c.hasMedia ? "none" : "blur(12px)",
                  boxShadow: isSel
                    ? "inset 0 1px 1px rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.2), 0 8px 24px -4px rgba(0,0,0,0.6), 0 0 0 2px oklch(0.72 0.18 255 / 0.8)"
                    : "inset 0 1px 1px rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.2)",
                }}
              >
                {c.hasMedia && (
                  <>
                    <img
                      src={c.poster}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover scale-100 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />
                  </>
                )}
                <div className="absolute inset-0 grid place-items-center z-10">
                  <span
                    className={`text-xs font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${isSel || c.hasMedia ? "text-white" : "text-foreground/90"}`}
                  >
                    {c.day}
                  </span>
                </div>
                {c.hasJournal && (
                  <span
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)] z-10"
                    aria-hidden
                  />
                )}
                {c.hasAchievement && (
                  <Trophy
                    className="absolute left-1.5 top-1.5 h-2.5 w-2.5 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)] z-10"
                    aria-hidden
                  />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-20"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 15%, rgba(255,255,255,0.5) 30%, transparent 45%)",
                  }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-primary/70" />
          media
        </span>
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-rose-300/80" />
          journal
        </span>
        <span className="flex items-center gap-1.5" aria-hidden>
          <Trophy className="h-3 w-3 text-amber-300" />
          achievement
        </span>
      </div>
    </PremiumGlass>
  );
}
