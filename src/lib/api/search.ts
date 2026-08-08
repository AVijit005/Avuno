import { apiGet, apiDelete } from "./fetch";

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  matchedField: string | null;
  matchedText: string | null;
  score: number;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  hasMore: boolean;
  cursor: string | null;
  facets?: {
    types: Record<string, number>;
    statuses?: Record<string, number>;
    genres?: Record<string, number>;
  };
}

export interface Suggestion {
  text: string;
  type: string;
  score: number;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  recent: string[];
}

export interface TrendingItem {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  score: number;
}

export interface FilterOptions {
  types: string[];
  statuses: string[];
  genres: string[];
  years: number[];
  moods: string[];
}

export interface SearchParams {
  [key: string]: unknown;
  q: string;
  mode?: "global" | "library" | "media" | "journal" | "collections" | "timeline";
  type?: string;
  genre?: string;
  status?: string;
  rating?: string;
  year?: string;
  month?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
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

export async function search(params: SearchParams): Promise<SearchResponse> {
  return apiGet<SearchResponse>(`/search${buildQueryString(params)}`);
}

export async function getSuggestions(q: string, limit?: number): Promise<SuggestionsResponse> {
  return apiGet<SuggestionsResponse>(`/search/suggestions${buildQueryString({ q, limit })}`);
}

export async function getRecentSearches(): Promise<string[]> {
  return apiGet<string[]>("/search/recent");
}

export async function clearRecentSearches(): Promise<void> {
  return apiDelete("/search/recent");
}

export async function getTrending(): Promise<TrendingItem[]> {
  return apiGet<TrendingItem[]>("/search/trending");
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return apiGet<FilterOptions>("/search/filter-options");
}
