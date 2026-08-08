import { apiGet, apiPost, apiDelete } from "./fetch";

export interface WrappedCard {
  rank: number;
  title: string;
  type: string;
  subtitle: string | null;
  imageUrl: string | null;
  stat: string | null;
}

export interface WrappedStat {
  title: string;
  value: string;
  icon: string | null;
  sortOrder: number;
}

export interface WrappedInsight {
  text: string;
  icon: string;
  category: string;
}

export interface WrappedResponse {
  id: string;
  userId: string;
  year: number;
  generatedAt: string;
  version: number;
  cards: WrappedCard[];
  stats: WrappedStat[];
  insights: WrappedInsight[];
  summary: string;
  sharePayload: Record<string, unknown>;
}

export interface WrappedSummary {
  id: string;
  year: number;
  generatedAt: string;
  version: number;
  totalCompleted: number;
  totalHours: number;
  totalJournalEntries: number;
}

export interface WrappedShare {
  id: string;
  year: number;
  summary: string;
  highlights: WrappedInsight[];
  topCards: WrappedCard[];
  stats: WrappedStat[];
}

export async function generateWrapped(year: number): Promise<WrappedResponse> {
  return apiPost<WrappedResponse>("/wrapped/generate", { year });
}

export async function listWrapped(): Promise<WrappedSummary[]> {
  const response = await apiGet<{ items: WrappedSummary[] }>("/wrapped");
  return response.items;
}

export async function getWrapped(year: number): Promise<WrappedResponse> {
  return apiGet<WrappedResponse>(`/wrapped/${year}`);
}

export async function regenerateWrapped(year: number): Promise<WrappedResponse> {
  return apiPost<WrappedResponse>(`/wrapped/${year}/regenerate`);
}

export async function getWrappedShare(year: number): Promise<WrappedShare> {
  return apiGet<WrappedShare>(`/wrapped/${year}/share`);
}

export async function getWrappedSummary(year: number): Promise<WrappedSummary> {
  return apiGet<WrappedSummary>(`/wrapped/${year}/summary`);
}

export async function deleteWrapped(year: number): Promise<void> {
  return apiDelete(`/wrapped/${year}`);
}
