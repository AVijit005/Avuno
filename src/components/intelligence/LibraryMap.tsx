import { motion } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Map, Loader2 } from "lucide-react";
import { useIntelligence } from "@/hooks/use-analytics";
import type { TasteGenre } from "@/lib/types/intelligence";

const GENRE_COLORS: Record<string, string> = {
  "Sci-Fi": "var(--primary)",
  Cyberpunk: "oklch(0.65 0.22 295)",
  Fantasy: "oklch(0.78 0.16 50)",
  Drama: "oklch(0.72 0.16 160)",
  Action: "oklch(0.7 0.18 25)",
  Thriller: "oklch(0.5 0.1 200)",
  Comedy: "oklch(0.8 0.15 80)",
  Romance: "oklch(0.6 0.2 10)",
};

export function LibraryMap() {
  const { data: intelligence, isLoading } = useIntelligence();
  const tags: Array<{ name: string; count: number; color: string }> = (intelligence?.tasteProfile?.favoriteGenres ?? []).map((g: TasteGenre) => ({
    name: g.name,
    count: g.count,
    color: GENRE_COLORS[g.name] ?? "var(--primary)",
  }));

  if (isLoading) {
    return (
      <PremiumGlass className="p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </PremiumGlass>
    );
  }

  if (tags.length === 0) {
    return (
      <PremiumGlass className="p-6 h-[400px] flex flex-col relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.72_0.18_255)]">
            <Map size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl tracking-tight">Library Topography</h3>
            <p className="text-xs text-muted-foreground">Add more media to see your landscape</p>
          </div>
        </div>
      </PremiumGlass>
    );
  }

  return (
    <PremiumGlass className="p-6 h-[400px] flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.72_0.18_255)]">
          <Map size={20} />
        </div>
        <div>
          <h3 className="font-display text-xl tracking-tight">Library Topography</h3>
          <p className="text-xs text-muted-foreground">The landscape of your media diet</p>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-wrap content-center justify-center gap-3 p-4">
        {tags.map((tag, i: number) => {
          const size = Math.max(0.75, Math.min(2.5, tag.count / 15));

          return (
            <motion.div
              key={tag.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", bounce: 0.4 }}
              whileHover={{ scale: 1.1, zIndex: 20 }}
              className="flex items-center justify-center px-4 py-2 rounded-full cursor-pointer border border-white/5 bg-white/5 backdrop-blur-sm"
              style={{
                color: tag.color,
                fontSize: `${size}rem`,
                boxShadow: `0 4px 12px color-mix(in oklch, ${tag.color} 20%, transparent)`,
              }}
            >
              <span className="font-display font-medium tracking-tight drop-shadow-md">{tag.name}</span>
            </motion.div>
          );
        })}
      </div>

      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
    </PremiumGlass>
  );
}
