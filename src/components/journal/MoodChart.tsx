import { motion, AnimatePresence } from "motion/react";

interface MoodDay {
  day: number;
  mood: string | null;
  color: string;
  intensity: number;
}

interface Props {
  moodTimeline: MoodDay[];
  hoveredDay: number | null;
  onHoverDay: (day: number | null) => void;
}

export function MoodChart({ moodTimeline, hoveredDay, onHoverDay }: Props) {
  const w = 600;
  const h = 160;
  const barWidth = Math.max(4, w / 30 - 8);

  return (
    <svg viewBox="0 0 600 180" className="h-[180px] w-full overflow-visible">
      <defs>
        <filter id="neon-glow-j" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {moodTimeline.map((d, i) => (
          <linearGradient key={i} id={`grad-j-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={d.color} stopOpacity="1" />
            <stop offset="100%" stopColor={d.color} stopOpacity="0.1" />
          </linearGradient>
        ))}
      </defs>
      <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5">
        <line x1="0" y1={h * 0.25} x2={w} y2={h * 0.25} />
        <line x1="0" y1={h * 0.5} x2={w} y2={h * 0.5} />
        <line x1="0" y1={h * 0.75} x2={w} y2={h * 0.75} />
      </g>
      {moodTimeline.map((d, i) => {
        const x = i * (w / 30) + 4;
        const barH = Math.max(12, d.intensity * (h - 20));
        const y = h - barH;
        const isHovered = hoveredDay === i;
        const isDimmed = hoveredDay !== null && !isHovered;

        return (
          <motion.g
            key={i}
            className="cursor-pointer"
            onHoverStart={() => onHoverDay(i)}
            onHoverEnd={() => onHoverDay(null)}
            initial={{ opacity: 0, y: h }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 25 }}
          >
            {isHovered && (
              <rect
                x={x - 2}
                y={y - 2}
                width={barWidth + 4}
                height={barH + 4}
                rx={(barWidth + 4) / 2}
                fill="none"
                stroke={d.color}
                strokeWidth="1.5"
                opacity={0.8}
                filter="url(#neon-glow-j)"
              />
            )}
            <motion.rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={barWidth / 2}
              fill={d.color}
              filter="url(#neon-glow-j)"
              animate={{ opacity: isHovered ? 0.8 : isDimmed ? 0.1 : 0.4 }}
              transition={{ duration: 0.3 }}
            />
            <motion.rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={barWidth / 2}
              fill={`url(#grad-j-${i})`}
              animate={{ opacity: isHovered ? 1 : isDimmed ? 0.3 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.g>
        );
      })}
      <g
        fill="currentColor"
        opacity="0.3"
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.2em"
        style={{ fontFamily: "inherit", textTransform: "uppercase" }}
      >
        <text x={0 * (w / 30) + 4} y={176}>
          Week 1
        </text>
        <text x={7 * (w / 30) + 4} y={176}>
          Week 2
        </text>
        <text x={14 * (w / 30) + 4} y={176}>
          Week 3
        </text>
        <text x={21 * (w / 30) + 4} y={176}>
          Week 4
        </text>
      </g>
      <AnimatePresence>
        {hoveredDay !== null && (
          <foreignObject
            x={hoveredDay * (w / 30) + 4 + barWidth / 2 - 100}
            y={-10}
            width={200}
            height={100}
            className="pointer-events-none overflow-visible"
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="flex h-full w-full flex-col items-center justify-start pt-2"
            >
              <div className="whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-[40px] saturate-200">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{
                      backgroundColor: moodTimeline[hoveredDay].color,
                      color: moodTimeline[hoveredDay].color,
                    }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                    Day {moodTimeline[hoveredDay].day}
                  </span>
                </div>
                <div
                  className="mt-1 font-display text-lg font-medium tracking-tight"
                  style={{ color: moodTimeline[hoveredDay].color }}
                >
                  {moodTimeline[hoveredDay].mood}
                </div>
              </div>
            </motion.div>
          </foreignObject>
        )}
      </AnimatePresence>
    </svg>
  );
}
