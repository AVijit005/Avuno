import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";
import type { UICollection } from "@/lib/adapters/types";

export function RelatedCollections({ exclude }: { exclude: string }) {
  const { data: collections } = useCollections();
  const allCollections = collections?.map(adaptCollectionResponse) ?? [];
  const items = allCollections.filter((c) => c.id !== exclude);
  return (
    <div className="-mx-2 flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
      {items.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="px-2"
        >
          <Mini c={c} />
        </motion.div>
      ))}
    </div>
  );
}

function Mini({ c }: { c: UICollection }) {
  const coverSrc = c.cover ?? c.items?.[0]?.posterUrl ?? "";
  const accent = c.color ?? "var(--primary)";
  return (
    <Link
      to="/app/collections/$id"
      params={{ id: c.id }}
      className="group relative block h-44 w-72 overflow-hidden rounded-2xl ring-1 ring-white/10"
    >
      <img
        src={coverSrc}
        alt=""
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 40%, ${accent.startsWith("var(") ? `color-mix(in oklch, ${accent}, transparent 60%)` : `${accent}66`}, oklch(0 0 0 / 0.85))`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="font-display text-lg text-white">{c.name}</div>
        <div className="text-[11px] text-white/70">{c.itemCount} items</div>
      </div>
    </Link>
  );
}
