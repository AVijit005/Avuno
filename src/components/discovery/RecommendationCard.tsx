import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Sparkles, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface RecommendationItem {
  id: string;
  title: string;
  poster?: string;
  reason: string;
  match: number;
  accent?: string;
}

interface Props {
  item: RecommendationItem;
}

export function RecommendationCard({ item }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout>
      <PremiumGlass className="overflow-hidden relative group">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <Link
            to="/app/media/$id"
            params={{ id: item.id }}
            className="shrink-0 w-24 sm:w-28 rounded-lg overflow-hidden relative"
          >
            <img
              src={
                item.poster ||
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2594&auto=format&fit=crop"
              }
              alt={item.title}
              className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="flex flex-1 flex-col justify-between py-1">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                <span className="text-[oklch(0.72_0.18_160)] flex items-center gap-1">
                  <Sparkles size={12} /> {item.match}% Match
                </span>
              </div>
              <Link to="/app/media/$id" params={{ id: item.id }}>
                <h3 className="font-display text-xl font-medium tracking-tight hover:underline underline-offset-4">
                  {item.title}
                </h3>
              </Link>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              Why this?
              <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 overflow-hidden"
            >
              <div className="pt-3 border-t border-white/10 mt-1">
                <p className="text-sm leading-relaxed text-white/80">{item.reason}</p>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors">
                    Add to Watchlist
                  </button>
                  <button className="rounded-full bg-transparent border border-white/20 px-4 py-1.5 text-xs font-medium hover:bg-white/5 transition-colors text-muted-foreground">
                    Not Interested
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PremiumGlass>
    </motion.div>
  );
}
