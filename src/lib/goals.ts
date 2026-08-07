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

interface ApiGoal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  deadline?: string;
  priority: string;
  reward: string;
  reason: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  accent: string;
  coverIds: string[];
  milestones: { label: string; reached: boolean; when?: string }[];
  kind: string;
}

export function adaptGoal(apiGoal: ApiGoal): Goal {
  return {
    id: apiGoal.id,
    title: apiGoal.title,
    description: apiGoal.description,
    current: apiGoal.current,
    target: apiGoal.target,
    deadline: apiGoal.deadline,
    priority: (["low", "med", "high"].includes(apiGoal.priority) ? apiGoal.priority : "med") as Goal["priority"],
    reward: apiGoal.reward,
    reason: apiGoal.reason,
    status: (["Planning", "Active", "Paused", "Completed", "Archived"].includes(apiGoal.status) ? apiGoal.status : "Planning") as GoalStatus,
    startedAt: apiGoal.startedAt,
    completedAt: apiGoal.completedAt,
    accent: apiGoal.accent,
    coverIds: apiGoal.coverIds,
    milestones: apiGoal.milestones,
    kind: (["creator", "count", "collection", "genre", "memory"].includes(apiGoal.kind) ? apiGoal.kind : "count") as Goal["kind"],
  };
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
