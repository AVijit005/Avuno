import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { PosterCard } from "@/components/ui/PosterCard";
import type { MediaItem } from "@/lib/types";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  items?: (MediaItem | UIMediaItem)[];
}

export function ComfortStories({ items = [] }: Props) {
  // Use mock items if none provided
  const displayItems =
    items.length > 0
      ? items
      : ([
          {
            id: "cs1",
            mediaId: "cs1",
            _mediaId: "cs1",
            title: "Spirited Away",
            poster: "linear-gradient(135deg, #1a2e2d 0%, #164a4a 50%, #0f7a6f 100%)",
            mediaType: "movie",
            rewatchCount: 5,
            accent: "var(--primary)",
          },
          {
            id: "cs2",
            mediaId: "cs2",
            _mediaId: "cs2",
            title: "The Office",
            poster: "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)",
            mediaType: "tv",
            rewatchCount: 8,
            accent: "var(--primary)",
          },
          {
            id: "cs3",
            mediaId: "cs3",
            _mediaId: "cs3",
            title: "Stardew Valley",
            poster: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)",
            mediaType: "game",
            rewatchCount: 12,
            accent: "var(--primary)",
          },
          {
            id: "cs4",
            mediaId: "cs4",
            _mediaId: "cs4",
            title: "Harry Potter",
            poster: "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)",
            mediaType: "book",
            rewatchCount: 3,
            accent: "var(--primary)",
          },
        ] as unknown as UIMediaItem[]);

  if (displayItems.length === 0) return null;

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl tracking-tight">
            <Heart size={20} className="text-primary" />
            Comfort Stories
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Media you keep coming back to when you need a warm hug.
          </p>
        </div>
      </div>

      <div className="relative -mx-6 overflow-x-auto pb-4 pt-2 hide-scrollbar">
        <div className="flex w-max gap-4 px-6">
          {displayItems.map((item, i) => (
            <motion.div
              key={"mediaId" in item ? item.mediaId : item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="w-[140px] sm:w-[160px] md:w-[180px]"
            >
              <PosterCard item={item} />
              <div className="mt-2 text-center text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {"rewatchCount" in item ? item.rewatchCount : 0}
                </span>{" "}
                revisits
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
