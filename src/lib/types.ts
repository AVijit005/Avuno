export type MediaKind =
  | "movie"
  | "series"
  | "anime"
  | "book"
  | "manga"
  | "game"
  | "music"
  | "podcast"
  | "course"
  | "youtube";

export const KIND_LABEL: Record<MediaKind, string> = {
  movie: "Movies",
  series: "Series",
  anime: "Anime",
  book: "Books",
  manga: "Manga",
  game: "Games",
  music: "Music",
  podcast: "Podcasts",
  course: "Courses",
  youtube: "YouTube",
};

export interface MediaItem {
  id: string;
  title: string;
  kind: MediaKind | string;
  year: number;
  poster?: string | null;
  backdrop?: string | null;
  rating?: number | null; // 0-5
  progress?: number | null; // 0-100
  status: string;
  genres: string[];
  runtime?: string | null;
  creator?: string | null;
  accent?: string | null; // oklch
  synopsis: string;
  _libraryId?: string | null; // from api adapters
  _mediaId?: string | null; // from api adapters
}

export interface Collection {
  id: string;
  name: string;
  count: number;
  cover: string;
  accent: string;
  description: string;
  covers?: string[]; // for collage
  mediaIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  creator?: string;
  pinned?: boolean;
  featured?: boolean;
  category?: string;
  privacy?: "private" | "public" | "friends";
  completion?: number;
  avgRating?: number;
}

export interface MediaDetail {
  memory: {
    date: string;
    rating: number;
    mood: string;
    location: string;
    note: string;
    tags: string[];
  };
  info: { label: string; value: string }[];
  timeline: {
    type: "started" | "paused" | "continued" | "completed" | "journal" | "collection";
    label: string;
    when: string;
  }[];
  stats: { rewatches: number; totalHours: number; firstSeen: string; lastSeen: string };
  relatedIds: string[];
  collectionIds: string[];
  continueLabel: string;
  continueDetail: string;
}

export const SEARCHABLE_SETTINGS = [
  { id: "settings", label: "Settings", hint: "Theme, privacy, and active sessions", to: "/app/settings", icon: "settings" },
  { id: "import", label: "Import & Export", hint: "Bring your library in from JSON or CSV", to: "/app/import", icon: "download" },
  { id: "profile", label: "Profile", hint: "View your public profile", to: "/app/profile", icon: "user" },
];




export const MEDIA: any[] = [];
export function getMediaItems(): any[] {
  if (typeof window !== 'undefined' && (window as any).__CHRONICLE_MEDIA__) {
    return (window as any).__CHRONICLE_MEDIA__;
  }
  return MEDIA;
}
