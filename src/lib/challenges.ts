// Challenges — deterministic personal prompts.

export type ChallengeKind =
  | "Monthly"
  | "Season"
  | "Weekend"
  | "Creator"
  | "Genre"
  | "Memory"
  | "Journal"
  | "Comfort";

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  expiresIn?: string;
  suggestions: any[];
  accent: string;
}

// Challenges feature not yet connected to backend API
// Consumers handle null/undefined gracefully (ChallengeCard checks `if (!g) return null`)

export const getChallenges = (): Challenge[] => [];
export const getRecommendedChallenge = (): Challenge | undefined => undefined;
export const getActiveChallenge = (): Challenge | undefined => undefined;
