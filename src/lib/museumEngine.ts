// Personal Museum — curated editorial selections.
// Items resolve from live library data passed by consuming components.
import type { MediaItem } from "@/lib/types";

export interface MuseumGallery {
  id: string;
  title: string;
  subtitle: string;
  items: MediaItem[];
}

export function getMuseum(): MuseumGallery[] {
  return [
    { id: "emotional", title: "Most Emotional", subtitle: "Stories that left a mark.", items: [] },
    { id: "beautiful", title: "Most Beautiful", subtitle: "Visually unforgettable.", items: [] },
    {
      id: "impactful",
      title: "Most Impactful",
      subtitle: "Changed how you see things.",
      items: [],
    },
    { id: "nostalgic", title: "Most Nostalgic", subtitle: "The early loves.", items: [] },
    {
      id: "replayed",
      title: "Most Replayed",
      subtitle: "Returned to, again and again.",
      items: [],
    },
    { id: "inspiring", title: "Most Inspiring", subtitle: "Lit something inside.", items: [] },
    {
      id: "masterpieces",
      title: "Personal Masterpieces",
      subtitle: "Your highest shelf.",
      items: [],
    },
  ];
}
