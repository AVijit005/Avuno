import { apiGet } from "./fetch";

export interface MediaResponse {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  description: string | null;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  bannerUrl: string | null;
  coverImage: string | null;
  thumbnail: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  runtime: number | null;
  duration: number | null;
  language: string | null;
  country: string | null;
  genres: string[];
  tags: string[];
  externalIds: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  status: string;
  mediaType: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListResponse {
  data: MediaResponse[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface MediaSearchParams {
  [key: string]: unknown;
  search: string;
  mediaType?: string;
  genre?: string;
  language?: string;
  country?: string;
  releaseYear?: string;
  status?: string;
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MediaFilterParams {
  [key: string]: unknown;
  mediaType?: string;
  genre?: string;
  language?: string;
  country?: string;
  releaseYear?: string;
  status?: string;
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

export async function listMedia(params?: MediaFilterParams): Promise<MediaListResponse> {
  return apiGet<MediaListResponse>(`/media${buildQueryString(params ?? {})}`);
}

export async function searchMedia(params: MediaSearchParams): Promise<MediaListResponse> {
  return apiGet<MediaListResponse>(`/media/search${buildQueryString(params)}`);
}

export async function listMediaByType(
  type: string,
  params?: MediaFilterParams,
): Promise<MediaListResponse> {
  return apiGet<MediaListResponse>(`/media/type/${type}${buildQueryString(params ?? {})}`);
}

export async function getMedia(id: string): Promise<MediaResponse> {
  return apiGet<MediaResponse>(`/media/${id}`);
}

export async function getRelatedMedia(id: string): Promise<MediaResponse[]> {
  return apiGet<MediaResponse[]>(`/media/${id}/related`);
}

export async function getMediaMetadata(id: string): Promise<Record<string, unknown>> {
  return apiGet<Record<string, unknown>>(`/media/${id}/metadata`);
}
