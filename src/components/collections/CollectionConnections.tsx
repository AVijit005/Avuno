import { getCollectionRelations } from "@/lib/collectionRelationships";
import type { Collection } from "@/lib/types";

export function CollectionConnections({ collection: c }: { collection: Collection }) {
  const rels = getCollectionRelations(c);
  const cx = 200,
    cy = 140,
    r = 110;
  return (
    <div className="glass rounded-3xl p-6 ring-1 ring-white/5">
      <svg viewBox="0 0 400 280" className="mx-auto w-full max-w-2xl">
        {rels.map((rel, i) => {
          const a = (i / rels.length) * Math.PI * 2;
          const x = cx + Math.cos(a) * r,
            y = cy + Math.sin(a) * r;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(1 0 0 / 0.1)" />
              <circle
                cx={x}
                cy={y}
                r="22"
                fill="oklch(0.16 0.02 270 / 0.8)"
                stroke="oklch(0.72 0.18 255 / 0.4)"
              />
              <text
                x={x}
                y={y - 26}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                className="fill-muted-foreground"
                style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                {rel.kind}
              </text>
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="currentColor">
                {rel.label.slice(0, 14)}
              </text>
            </g>
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r="40"
          fill="oklch(0.16 0.02 270)"
          stroke={c.accent}
          strokeWidth="1.5"
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          className="font-display"
        >
          {c.name.slice(0, 14)}
        </text>
      </svg>
    </div>
  );
}
