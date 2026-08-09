import {
  Home,
  Library,
  Film,
  Tv,
  Sparkles,
  BookOpen,
  BookMarked,
  Gamepad2,
  Music2,
  Mic,
  GraduationCap,
  Youtube,
  Layers,
  BarChart3,
  CalendarDays,
  NotebookPen,
  Clock,
  Target,
  Trophy,
  Sparkle,
  Search,
  Bell,
  User,
  Settings,
  PlayCircle,
  Loader,
  CheckCircle2,
  BookmarkPlus,
  History,
  Heart,
  Repeat,
  PauseCircle,
  XCircle,
  Archive,
  Quote,
  Bookmark,
  Clock4,
  Building2,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SURFACE } from "@/lib/copy";

export type NavGroup =
  | "today"
  | "library"
  | "shelves"
  | "collections"
  | "memories"
  | "saved"
  | "people"
  | "journey"
  | "discover"
  | "insights"
  | "you";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group?: NavGroup;
}

export const NAV: NavItem[] = [
  // Today's Story — the front page of your life today
  { to: "/app", label: "Today", icon: Home, group: "today" },
  { to: "/app/journal", label: "Journal", icon: NotebookPen, group: "today" },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays, group: "today" },

  // Library — the archive (status surfaces nested under it)
  { to: "/app/library", label: "Archive", icon: Library, group: "library" },

  { to: "/app/library/continue", label: SURFACE.continue.nav, icon: PlayCircle, group: "library" },
  { to: "/app/library/in-progress", label: SURFACE.inProgress.nav, icon: Loader, group: "library" },
  { to: "/app/library/favorites", label: SURFACE.favorites.nav, icon: Heart, group: "library" },
  {
    to: "/app/library/completed",
    label: SURFACE.completed.nav,
    icon: CheckCircle2,
    group: "library",
  },
  {
    to: "/app/library/recently-finished",
    label: SURFACE.recentlyFinished.nav,
    icon: History,
    group: "library",
  },
  {
    to: "/app/library/planning",
    label: SURFACE.planning.nav,
    icon: BookmarkPlus,
    group: "library",
  },
  { to: "/app/library/rewatching", label: SURFACE.rewatching.nav, icon: Repeat, group: "library" },
  { to: "/app/library/paused", label: SURFACE.paused.nav, icon: PauseCircle, group: "library" },
  { to: "/app/library/dropped", label: SURFACE.dropped.nav, icon: XCircle, group: "library" },
  { to: "/app/library/archived", label: SURFACE.archived.nav, icon: Archive, group: "library" },

  // Shelves — by medium
  { to: "/app/library/movie", label: "Movies", icon: Film, group: "shelves" },
  { to: "/app/library/anime", label: "Anime", icon: Sparkles, group: "shelves" },
  { to: "/app/library/series", label: "Series", icon: Tv, group: "shelves" },
  { to: "/app/library/book", label: "Books", icon: BookOpen, group: "shelves" },
  { to: "/app/library/manga", label: "Manga", icon: BookMarked, group: "shelves" },
  { to: "/app/library/game", label: "Games", icon: Gamepad2, group: "shelves" },
  { to: "/app/library/music", label: "Music", icon: Music2, group: "shelves" },
  { to: "/app/library/podcast", label: "Podcasts", icon: Mic, group: "shelves" },
  { to: "/app/library/course", label: "Courses", icon: GraduationCap, group: "shelves" },
  { to: "/app/library/youtube", label: "YouTube", icon: Youtube, group: "shelves" },

  // Collections — curated sets
  { to: "/app/collections", label: "Collections", icon: Layers, group: "collections" },

  // Memories — the time-axis of your life
  { to: "/app/timeline", label: "Timeline", icon: Clock, group: "memories" },

  // Saved — fragments you wanted to keep
  { to: "/app/bookmarks", label: "Bookmarks", icon: Bookmark, group: "saved" },
  { to: "/app/quotes", label: "Quotes", icon: Quote, group: "saved" },
  { to: "/app/save-for-later", label: "Save for later", icon: Clock4, group: "saved" },

  // Journey — where you're heading
  { to: "/app/wrapped", label: "Wrapped", icon: Sparkle, group: "journey" },

  // NOT LISTED — Museum, Characters, Creators, Franchises, Goals, Achievements.
  //
  // Each has a route, but no backend and no data source: the lib modules
  // behind them return empty arrays, so the index pages render a permanent
  // "Coming soon" and the $id pages always throw notFound(). Six nav entries
  // that lead nowhere read as a broken product; the routes remain reachable by
  // URL so the work is not lost, but they are not advertised until they do
  // something.

  // Discover
  { to: "/app/search", label: "Discover", icon: Search, group: "discover" },

  // Insights
  { to: "/app/analytics", label: SURFACE.analytics.nav, icon: BarChart3, group: "insights" },

  // You
  { to: "/app/notifications", label: "Notifications", icon: Bell, group: "you" },
  { to: "/app/profile", label: "Profile", icon: User, group: "you" },
  { to: "/app/settings", label: "Settings", icon: Settings, group: "you" },
];

export const NAV_GROUP_ORDER: NavGroup[] = [
  "today",
  "library",
  "shelves",
  "collections",
  "memories",
  "saved",
  "people",
  "journey",
  "discover",
  "insights",
  "you",
];

export const GROUP_LABELS: Record<NavGroup, string> = {
  today: "Today's Story",
  library: "Library",
  shelves: "Shelves",
  collections: "Collections",
  memories: "Memories",
  saved: "Saved",
  people: "People & Worlds",
  journey: "Journey",
  discover: "Discover",
  insights: "Insights",
  you: "You",
};
