import { mulberry } from "@/lib/seed";
import type { Collection } from "@/lib/types";

function hash(id: string) {
  let h = 0x12345678 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CollectionHeatmap({ collection }: { collection: Collection }) {
  const rng = mulberry(hash(collection.id));
  const cells = Array.from({ length: 12 * 7 }, () => rng());
  return (
    <div className="glass rounded-2xl p-5 ring-1 ring-white/5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Activity heatmap
      </div>
      <div className="mt-3 grid grid-cols-12 gap-1">
        {cells.map((v, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{ background: `oklch(0.72 0.18 255 / ${0.05 + v * 0.55})` }}
          />
        ))}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Soft glow = active month
      </div>
    </div>
  );
}
