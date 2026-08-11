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

export type NavGroup = "core" | "insights";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group?: NavGroup;
}

export const NAV: NavItem[] = [
  // Core Experience
  { to: "/app", label: "Home", icon: Home, group: "core" },
  { to: "/app/library", label: "Library", icon: Library, group: "core" },
  { to: "/app/journal", label: "Journal", icon: NotebookPen, group: "core" },
  { to: "/app/timeline", label: "Timeline", icon: Clock, group: "core" },

  // Discover & Insights
  { to: "/app/collections", label: "Collections", icon: Layers, group: "insights" },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, group: "insights" },
];

export const NAV_GROUP_ORDER: NavGroup[] = ["core", "insights"];

export const GROUP_LABELS: Record<NavGroup, string> = {
  core: "Your Space",
  insights: "Curation & Insights",
};
