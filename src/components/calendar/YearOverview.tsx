import { motion } from "motion/react";
import type { CalendarMonth } from "@/lib/types/calendar";

interface Props {
  months?: CalendarMonth[];
  monthIdx: number;
  onSelectMonth: (idx: number) => void;
}

export function YearOverview({ monthIdx, onSelectMonth, months = [] }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {months.map((m: CalendarMonth) => {
        const active = m.index === monthIdx;
        return (
          <motion.button
            key={m.index}
            onClick={() => onSelectMonth(m.index)}
            whileHover={{ y: -3 }}
            className={`glass group relative overflow-hidden rounded-2xl p-4 text-left transition ${active ? "ring-2 ring-primary/60" : ""}`}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-50 transition group-hover:opacity-80"
              style={{ background: m.accent }}
            />
            <div className="relative">
              <div className="grid grid-cols-2 gap-1">
                {m.collage.map((src: string, i: number) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-md">
                    <img src={src} alt="" className="h-full w-full object-cover opacity-80" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-display text-xl tracking-tight">{m.short}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.mediaCount} · {m.journalCount}j
                </div>
              </div>
              <div className="mt-1 truncate text-xs" style={{ color: m.accent }}>
                {m.favorite}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

