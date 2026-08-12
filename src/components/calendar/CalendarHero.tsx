import { motion } from "motion/react";
import { CloudSun, ChevronLeft, ChevronRight, ChevronsUp } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { CountUp } from "@/components/analytics/AnalyticsKit";
import { useCalendar, useStreaks } from "@/hooks/use-analytics";

interface Props {
  currentYear: number;
  yearOffset: number;
  onChangeYear: (offset: number) => void;
  onToday?: () => void;
  isAtToday?: boolean;
}

export function CalendarHero({ currentYear, yearOffset, onChangeYear, onToday, isAtToday }: Props) {
  const { data: calendarData } = useCalendar(currentYear);
  const { data: streakData } = useStreaks();
  const entries = calendarData?.entries ?? [];
  const totalStories = entries.reduce((sum, e) => sum + e.completedCount, 0);
  const totalJournals = entries.reduce((sum, e) => sum + e.journalCount, 0);
  const totalHours = Math.round(entries.reduce((sum, e) => sum + e.hoursTracked, 0));

  const stats = [
    { l: "Stories", v: totalStories || 0, s: "" },
    { l: "Journals", v: totalJournals || 0, s: "" },
    { l: "Longest streak", v: streakData?.longestStreak || 0, s: "d" },
    { l: "Hours tracked", v: totalHours || 0, s: "h" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <PremiumGlass
        variant="strong"
        className="relative overflow-hidden rounded-[40px] p-10 md:p-16"
        glow="oklch(0.65 0.2 250 / 0.4)"
      >
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground flex items-center gap-2">
            <CloudSun className="h-3 w-3 text-primary" /> Memory map · {currentYear}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToday}
              disabled={isAtToday}
              className="glass-subtle grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5 disabled:opacity-20 disabled:cursor-default"
              aria-label="Today"
            >
              <ChevronsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onChangeYear(yearOffset - 1)}
              className="glass-subtle grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onChangeYear(yearOffset + 1)}
              disabled={yearOffset >= 5}
              className="glass-subtle grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <h1 className="mt-5 font-display text-5xl tracking-tight md:text-7xl">
          A year, day by day.
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
          Every story, every chapter, every quiet evening — gently mapped onto your life.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <PremiumGlass
              key={s.l}
              interactive
              variant="default"
              className="relative z-10 overflow-hidden p-4 cursor-pointer press-scale"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.l}
              </div>
              <div className="mt-2 font-display text-3xl tracking-tight">
                {typeof s.v === "number" ? <CountUp to={s.v} suffix={s.s ?? ""} /> : s.v}
              </div>
            </PremiumGlass>
          ))}
        </div>
      </PremiumGlass>
    </motion.section>
  );
}
