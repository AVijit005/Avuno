import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import {
  Film,
  Tv,
  BookOpen,
  Gamepad2,
  Headphones,
  Music,
  GraduationCap,
  Youtube,
  Sparkles,
  Star,
  Clock,
  CheckCircle2,
  Pause,
  Play,
  X,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

/**
 * InteractiveProductDemo: Show real Avuno capabilities
 *
 * Truth-first demonstration of:
 * - 10 media types
 * - Status system
 * - Ratings
 * - Real product interactions
 *
 * No fake metrics. Just product truth.
 */

interface MediaType {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  examples: { title: string; meta: string; status: string }[];
}

const MEDIA_TYPES: MediaType[] = [
  {
    id: "movie",
    label: "Movies",
    icon: Film,
    color: "oklch(0.65 0.2 230)",
    examples: [
      { title: "The Shawshank Redemption", meta: "1994 · Drama", status: "completed" },
      { title: "Inception", meta: "2010 · Sci-Fi", status: "completed" },
      { title: "Parasite", meta: "2019 · Thriller", status: "planning" },
    ],
  },
  {
    id: "tvShow",
    label: "TV Series",
    icon: Tv,
    color: "oklch(0.72 0.18 255)",
    examples: [
      { title: "Breaking Bad", meta: "5 seasons · Drama", status: "completed" },
      { title: "The Bear", meta: "2 seasons · Comedy", status: "inProgress" },
      { title: "Severance", meta: "1 season · Sci-Fi", status: "planning" },
    ],
  },
  {
    id: "anime",
    label: "Anime",
    icon: Sparkles,
    color: "oklch(0.75 0.2 330)",
    examples: [
      { title: "Cowboy Bebop", meta: "26 episodes · 1998", status: "completed" },
      { title: "Steins;Gate", meta: "24 episodes · 2011", status: "inProgress" },
      { title: "Monster", meta: "74 episodes · 2004", status: "planning" },
    ],
  },
  {
    id: "book",
    label: "Books",
    icon: BookOpen,
    color: "oklch(0.72 0.16 80)",
    examples: [
      { title: "1984", meta: "George Orwell · Fiction", status: "completed" },
      { title: "Project Hail Mary", meta: "Andy Weir · Sci-Fi", status: "inProgress" },
      { title: "The Three-Body Problem", meta: "Liu Cixin · Sci-Fi", status: "planning" },
    ],
  },
  {
    id: "game",
    label: "Games",
    icon: Gamepad2,
    color: "oklch(0.68 0.22 140)",
    examples: [
      { title: "Elden Ring", meta: "FromSoftware · RPG", status: "completed" },
      { title: "Baldur's Gate 3", meta: "Larian · RPG", status: "inProgress" },
      { title: "Hollow Knight", meta: "Team Cherry · Metroidvania", status: "paused" },
    ],
  },
  {
    id: "musicAlbum",
    label: "Music",
    icon: Music,
    color: "oklch(0.7 0.18 25)",
    examples: [
      { title: "OK Computer", meta: "Radiohead · 1997", status: "completed" },
      { title: "Random Access Memories", meta: "Daft Punk · 2013", status: "completed" },
      { title: "The Dark Side of the Moon", meta: "Pink Floyd · 1973", status: "planning" },
    ],
  },
  {
    id: "podcast",
    label: "Podcasts",
    icon: Headphones,
    color: "oklch(0.62 0.2 295)",
    examples: [
      { title: "Radiolab", meta: "Science · WNYC", status: "inProgress" },
      { title: "99% Invisible", meta: "Design · PRX", status: "inProgress" },
      { title: "Reply All", meta: "Tech · Gimlet", status: "completed" },
    ],
  },
  {
    id: "course",
    label: "Courses",
    icon: GraduationCap,
    color: "oklch(0.65 0.18 200)",
    examples: [
      { title: "CS50", meta: "Harvard · Computer Science", status: "inProgress" },
      { title: "The Science of Well-Being", meta: "Yale · Psychology", status: "completed" },
      { title: "Learning How to Learn", meta: "UCSD · Meta-learning", status: "planning" },
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "oklch(0.65 0.25 20)",
    examples: [
      { title: "3Blue1Brown", meta: "Math · Educational", status: "inProgress" },
      { title: "Kurzgesagt", meta: "Science · Animated", status: "inProgress" },
      { title: "Nerdwriter1", meta: "Film Analysis", status: "completed" },
    ],
  },
];

const STATUS_CONFIG = {
  planning: { label: "Planning", icon: Clock, color: "oklch(0.65 0.15 240)" },
  inProgress: { label: "In Progress", icon: Play, color: "oklch(0.72 0.18 255)" },
  completed: { label: "Completed", icon: CheckCircle2, color: "oklch(0.68 0.22 140)" },
  paused: { label: "Paused", icon: Pause, color: "oklch(0.7 0.18 25)" },
  dropped: { label: "Dropped", icon: X, color: "oklch(0.6 0.18 20)" },
};

export function InteractiveProductDemo() {
  const [selectedType, setSelectedType] = useState<string>("movie");
  const [selectedExample, setSelectedExample] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentType = MEDIA_TYPES.find((t) => t.id === selectedType) || MEDIA_TYPES[0];
  const currentExample = currentType.examples[selectedExample];
  const currentStatus = STATUS_CONFIG[currentExample.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = currentStatus.icon;

  return (
    <section className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90 mb-3">
            Universal Library
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tight max-w-4xl mx-auto leading-[1.05]">
            <span className="text-gradient-aurora">Eight media types.</span>
            <br />
            <span className="italic text-muted-foreground">One unified home.</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Movies, series, anime, books, manga, games, music, podcasts, courses, and YouTube —
            every story you experience lives under one design language.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <div ref={containerRef} className="relative">
          {/* Media Type Selector */}
          <div className="-mx-4 sm:-mx-6 md:mx-0 overflow-x-auto pb-4 scrollbar-none">
            <div className="flex gap-2 px-4 sm:px-6 md:px-0 w-max md:w-full md:justify-center">
              {MEDIA_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                return (
                  <motion.button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setSelectedExample(0);
                    }}
                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm transition-all ${
                      isActive ? "text-white" : "text-muted-foreground hover:text-foreground glass"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: type.color }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="relative z-10 whitespace-nowrap">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Demo Display */}
          <motion.div
            layout
            className="mt-10 glass-elevated rounded-3xl p-6 md:p-10 border border-white/[0.06] shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Left: Preview */}
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedType}-${selectedExample}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Simulated Media Card */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                      <div className="flex items-start gap-4">
                        {/* Icon/Poster */}
                        <div
                          className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-white/10"
                          style={{ background: `${currentType.color}15` }}
                        >
                          <currentType.icon
                            className="h-8 w-8 md:h-10 md:w-10"
                            style={{ color: currentType.color }}
                          />
                        </div>

                        {/* Meta */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[10px] uppercase tracking-widest mb-2 font-medium"
                            style={{ color: currentType.color }}
                          >
                            {currentType.label.slice(0, -1)}
                          </div>
                          <h3 className="font-display text-xl md:text-2xl text-white mb-2 leading-tight">
                            {currentExample.title}
                          </h3>
                          <p className="text-sm text-white/60 mb-3">{currentExample.meta}</p>

                          {/* Status Badge */}
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                              background: `${currentStatus.color}20`,
                              color: currentStatus.color,
                            }}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {currentStatus.label}
                          </div>
                        </div>
                      </div>

                      {/* Rating (if completed) */}
                      {currentExample.status === "completed" && (
                        <div className="mt-5 pt-5 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40 uppercase tracking-widest">
                              Your rating
                            </span>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Example Selector */}
                <div className="mt-6 flex gap-2 justify-center">
                  {currentType.examples.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedExample(i)}
                      className={`h-2 rounded-full transition-all ${
                        selectedExample === i
                          ? "w-8 bg-primary"
                          : "w-2 bg-white/20 hover:bg-white/30"
                      }`}
                      aria-label={`Example ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Capabilities */}
              <div>
                <h3 className="font-display text-2xl text-foreground mb-4">
                  Track everything you experience
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Avuno supports <strong className="text-foreground">eight media types</strong>{" "}
                    natively — not through separate apps or scattered bookmarks, but in one unified
                    library with a single design language.
                  </p>
                  <p>
                    Every item has a <strong className="text-foreground">status</strong> (Planning,
                    In Progress, Completed, Paused, Dropped), optional ratings, tags, notes, and
                    full search.
                  </p>
                  <p>
                    Search our comprehensive catalog. Organize into{" "}
                    <strong className="text-foreground">Collections</strong>. Write{" "}
                    <strong className="text-foreground">Journal entries</strong>. Create{" "}
                    <strong className="text-foreground">Memories</strong>. Everything stays
                    connected.
                  </p>

                  <div className="pt-4 mt-4 border-t border-white/5">
                    <div className="glass-subtle rounded-xl p-4">
                      <div className="text-[10px] uppercase tracking-widest text-primary/80 mb-2">
                        Product Truth
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        This is not a mockup. These media types, statuses, and interactions exist in
                        Avuno today. No fake features. No vapor promises.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status System Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 md:mt-16"
        >
          <div className="glass-subtle rounded-2xl p-6 md:p-8 border border-white/5">
            <h4 className="font-display text-lg text-foreground mb-4">
              Status system that respects reality
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02]"
                  >
                    <Icon className="h-4 w-4 shrink-0" style={{ color: config.color }} />
                    <span className="text-xs text-white/70">{config.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Not every game gets finished. Not every book gets completed. Avuno doesn't judge — it
              just tracks what's true.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
