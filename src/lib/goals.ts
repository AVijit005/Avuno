// Goals — deterministic lifelong-journey models.

export type GoalStatus = "Planning" | "Active" | "Paused" | "Completed" | "Archived";

export interface GoalMilestone {
  label: string;
  reached: boolean;
  when?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  deadline?: string;
  priority: "low" | "med" | "high";
  reward: string;
  reason: string;
  status: GoalStatus;
  startedAt: string;
  completedAt?: string;
  accent: string;
  coverIds: string[];
  milestones: GoalMilestone[];
  kind: "creator" | "count" | "collection" | "genre" | "memory";
}

// Goals feature not yet connected to backend API
// Consumers handle null/empty gracefully (GoalCard checks `if (!g) return null`)

export function getCurrentGoals(): Goal[] { return []; }
export function getCompletedGoals(): Goal[] { return []; }
export function getUpcomingGoals(): Goal[] { return []; }
export function getPrimaryGoal(): Goal | null { return null; }
export function getGoalInsights() { return []; }
export function rankGoals(): Goal[] { return []; }
export function getRelatedGoal(_mediaId: string): Goal | null { return null; }
