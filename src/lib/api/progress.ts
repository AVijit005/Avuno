import { apiGet, apiPatch, apiPost } from "./fetch";

export interface UpdateProgressInput {
  progress?: number;
  currentEpisode?: number;
  currentSeason?: number;
  currentChapter?: number;
  currentPage?: number;
  currentTrack?: number;
  currentLesson?: number;
  currentModule?: number;
  hoursSpent?: number;
  minutesSpent?: number;
}

export interface ProgressResponse {
  progress: number;
  progressPercentage: number;
  currentEpisode: number | null;
  currentSeason: number | null;
  currentChapter: number | null;
  currentPage: number | null;
  currentTrack: number | null;
  currentLesson: number | null;
  currentModule: number | null;
  hoursSpent: number | null;
  minutesSpent: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  lastInteractionAt: string | null;
  status: string;
  mediaType: string;
  total: {
    totalEpisodes: number | null;
    totalSeasons: number | null;
    totalChapters: number | null;
    totalPages: number | null;
    totalTracks: number | null;
    totalLessons: number | null;
    totalModules: number | null;
    runtime: number | null;
    remaining: {
      episodes: number | null;
      pages: number | null;
      lessons: number | null;
      runtime: number | null;
    };
  };
}

export interface RecentProgressItem {
  libraryId: string;
  mediaId: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  mediaType: string;
  progress: number;
  progressPercentage: number;
  status: string;
  updatedAt: string;
}

export async function updateProgress(
  libraryId: string,
  input: UpdateProgressInput,
): Promise<ProgressResponse> {
  return apiPatch<ProgressResponse>(`/library/${libraryId}/progress`, input);
}

export async function getProgress(libraryId: string): Promise<ProgressResponse> {
  return apiGet<ProgressResponse>(`/library/${libraryId}/progress`);
}

export async function completeProgress(libraryId: string): Promise<ProgressResponse> {
  return apiPost<ProgressResponse>(`/library/${libraryId}/progress/complete`);
}

export async function resetProgress(libraryId: string): Promise<ProgressResponse> {
  return apiPost<ProgressResponse>(`/library/${libraryId}/progress/reset`);
}

export async function getRecentProgress(): Promise<RecentProgressItem[]> {
  return apiGet<RecentProgressItem[]>("/library/progress/recent");
}
