import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Search } from "lucide-react";

interface Props {
  collections: Array<{
    id: string;
    cover?: string;
    name: string;
    description?: string;
  }>;
}

const FILTERS = ["All", "Smart", "Curated", "Seasonal", "Franchise"];

export function CollectionExplorer({ collections }: Props) {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors"
              style={{
                color: activeFilter === f ? "#000" : "rgba(255,255,255,0.6)"
              }}
            >
              {activeFilter === f && (
                <motion.div
                  layoutId="explorer-active-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>
        
        <PremiumGlass className="flex items-center gap-2 rounded-full px-4 py-2">
          <Search size={14} className="text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search collections..."
            aria-label="Search collections"
            className="bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </PremiumGlass>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {collections?.length > 0 ? (
            collections.map((c) => (
              <motion.div
                layout
                key={c.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {/* Fallback card content, since the actual SmartCollectionCard takes a specific collection */}
                <PremiumGlass className="h-48 rounded-2xl p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src={c.cover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-50" />
                  <div className="relative z-20">
                    <h3 className="font-display text-xl">{c.name}</h3>
                    <p className="text-sm text-white/60 line-clamp-1 mt-1">{c.description}</p>
                  </div>
                </PremiumGlass>
              </motion.div>
            ))
          ) : (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-12 text-center text-muted-foreground">
              No collections found matching your criteria.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
