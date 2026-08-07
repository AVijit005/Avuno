export interface TasteGenre {
  name: string;
  count: number;
}

export interface TasteCreator {
  name: string;
  count: number;
}

export interface TasteEra {
  name: string;
  count: number;
}

export interface ImpactItem {
  label: string;
  value: number;
  evidence?: string;
}

export interface EvolutionItem {
  year: string;
  focus: string;
  mediaCount: number;
  hoursSpent: number;
  topGenre: string;
  journalCount: number;
}

export interface PersonalStatement {
  statement: string;
  confidence: number;
  evidence: string;
}

export interface JourneyStep {
  label: string;
  description: string;
  accent?: string;
}
