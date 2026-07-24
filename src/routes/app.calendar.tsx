import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Film,
  BookOpen,
  Gamepad2,
  Music,
  Trophy,
  NotebookPen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
const CALENDAR_YEAR: any = {};
const MEDIA: any[] = [];
import { useCalendarYear } from "@/hooks/use-analytics";
import { adaptCalendarYear } from "@/lib/adapters/analytics";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { MediaConstellation } from "@/components/analytics/MediaConstellation";
import { ThisWeekHistory } from "@/components/memory/ThisWeekHistory";
import {
  MemoryZone,
  CalendarHero,
  YearOverview,
  MonthlyGrid,
  DailyMemoryPanel,
  MediaHeatmap,
  MemoryHighlights,
  MemoryStreaks,
  UpcomingReleases,
  CalendarInsights,
  AddMemoryModal,
  CalendarSkeleton,
} from "@/components/calendar";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { PremiumButton } from "@/components/ui/PremiumButton";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Calendar — Chronicle" },
      { name: "description", content: "A memory map of your year — every story, chapter, and quiet evening mapped onto your life." },
      { property: "og:title", content: "Chronicle Calendar" },
      { property: "og:description", content: "A year, day by day — your personal memory map." },
    ],
  }),
});

const SEASON_TINT: Record<string, string> = {
  spring: "oklch(0.78 0.16 130 / 0.18)",
  summer: "oklch(0.82 0.16 80 / 0.18)",
  autumn: "oklch(0.7 0.2 35 / 0.18)",
  winter: "oklch(0.6 0.18 250 / 0.18)",
};
const seasonOf = (m: number) =>
  m < 2 || m === 11 ? "winter" : m < 5 ? "spring" : m < 8 ? "summer" : "autumn";

function CalendarPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const [yearOffset, setYearOffset] = useState(0);
  const displayYear = currentYear + yearOffset;
  const [monthIdx, setMonthIdx] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: calendarYearData, isLoading: isCalendarLoading, isError: isCalendarError, refetch: refetchCalendar } = useCalendarYear(displayYear);
  const calendarUI = calendarYearData ? adaptCalendarYear(calendarYearData) : null;
  const apiMonth = calendarUI?.months[monthIdx] ?? null;
  const month = apiMonth ?? {
    index: monthIdx,
    name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIdx],
    startDay: new Date(displayYear, monthIdx, 1).getDay(),
    mediaCount: 0,
    journalCount: 0,
    hours: 0,
    accent: "var(--primary)",
    cells: [],
  };

  const dateParam = selectedDay ? `${displayYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : null;
  const { data: dayData } = useQuery({
    queryKey: ['calendar-day', dateParam] as const,
    queryFn: () => analyticsApi.getCalendarDay(dateParam!),
    enabled: !!dateParam,
    staleTime: 2 * 60_000,
  });
  const season = seasonOf(monthIdx);

  const grid = useMemo(() => {
    const cells: ({
      day: number; hasMedia: boolean; hasJournal: boolean;
      hasAchievement: boolean; intensity: number; mediaCount: number; poster: string;
    } | null)[] = [];
    for (let i = 0; i < month.startDay; i++) cells.push(null);
    const monthCells = month.cells.length > 0 ? month.cells : Array.from({ length: new Date(displayYear, monthIdx + 1, 0).getDate() }, (_, i) => ({
      day: i + 1,
      hasMedia: false,
      hasJournal: false,
      hasAchievement: false,
      intensity: 0,
      mediaCount: 0,
      poster: '',
    }));
    monthCells.forEach((c) => cells.push(c));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month, displayYear, monthIdx]);

  const dailyMemoryItems = useMemo(() => {
    if (!selectedDay) return [];
    if (dayData?.mediaItems?.length) {
      const typeIcons: Record<string, typeof Film> = {
        movie: Film, series: Film, anime: Film, book: BookOpen,
        game: Gamepad2, music: Music, podcast: Music, course: NotebookPen,
      };
      return dayData.mediaItems.map((item) => ({
        icon: typeIcons[item.mediaType] ?? Film,
        label: item.mediaType.charAt(0).toUpperCase() + item.mediaType.slice(1),
        title: item.title.length > 20 ? item.title.slice(0, 20) + "\u2026" : item.title,
        note: item.note,
      }));
    }
    const cell = month.cells.find((c) => c.day === selectedDay);
    if (!cell || !cell.hasMedia) return [];
    return Array.from({ length: Math.min(cell.mediaCount, 6) }, (_, i) => {
      const media = MEDIA.length > 0 ? MEDIA[(monthIdx * 100 + selectedDay + i * 7) % MEDIA.length] : undefined;
      const title = media ? media.title : `Story ${i + 1}`;
      return {
        icon: Film, label: "Story",
        title: title.length > 20 ? title.slice(0, 20) + "\u2026" : title,
        note: "From your library",
      };
    });
  }, [selectedDay, dayData, monthIdx, month.cells]);

  if (isCalendarLoading) return <CalendarSkeleton />;

  if (isCalendarError) {
    return (
      <div className="py-20">
        <PremiumErrorState
          title="Couldn't load your calendar"
          description="Something went wrong fetching your year overview. Please try again."
          action={<PremiumButton variant="primary" onClick={() => refetchCalendar()}>Retry</PremiumButton>}
        />
      </div>
    );
  }

  return (
    <div className="pb-32 pt-2">
      <div className="pointer-events-none fixed inset-0 -z-10 transition-colors duration-1000"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${SEASON_TINT[season]}, transparent 70%)` }} />

      <CalendarHero currentYear={displayYear} yearOffset={yearOffset} onChangeYear={setYearOffset}
        onToday={() => { setYearOffset(0); setMonthIdx(currentMonth); }}
        isAtToday={yearOffset === 0 && monthIdx === currentMonth} />

      <MemoryZone title="Year overview">
        <YearOverview 
          months={calendarUI?.months ?? Array.from({ length: 12 }, (_, i) => ({
            index: i, name: "", short: "", daysInMonth: 31, startDay: 0, cells: [],
            accent: "var(--primary)", favorite: "", genre: "", mediaCount: 0, journalCount: 0, hours: 0,
            collage: [], dayHits: 0
          }))}
          monthIdx={monthIdx} 
          onSelectMonth={(idx) => { setMonthIdx(idx); setSelectedDay(null); }} 
        />
      </MemoryZone>

      <MemoryZone
        title={`${month.name} ${displayYear}`}
        sub={`${month.mediaCount} stories \u00b7 ${month.journalCount} journals \u00b7 ${month.hours}h`}
        action={
          <div className="inline-flex items-center gap-1">
            <button onClick={() => { setMonthIdx((monthIdx + 11) % 12); setSelectedDay(null); }}
              className="glass-subtle grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.08]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => { setMonthIdx((monthIdx + 1) % 12); setSelectedDay(null); }}
              className="glass-subtle grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.08]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            <MonthlyGrid monthIdx={monthIdx} grid={grid} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
            <MediaConstellation />
          </div>
          <DailyMemoryPanel monthName={month.name} monthIdx={monthIdx} selectedDay={selectedDay} currentYear={displayYear}
            monthAccent={month.accent} items={dailyMemoryItems} onAddMemory={() => setIsAddModalOpen(true)} />
        </div>
      </MemoryZone>

      <MemoryZone title="Media heatmap" sub="52 weeks of attention.">
        <MediaHeatmap heatmap={calendarUI?.heatmap} />
      </MemoryZone>
      <MemoryZone title="Memory highlights">
        <MemoryHighlights highlights={calendarUI?.highlights} />
      </MemoryZone>
      <MemoryZone title="Memory streaks">
        <MemoryStreaks streaks={calendarUI?.streaks} />
      </MemoryZone>
      <MemoryZone title="Upcoming releases">
        <UpcomingReleases releases={calendarUI?.releases} />
      </MemoryZone>
      <MemoryZone title="Calendar insights">
        <CalendarInsights insights={calendarUI?.insights} />
      </MemoryZone>
      <MemoryZone title="This week, in your life" sub="The same week of the year, across previous years.">
        <ThisWeekHistory />
      </MemoryZone>

      <AddMemoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        selectedDay={selectedDay} monthName={month.name} currentYear={displayYear} />
    </div>
  );
}

