// Achievements — memories, not trophies.
import type { Mood, Season } from "@/lib/memory";

export type AchievementCategory =
  | "Explorer"
  | "Collector"
  | "Writer"
  | "Thinker"
  | "Reader"
  | "Listener"
  | "Viewer"
  | "Gamer"
  | "Completionist"
  | "Curator"
  | "Historian"
  | "Traveler";

export interface Achievement {
  id: string;
  name: string;
  caption: string;
  category: AchievementCategory;
  earnedAt: string;
  mediaId?: string;
  favoriteMemory?: string;
  journalExcerpt?: string;
  mood?: Mood;
  season?: Season;
  icon?: string;
}

// Achievements feature not yet connected to backend API
// Consumers handle null/undefined gracefully (AchievementHero checks `if (!a) return null`)

export const getAchievements = (): Achievement[] => [];
export const rankAchievements = (): Achievement[] => [];
export const getMilestones = (): Achievement[] => [];
export function getAchievementsByCategory(): Record<AchievementCategory, Achievement[]> {
  return {} as Record<AchievementCategory, Achievement[]>;
}
