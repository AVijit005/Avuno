import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getConstellation } from "@/lib/api/analytics";
import { PremiumGlass } from "../ui/PremiumGlass";

const AVAILABLE_CATEGORIES = [
  "Movies",
  "Anime",
  "Series",
  "Books",
  "Manga",
  "Games",
  "Music",
  "Podcasts",
  "Courses",
  "YouTube",
];

export function MediaConstellation() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Movies",
    "Books",
    "Games",
    "Anime",
  ]);

  const { data: constellationData = [], isLoading } = useQuery({
    queryKey: ["analytics", "constellation", selectedCategories],
    queryFn: () => getConstellation(selectedCategories),
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      // Prevent unselecting the very last category
      if (prev.includes(cat) && prev.length === 1) return prev;
      return prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
    });
  };

  // Cinematic Autoplay
  useEffect(() => {
    if (hovered !== null || constellationData.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % constellationData.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [hovered, constellationData.length]);

  const activeItem = hovered
    ? constellationData.find((d) => d.label === hovered) || constellationData[0]
    : constellationData[activeIndex] || constellationData[0];

  return (
    <PremiumGlass className="relative flex flex-col p-4 md:p-5 overflow-hidden min-h-[280px]">
      {/* Option A: Glassmorphic Filter Chips */}
      <div className="relative z-20 w-full overflow-x-auto pb-2 mb-0 flex items-center gap-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mr-1 shrink-0">
          Filter:
        </div>
        {AVAILABLE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-[background-color,border-color,color,box-shadow] duration-300 border ${
                isSelected
                  ? "bg-white/10 border-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] backdrop-blur-md"
                  : "bg-transparent border-white/5 text-muted-foreground/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isSelected ? "✓ " : ""}
              {cat}
            </button>
          );
        })}
      </div>

      {isLoading || constellationData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
          Syncing with backend...
        </div>
      ) : (
        <>
          {/* Background Ambient Aura */}
          <div
            className="absolute inset-0 transition-colors duration-1000 ease-out pointer-events-none opacity-[0.08]"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${activeItem?.color || "transparent"}, transparent 70%)`,
              maskImage: "radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)",
            }}
          />

          {/* Top Section: The Huge Readout */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-1 pb-2 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem?.label || "default"}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)", scale: 0.95 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)", scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/80 mb-1">
                  {activeItem?.label}
                </div>

                <div
                  className="font-display font-semibold tracking-tighter"
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 4rem)",
                    lineHeight: 1,
                    color: "white",
                    textShadow: `0 0 40px ${activeItem?.color}, 0 4px 10px rgba(0,0,0,0.5)`,
                  }}
                >
                  {activeItem?.value}%
                </div>

                <div className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase mt-1 opacity-80 flex items-center gap-2">
                  <span className="w-4 h-px bg-white/20" />
                  {activeItem?.count} entries
                  <span className="w-4 h-px bg-white/20" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Middle Section: The Tactical Lightbar */}
          <div className="relative z-10 w-full flex flex-col items-center my-2">
            <div className="w-full flex items-end gap-1 md:gap-1.5 h-12">
              {constellationData.map((item) => {
                const isHovered = hovered === item.label;
                const isAutoActive = hovered === null && activeItem?.label === item.label;
                const isActive = isHovered || isAutoActive;
                const isDimmed = !isActive;

                return (
                  <motion.div
                    key={item.label}
                    className="relative rounded-full cursor-pointer overflow-hidden origin-bottom"
                    style={{ width: `${item.value}%` }}
                    initial={{ height: 8, opacity: 0 }}
                    animate={{
                      height: isActive ? 36 : 12,
                      opacity: isDimmed ? 0.3 : 1,
                      filter: isActive
                        ? `drop-shadow(0 0 12px ${item.color}80)`
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                    }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className="absolute inset-0 w-full h-full"
                      style={{
                        background: `linear-gradient(180deg, color-mix(in srgb, ${item.color} 70%, white) 0%, ${item.color} 40%, color-mix(in srgb, ${item.color} 40%, black) 100%)`,
                        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.8)`,
                      }}
                    />
                    <div
                      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay"
                      style={{
                        background:
                          "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 30%, transparent 40%)",
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>

            <div className="w-full flex justify-between px-1 mt-1 opacity-20">
              {[...Array(11)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-px ${i % 5 === 0 ? "h-1.5 bg-white" : "h-[3px] bg-white/50"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: The Legend Grid */}
          <div className="relative z-10 mt-auto flex flex-wrap justify-center gap-3 md:gap-4 w-full pt-4">
            <AnimatePresence mode="popLayout">
              {constellationData.map((item) => {
                const isHovered = hovered === item.label;
                const isAutoActive = hovered === null && activeItem?.label === item.label;
                const isActive = isHovered || isAutoActive;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={item.label}
                    className={`flex-1 min-w-[140px] max-w-[200px] flex flex-col gap-3 p-4 rounded-2xl transition-[transform,box-shadow,background-color,border-color] duration-300 cursor-pointer border ${isActive ? "bg-white/10 border-white/10 shadow-xl scale-[1.02]" : "border-transparent hover:bg-white/[0.04]"}`}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full transition-transform duration-500"
                        style={{
                          background: item.color,
                          boxShadow: isActive
                            ? `0 0 12px ${item.color}, 0 0 16px ${item.color}`
                            : `0 0 8px ${item.color}60`,
                          transform: isActive ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                      <div
                        className={`text-[9px] font-bold tracking-widest uppercase transition-colors duration-500 ${isActive ? "text-foreground" : "text-foreground/70"}`}
                      >
                        {item.label}
                      </div>
                    </div>
                    <div className="flex items-end justify-between mt-0.5">
                      <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">
                        {item.count} items
                      </div>
                      <div className="text-lg font-display font-semibold text-foreground/90 leading-none">
                        {item.value}%
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}
    </PremiumGlass>
  );
}
