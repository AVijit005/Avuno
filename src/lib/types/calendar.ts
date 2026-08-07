export interface CalendarMonth {
  index: number;
  short: string;
  accent: string;
  mediaCount: number;
  journalCount: number;
  collage: string[];
  favorite?: string;
}

export interface InsightLine {
  text: string;
  accent?: string;
}

export interface HeatmapCell {
  date: string;
  count: number;
  intensity: number;
}

export interface Streak {
  label: string;
  days: number;
  accent?: string;
  value?: number;
  total?: number;
}

export interface MemoryHighlight {
  label: string;
  title: string;
  subtitle?: string;
  mediaId?: string;
  colSpan?: string;
}
