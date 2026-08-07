import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  collection?: {
    accent?: string;
    cover?: string | null;
    name?: string;
    description?: string | null;
  };
  index?: number;
}

export function SmartCollectionCard({ collection, index = 0 }: Props) {
  const accent = collection?.accent ?? "var(--primary)";
  const cover = collection?.cover ?? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to="/app/collections" className="group block h-full">
        <PremiumGlass 
          className="relative h-full min-h-[220px] overflow-hidden p-6 transition-all duration-500 group-hover:scale-[1.02]"
          style={{
            boxShadow: `0 8px 32px -8px color-mix(in oklch, ${accent} 25%, transparent)`,
            borderColor: `color-mix(in oklch, ${accent} 20%, rgba(255,255,255,0.1))`
          }}
        >
          {/* Background Image & Gradient */}
          <div className="absolute inset-0 z-0">
            <img src={cover} alt="" className="h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105" />
            <div 
              className="absolute inset-0 mix-blend-overlay"
              style={{
                background: `linear-gradient(135deg, color-mix(in oklch, ${accent} 80%, transparent) 0%, transparent 100%)`
              }}
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md"
                style={{ color: accent }}
              >
                <Sparkles size={20} />
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-md">
                Smart
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-display text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-white">
                {collection?.name ?? "Curated Collection"}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-white/80">
                {collection?.description ?? "A dynamic collection personalized to your tastes and recent activity."}
              </p>
              
              <div className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-widest transition-colors group-hover:text-white" style={{ color: accent }}>
                <span>Explore</span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </PremiumGlass>
      </Link>
    </motion.div>
  );
}
