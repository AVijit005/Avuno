import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { PosterCard } from "@/components/ui/PosterCard";
import type { MediaItem } from "@/lib/types";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  items?: (MediaItem | UIMediaItem)[];
}

/**
 * Titles the user returns to.
 *
 * When no items were passed this previously fell back to four hardcoded
 * entries — Spirited Away, The Office, Stardew Valley, Harry Potter — with
 * invented rewatch counts, rendered under "Media you keep coming back to".
 * A brand-new user with an empty library was shown someone else's comfort
 * viewing as their own.
 */
export function ComfortStories({ items = [] }: Props) {
  const displayItems = items;

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
