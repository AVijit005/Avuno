import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ease } from "@/lib/motion";

interface CollageItem {
  id: string;
  image: string;
  alt?: string;
  node?: ReactNode;
}

/** 1 large + 3 small poster composition with controlled rotation. */
export function Collage({ items }: { items: CollageItem[] }) {
  const [hero, ...rest] = items;
  if (!hero) return null;
  const rotations = ["-rotate-2", "rotate-1", "-rotate-1"];
  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: ease.reveal }}
        className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/8"
        style={{ boxShadow: "0 40px 80px -40px oklch(0 0 0 / 0.8)" }}
      >
        {hero.image ? (
          <img src={hero.image} alt={hero.alt ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10" />
        )}
        {hero.node && <div className="absolute inset-x-0 bottom-0 p-5">{hero.node}</div>}
      </motion.div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4">
        {rest.slice(0, 3).map((it, i) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ease.out, delay: 0.1 + i * 0.08 }}
            className={`relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/8 transition-transform duration-[var(--dur-large)] ease-[var(--ease-out)] hover:rotate-0 md:aspect-[4/3] ${rotations[i]}`}
            style={{ boxShadow: "0 20px 40px -24px oklch(0 0 0 / 0.7)" }}
          >
            <img src={it.image} alt={it.alt ?? ""} className="h-full w-full object-cover" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
