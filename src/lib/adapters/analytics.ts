/**
 * Analytics adapter: API responses → UIOverview, UIStreak
 */

import type {
  UIOverview,
  UIStreak,
  UIMediaAnalytics,
  UIGenreAnalytics,
  UIActivity,
  UICalendar,
  UICalendarYear,
  UIInsights,
} from "./types";
import type {
  OverviewResponse,
  StreaksResponse,
  MediaAnalyticsResponse,
  GenreAnalyticsResponse,
  ActivityResponse,
  CalendarResponse,
  CalendarYearResponse,
  InsightsResponse,
} from "@/lib/api/analytics";

export function adaptOverview(o: OverviewResponse): UIOverview {
  return {
    totalItems: o.totalLibraryItems,
    completedItems:
      o.moviesCompleted + o.showsFinished + o.booksRead + o.gamesFinished + o.coursesCompleted,
    hoursSpent: o.hoursWatched + o.hoursRead + o.hoursPlayed + o.hoursLearned,
    averageRating: o.averageRating,
    favoriteGenre: o.favoriteGenre,
    favoriteMediaType: o.favoriteMediaType,
    journalEntries: o.totalJournalEntries,
    memories: o.totalMemories,
    moviesCompleted: o.moviesCompleted,
    showsFinished: o.showsFinished,
    episodesWatched: o.episodesWatched,
    booksRead: o.booksRead,
    gamesFinished: o.gamesFinished,
    coursesCompleted: o.coursesCompleted,
    hoursWatched: o.hoursWatched,
    hoursRead: o.hoursRead,
    hoursPlayed: o.hoursPlayed,
    hoursLearned: o.hoursLearned,
    totalReviews: o.totalReviews,
  };
}

export function adaptStreaks(s: StreaksResponse): UIStreak {
  return {
    current: s.currentStreak,
    longest: s.longestStreak,
    weeklyActivity: s.weeklyActivity,
    monthlyActivity: s.monthlyActivity,
    yearlyActivity: s.yearlyActivity,
    completionStreak: s.completionStreak,
    journalStreak: s.journalStreak,
  };
}

export function adaptMediaAnalytics(m: MediaAnalyticsResponse): UIMediaAnalytics {
  return m; // Matches perfectly
}

export function adaptGenreAnalytics(g: GenreAnalyticsResponse): UIGenreAnalytics {
  return g; // Matches perfectly
}

export function adaptActivity(a: ActivityResponse): UIActivity {
  return {
    heatmap: a.heatmap,
    byWeekday: a.byWeekday,
    byHour: a.byHour,
    timeline: a.timeline,
  };
}

export function adaptCalendar(c: CalendarResponse): UICalendar {
  return c; // Matches perfectly
}

export function adaptInsights(i: InsightsResponse): UIInsights {
  return {
    mostActiveWeekday: i.mostActiveWeekday,
    favoriteGenre: i.favoriteGenre,
    favoriteDecade: null,
    longestBinge: i.longestBinge ?? null,
    mostRewatchedMedia: null,
    mostRereadBook: null,
    mostReplayedGame: null,
    averageCompletionTime: i.averageCompletionTime ? Number(i.averageCompletionTime) : null,
    mostProductiveMonth: i.mostProductiveMonth,
    totalUniqueMedia: i.totalUniqueMedia,
    totalHoursSpent: i.totalHoursSpent,
  };
}

// ─── Calendar Year ──────────────────────────────
export function adaptCalendarYear(y: CalendarYearResponse): UICalendarYear {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthAccents = [
    "oklch(0.65 0.2 250)",
    "oklch(0.7 0.18 290)",
    "oklch(0.78 0.16 130)",
    "oklch(0.82 0.16 80)",
    "oklch(0.7 0.2 35)",
    "oklch(0.72 0.18 255)",
    "oklch(0.78 0.16 80)",
    "oklch(0.7 0.2 35)",
    "oklch(0.65 0.22 295)",
    "oklch(0.7 0.18 25)",
    "oklch(0.6 0.18 250)",
    "oklch(0.68 0.15 280)",
  ];

  const rawMonths = y.months ?? [];
  const months = rawMonths.map((m) => {
    const monthIdx = typeof m.month === "number" && m.month >= 0 && m.month < 12 ? m.month : 0;
    const name = monthNames[monthIdx] ?? "Jan";
    const accent = monthAccents[monthIdx] ?? "oklch(0.7 0.18 250)";
    const daysInMonth = new Date(y.year ?? new Date().getFullYear(), monthIdx + 1, 0).getDate();
    const startDay = new Date(y.year ?? new Date().getFullYear(), monthIdx, 1).getDay();

    return {
      index: monthIdx,
      name,
      short: name,
      daysInMonth,
      startDay,
      cells: Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        hasMedia: false,
        hasJournal: false,
        hasAchievement: false,
        intensity: 0,
        mediaCount: 0,
        poster: "",
      })),
      accent,
      favorite: "",
      genre: "",
      mediaCount: m.storyCount ?? 0,
      journalCount: m.journalCount ?? 0,
      hours: m.hoursTracked ?? 0,
      collage: (m.topMedia ?? []).map((t) => t?.posterUrl ?? ""),
      dayHits: m.dayHits ?? 0,
    };
  });

  const heatmap = (y.heatmap ?? []).map((c) => ({
    w: c.week ?? 0,
    d: c.day ?? 0,
    v: c.value ?? 0,
  }));

  return {
    year: y.year ?? new Date().getFullYear(),
    stats: {
      stories: y.stats?.totalStories ?? 0,
      journals: y.stats?.totalJournals ?? 0,
      longestStreak: y.stats?.longestStreak ?? 0,
      favoriteMonth: [...months].sort((a, b) => b.dayHits - a.dayHits)[0]?.name ?? "—",
    },
    months,
    heatmap,
    highlights: (y.highlights ?? []).map((h) => ({
      label: h.label ?? "",
      value: h.value ?? 0,
      note: h.note ?? "",
      media: { poster: h.posterUrl ?? "" },
    })),
    streaks: (y.streaks ?? []).map((s) => ({
      label: s.label ?? "",
      value: s.value ?? 0,
      total: s.total ?? 0,
      accent: s.accent ?? "var(--primary)",
    })),
    releases: (y.upcoming ?? []).map((u) => ({
      title: u.title ?? "",
      poster: u.posterUrl ?? "",
      when: u.when ?? "",
      countdown: u.countdown ?? "",
      accent: u.accent ?? "var(--primary)",
    })),
    insights: y.insights ?? [],
  };
}
