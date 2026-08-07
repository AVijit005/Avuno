export interface GenreDistributionItem {
  name: string;
  count: number;
  accent?: string;
  genre?: string;
  value?: number;
}

export interface WeeklyActivityEntry {
  week: string;
  count: number;
}

export interface CollectionStats {
  totalItems: number;
  completed: number;
  favoriteCount: number;
  completionPercent: number;
  mediaTypeBreakdown: Record<string, number>;
  genreDistribution?: GenreDistributionItem[];
  weeklyActivity?: WeeklyActivityEntry[];
  itemCount?: number;
  totalHours?: number;
  completedItems?: number;
}

import type React from "react";

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

export interface RechartsComponentProps {
  width?: number | string;
  height?: number | string;
  data?: unknown[];
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children?: React.ReactNode;
  [key: string]: unknown;
}

export type RechartsComponent = React.ComponentType<RechartsComponentProps>;
