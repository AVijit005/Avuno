// Challenges — deterministic personal prompts.

import type { UIMediaKind } from "@/lib/adapters/types";

export type ChallengeKind =
  "Monthly" | "Season" | "Weekend" | "Creator" | "Genre" | "Memory" | "Journal" | "Comfort";

export interface ChallengeSuggestion {
  id: string;
  title: string;
  posterUrl: string | null;
  mediaType: UIMediaKind | string;
}

export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  expiresIn?: string;
  suggestions: ChallengeSuggestion[];
  accent: string;
}

interface ApiChallenge {
  id: string;
  kind: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  expiresIn?: string;
  suggestions: { id: string; title: string; posterUrl: string | null; mediaType: string }[];
  accent: string;
}

export function adaptChallenge(apiChallenge: ApiChallenge): Challenge {
  return {
    id: apiChallenge.id,
    kind: ([
      "Monthly",
      "Season",
      "Weekend",
      "Creator",
      "Genre",
      "Memory",
      "Journal",
      "Comfort",
    ].includes(apiChallenge.kind)
      ? apiChallenge.kind
      : "Monthly") as ChallengeKind,
    title: apiChallenge.title,
    description: apiChallenge.description,
    target: apiChallenge.target,
    current: apiChallenge.current,
    reward: apiChallenge.reward,
    expiresIn: apiChallenge.expiresIn,
    suggestions: apiChallenge.suggestions,
    accent: apiChallenge.accent,
  };
}

// Challenges feature not yet connected to backend API
// Consumers handle null/undefined gracefully (ChallengeCard checks `if (!g) return null`)

export const getChallenges = (): Challenge[] => [];
export const getRecommendedChallenge = (): Challenge | undefined => undefined;
export const getActiveChallenge = (): Challenge | undefined => undefined;
