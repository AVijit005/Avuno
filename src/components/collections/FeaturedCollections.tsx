import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";

export function FeaturedCollections() {
  const { data: collections } = useCollections();
  const allCollections = collections?.map(adaptCollectionResponse) ?? [];
  // Use pinned collections as "featured", fallback to first 3
  const featured = allCollections.filter((c) => c.isPinned).slice(0, 3);
  const display = featured.length >= 3 ? featured : allCollections.slice(0, 3);

  if (display.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr_1fr]">
      {display.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/app/collections/$id"
            params={{ id: c.id }}
            className="group relative block aspect-[3/2] overflow-hidden rounded-[32px] ring-1 ring-white/10"
          >
            <img
              src={c.cover ?? ""}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(125deg, transparent 30%, ${c.color ?? "var(--primary)"} / 0.35, oklch(0 0 0 / 0.85))`,
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition duration-700 group-hover:translate-x-0 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(120deg, transparent 35%, oklch(1 0 0 / 0.16) 50%, transparent 65%)",
                mixBlendMode: "overlay",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="glass-subtle inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/85">
                Featured · {c.itemCount} items
              </div>
              <div className="mt-3 font-display text-3xl leading-tight text-white md:text-4xl">
                {c.name}
              </div>
              <div className="mt-2 max-w-md text-sm text-white/75">{c.description}</div>
            </div>
            <div className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
