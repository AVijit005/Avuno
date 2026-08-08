import { apiGet, apiPatch, apiPost, apiDelete, apiUpload } from "./fetch";

export interface ProfileResponse {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  timezone: string | null;
  language: string | null;
  dateFormat: string | null;
  themePreference: string | null;
  avatar: string | null;
  coverImage: string | null;
  preferences: Record<string, unknown> | null;
  privacy: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  themePreference?: string;
  coverImage?: string;
}

export interface UpdatePreferencesInput {
  defaultLandingPage?: "home" | "library" | "timeline" | "dashboard";
  gridListPreference?: "grid" | "list";
  autoplay?: boolean;
  reduceMotion?: boolean;
  preferredMediaView?: "card" | "compact" | "poster";
  defaultSort?: "recent" | "title" | "rating" | "releaseDate";
  defaultFilters?: Record<string, unknown>;
  defaultLibraryView?: "all" | "inProgress" | "completed" | "favorites";
}

export interface UpdatePrivacyInput {
  profileVisibility?: "public" | "followers" | "private";
  collectionVisibility?: "public" | "followers" | "private";
  journalVisibility?: "public" | "followers" | "private";
  timelineVisibility?: "public" | "followers" | "private";
  wrappedVisibility?: "public" | "followers" | "private";
  searchVisibility?: "public" | "followers" | "private";
}

export interface SessionResponse {
  id: string;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  lastSeen: string;
  isCurrent: boolean;
  status: string;
  createdAt: string;
}

export async function getProfile(): Promise<ProfileResponse> {
  return apiGet<ProfileResponse>("/users/me");
}

export async function updateProfile(input: UpdateProfileInput): Promise<ProfileResponse> {
  return apiPatch<ProfileResponse>("/users/me", input);
}

export async function updatePreferences(input: UpdatePreferencesInput): Promise<ProfileResponse> {
  return apiPatch<ProfileResponse>("/users/me/preferences", input);
}

export async function updatePrivacy(input: UpdatePrivacyInput): Promise<ProfileResponse> {
  return apiPatch<ProfileResponse>("/users/me/privacy", input);
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<{ url: string }>("/users/me/avatar", formData);
}

export async function deleteAvatar(): Promise<void> {
  return apiDelete("/users/me/avatar");
}

export async function getSessions(): Promise<SessionResponse[]> {
  return apiGet<SessionResponse[]>("/users/me/sessions");
}

export async function revokeSession(sessionId: string): Promise<void> {
  return apiDelete(`/users/me/sessions/${sessionId}`);
}
