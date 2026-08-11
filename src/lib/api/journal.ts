import { apiGet, apiPost, apiPatch, apiDelete } from "./fetch";
import type { ItemsPage } from "./pagination";

export interface JournalEntryResponse {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  weather: string | null;
  location: string | null;
  isPrivate: boolean;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryResponse {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string | null;
  emotion: string | null;
  isPinned: boolean;
  isPrivate: boolean;
  coverImage: string | null;
  location: string | null;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
  journalId: string | null;
  quoteId: string | null;
  mediaIds?: string[];
}

export interface TimelineEventResponse {
  id: string;
  type: string;
  title: string;
  description: string | null;
  eventDate: string;
  icon: string | null;
  color: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  memoryId?: string | null;
}

export interface QuoteResponse {
  id: string;
  content: string;
  speaker: string | null;
  language: string | null;
  translation: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightResponse {
  id: string;
  title: string;
  description: string | null;
  timestamp: number | null;
  chapter: number | null;
  page: number | null;
  episode: number | null;
  season: number | null;
  track: number | null;
  lesson: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStatsResponse {
  journalCount: number;
  memoryCount: number;
  writingStreak: number;
  timelineEventCount: number;
  favoriteQuoteCount: number;
  highlightCount: number;
}

export interface CreateJournalEntryInput {
  title?: string;
  content: string;
  mood?: string;
  weather?: string;
  location?: string;
  isPrivate?: boolean;
  coverImage?: string;
}

export interface UpdateJournalEntryInput {
  title?: string;
  content?: string;
  mood?: string;
  weather?: string;
  location?: string;
  isPrivate?: boolean;
  coverImage?: string;
}

export interface CreateMemoryInput {
  title: string;
  description?: string;
  memoryDate?: string;
  emotion?: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  coverImage?: string;
  location?: string;
  mediaIds?: string[];
  journalId?: string;
  quoteId?: string;
}

export interface UpdateMemoryInput {
  title?: string;
  description?: string;
  memoryDate?: string;
  emotion?: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  coverImage?: string;
  location?: string;
  journalId?: string;
  quoteId?: string;
}

export interface CreateTimelineEventInput {
  type: string;
  title: string;
  description?: string;
  eventDate: string;
  icon?: string;
  color?: string;
}

export interface CreateQuoteInput {
  content: string;
  speaker?: string;
  language?: string;
  translation?: string;
  note?: string;
}

export interface UpdateQuoteInput {
  content?: string;
  speaker?: string;
  language?: string;
  translation?: string;
  note?: string;
}

export interface CreateHighlightInput {
  title: string;
  description?: string;
  timestamp?: number;
  chapter?: number;
  page?: number;
  episode?: number;
  season?: number;
  track?: number;
  lesson?: number;
}

export interface UpdateHighlightInput {
  title?: string;
  description?: string;
  timestamp?: number;
  chapter?: number;
  page?: number;
  episode?: number;
  season?: number;
  track?: number;
  lesson?: number;
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// Journal Entries
export async function createJournalEntry(
  input: CreateJournalEntryInput,
): Promise<JournalEntryResponse> {
  return apiPost<JournalEntryResponse>("/journal", input);
}

export async function listJournalEntries(params?: {
  cursor?: string;
  limit?: number;
}): Promise<ItemsPage<JournalEntryResponse>> {
  return apiGet(`/journal${buildQueryString(params ?? {})}`);
}

export async function getJournalEntry(id: string): Promise<JournalEntryResponse> {
  return apiGet<JournalEntryResponse>(`/journal/${id}`);
}

export async function updateJournalEntry(
  id: string,
  input: UpdateJournalEntryInput,
): Promise<JournalEntryResponse> {
  return apiPatch<JournalEntryResponse>(`/journal/${id}`, input);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  return apiDelete(`/journal/${id}`);
}

// Memories
export async function createMemory(input: CreateMemoryInput): Promise<MemoryResponse> {
  return apiPost<MemoryResponse>("/memories", input);
}

export async function listMemories(params?: {
  cursor?: string;
  limit?: number;
  mediaId?: string;
  journalId?: string;
}): Promise<ItemsPage<MemoryResponse>> {
  return apiGet(`/memories${buildQueryString(params ?? {})}`);
}

export async function getMemory(id: string): Promise<MemoryResponse> {
  return apiGet<MemoryResponse>(`/memories/${id}`);
}

export async function updateMemory(id: string, input: UpdateMemoryInput): Promise<MemoryResponse> {
  return apiPatch<MemoryResponse>(`/memories/${id}`, input);
}

export async function deleteMemory(id: string): Promise<void> {
  return apiDelete(`/memories/${id}`);
}

export async function attachMemoryToLibraryItem(
  libraryId: string,
  memoryId: string,
  mediaType: string,
): Promise<void> {
  return apiPost(`/library/${libraryId}/memories/${memoryId}?type=${mediaType}`, {});
}

export async function detachMemoryFromLibraryItem(
  libraryId: string,
  memoryId: string,
  mediaType: string,
): Promise<void> {
  return apiDelete(`/library/${libraryId}/memories/${memoryId}?type=${mediaType}`);
}

// Timeline
export async function createTimelineEvent(
  input: CreateTimelineEventInput,
): Promise<TimelineEventResponse> {
  return apiPost<TimelineEventResponse>("/timeline/events", input);
}

export async function listTimelineEvents(params?: {
  year?: number;
  month?: number;
}): Promise<ItemsPage<TimelineEventResponse>> {
  if (params?.year && params?.month) {
    return apiGet<ItemsPage<TimelineEventResponse>>(`/timeline/${params.year}/${params.month}`);
  }
  if (params?.year) {
    return apiGet<ItemsPage<TimelineEventResponse>>(`/timeline/${params.year}`);
  }
  return apiGet<ItemsPage<TimelineEventResponse>>("/timeline");
}

export async function attachTimelineMemory(timelineId: string, memoryId: string): Promise<void> {
  return apiPost<void>(`/timeline/${timelineId}/memories/${memoryId}`, {});
}

export async function detachTimelineMemory(timelineId: string, memoryId: string): Promise<void> {
  return apiDelete<void>(`/timeline/${timelineId}/memories/${memoryId}`);
}

// Quotes
export async function createQuote(
  libraryId: string,
  input: CreateQuoteInput,
): Promise<QuoteResponse> {
  return apiPost<QuoteResponse>(`/library/${libraryId}/quotes`, input);
}

export async function updateQuote(
  libraryId: string,
  quoteId: string,
  input: UpdateQuoteInput,
): Promise<QuoteResponse> {
  return apiPatch<QuoteResponse>(`/library/${libraryId}/quotes/${quoteId}`, input);
}

export async function deleteQuote(libraryId: string, quoteId: string): Promise<void> {
  return apiDelete(`/library/${libraryId}/quotes/${quoteId}`);
}

// Highlights
export async function createHighlight(
  libraryId: string,
  input: CreateHighlightInput,
): Promise<HighlightResponse> {
  return apiPost<HighlightResponse>(`/library/${libraryId}/highlights`, input);
}

export async function updateHighlight(
  libraryId: string,
  highlightId: string,
  input: UpdateHighlightInput,
): Promise<HighlightResponse> {
  return apiPatch<HighlightResponse>(`/library/${libraryId}/highlights/${highlightId}`, input);
}

export async function deleteHighlight(libraryId: string, highlightId: string): Promise<void> {
  return apiDelete(`/library/${libraryId}/highlights/${highlightId}`);
}

// Stats
export async function getJournalStats(): Promise<JournalStatsResponse> {
  return apiGet<JournalStatsResponse>("/journal/stats");
}

// Journal Prompts
export async function getJournalPrompts(): Promise<string[]> {
  return apiGet<string[]>("/journal/prompts");
}
