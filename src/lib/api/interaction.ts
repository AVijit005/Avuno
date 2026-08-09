import { apiGet, apiPatch, apiPost, apiDelete } from "./fetch";
import type { CountedItemsPage } from "./pagination";

export interface RatingResponse {
  rating: number | null;
  ratedAt: string | null;
}

export interface FavoriteResponse {
  favorite: boolean;
  favoritedAt: string | null;
}

export interface BookmarkResponse {
  bookmarked: boolean;
  bookmarkedAt: string | null;
}

export interface ReviewResponse {
  id: string;
  title: string;
  body: string;
  spoiler: boolean;
  visibility: string;
  createdAt: string;
  editedAt: string | null;
}

export interface HistoryEvent {
  event: string;
  timestamp: string;
  progress?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateReviewInput {
  title: string;
  body: string;
  spoiler: boolean;
  visibility: string;
}

export interface UpdateReviewInput {
  title?: string;
  body?: string;
  spoiler?: boolean;
  visibility?: string;
}

export async function updateRating(libraryId: string, rating: number): Promise<RatingResponse> {
  return apiPatch<RatingResponse>(`/library/${libraryId}/rating`, { rating });
}

export async function toggleFavorite(
  libraryId: string,
  favorite: boolean,
): Promise<FavoriteResponse> {
  return apiPatch<FavoriteResponse>(`/library/${libraryId}/favorite`, { favorite });
}

export async function toggleBookmark(
  libraryId: string,
  bookmark: boolean,
): Promise<BookmarkResponse> {
  return apiPatch<BookmarkResponse>(`/library/${libraryId}/bookmark`, { bookmark });
}

export async function createReview(
  libraryId: string,
  input: CreateReviewInput,
): Promise<ReviewResponse> {
  return apiPost<ReviewResponse>(`/library/${libraryId}/review`, input);
}

export async function updateReview(
  libraryId: string,
  input: UpdateReviewInput,
): Promise<ReviewResponse> {
  return apiPatch<ReviewResponse>(`/library/${libraryId}/review`, input);
}

export async function deleteReview(libraryId: string): Promise<void> {
  return apiDelete(`/library/${libraryId}/review`);
}

export async function listReviews(params?: {
  cursor?: string;
  limit?: number;
}): Promise<CountedItemsPage<ReviewResponse>> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiGet(`/library/reviews?${qs.toString()}`);
}

export async function listFavorites(params?: {
  cursor?: string;
  limit?: number;
}): Promise<CountedItemsPage<unknown>> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiGet(`/library/favorites?${qs.toString()}`);
}

export async function listBookmarks(params?: {
  cursor?: string;
  limit?: number;
}): Promise<CountedItemsPage<unknown>> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiGet(`/library/bookmarks?${qs.toString()}`);
}

export async function listHistory(params?: {
  cursor?: string;
  limit?: number;
}): Promise<CountedItemsPage<HistoryEvent>> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiGet(`/library/history?${qs.toString()}`);
}
