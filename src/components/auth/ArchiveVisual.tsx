import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/**
 * ArchiveVisual — Auth Hero
 *
 * An abstract "connected personal archive" visualization.
 * Media type nodes linked by relationship lines, orbiting
 * a central "memory" core. Each node represents a media type
 * Avuno tracks. Pure CSS/SVG — no images, no WebGL, no canvas.
 *
 * Visual hierarchy:
 *  - Background atmosphere (deep, grounded)
 *  - Connection lines (subtle, structural)
 *  - Node cluster (media types, each with distinct identity)
 *  - Ambient lighting (warm-cool contrast)
 *  - Film grain overlay
 */

type Node = {
  id: string;
  label: string;
  icon: string;
  cx: number; // % of viewBox
  cy: number;
  r: number; // radius px
  color: string;
  accentColor: string;
  delay: number;
  orbitRadius: number;
  orbitDuration: number;
  orbitOffsetDeg: number;
};

const CENTER_X = 50;
const CENTER_Y = 52;

const NODES: Node[] = [
  {
    id: "film",
    label: "Film",
    icon: "◈",
    cx: 50,
    cy: 22,
    r: 28,
    color: "oklch(0.45 0.15 255)",
    accentColor: "oklch(0.72 0.18 255)",
    delay: 0,
    orbitRadius: 30,
    orbitDuration: 42,
    orbitOffsetDeg: 90,
  },
  {
    id: "series",
    label: "Series",
    icon: "⬡",
    cx: 76,
    cy: 38,
    r: 22,
    color: "oklch(0.40 0.14 295)",
    accentColor: "oklch(0.68 0.20 295)",
    delay: 0.1,
    orbitRadius: 27,
    orbitDuration: 38,
    orbitOffsetDeg: 10,
  },
  {
    id: "books",
    label: "Books",
    icon: "◻",
    cx: 72,
    cy: 66,
    r: 20,
    color: "oklch(0.42 0.10 80)",
    accentColor: "oklch(0.78 0.14 80)",
    delay: 0.2,
    orbitRadius: 24,
    orbitDuration: 46,
    orbitOffsetDeg: 330,
  },
  {
    id: "games",
    label: "Games",
    icon: "◇",
    cx: 28,
    cy: 68,
    r: 20,
    color: "oklch(0.42 0.16 160)",
    accentColor: "oklch(0.72 0.16 160)",
    delay: 0.15,
    orbitRadius: 26,
    orbitDuration: 50,
    orbitOffsetDeg: 210,
  },
  {
    id: "music",
    label: "Music",
    icon: "◉",
    cx: 24,
    cy: 38,
    r: 20,
    color: "oklch(0.42 0.14 25)",
    accentColor: "oklch(0.72 0.18 25)",
    delay: 0.05,
    orbitRadius: 25,
    orbitDuration: 44,
    orbitOffsetDeg: 170,
  },
  {
    id: "anime",
    label: "Anime",
    icon: "◈",
    cx: 50,
    cy: 82,
    r: 18,
    color: "oklch(0.40 0.18 330)",
    accentColor: "oklch(0.70 0.20 330)",
    delay: 0.25,
    orbitRadius: 22,
    orbitDuration: 36,
    orbitOffsetDeg: 270,
  },
];

// Connection pairs: which nodes are connected to each other
const CONNECTIONS: Array<[string, string]> = [
  ["film", "series"],
  ["series", "books"],
  ["books", "games"],
  ["games", "music"],
  ["music", "film"],
  ["film", "anime"],
  ["anime", "games"],
  ["series", "anime"],
];

function getNodeCenter(id: string): { x: number; y: number } {
  const node = NODES.find((n) => n.id === id);
  if (!node) return { x: CENTER_X, y: CENTER_Y };
  return { x: node.cx, y: node.cy };
}

export function ArchiveVisual() {
  const reduced = useReducedMotion();

  // Small dot satellites — no procedural blobs, deliberate accent marks
  const satellites = useMemo(() => {
    return [
      { x: 62, y: 30, r: 3, opacity: 0.45, color: "oklch(0.72 0.18 255)", d: 8 },
      { x: 38, y: 55, r: 2, opacity: 0.35, color: "oklch(0.68 0.20 295)", d: 12 },
      { x: 58, y: 74, r: 2.5, opacity: 0.4, color: "oklch(0.78 0.14 80)", d: 10 },
      { x: 34, y: 28, r: 2, opacity: 0.3, color: "oklch(0.72 0.16 160)", d: 14 },
      { x: 70, y: 52, r: 2, opacity: 0.35, color: "oklch(0.70 0.20 330)", d: 9 },
    ];
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden
      style={{ background: "oklch(0.09 0.015 270)" }}
    >
      {/* === BACKGROUND ATMOSPHERE === */}
      {/* Primary cool glow — top-left, anchors the visual */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "5%",
          top: "10%",
          width: "55%",
          height: "55%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.45 0.18 255 / 0.22) 0%, oklch(0.35 0.14 255 / 0.10) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Warm counter-point — bottom-right */}
      <div
        className="pointer-events-none absolute"
        style={{
          right: "5%",
          bottom: "10%",
          width: "45%",
          height: "45%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.55 0.14 25 / 0.14) 0%, transparent 68%)",
          filter: "blur(50px)",
        }}
      />
      {/* Purple mid-field */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "30%",
          top: "35%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.45 0.20 295 / 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* === SVG CANVAS === */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Connection line gradient */}
          {NODES.map((node) => (
            <radialGradient
              key={`grad-${node.id}`}
              id={`node-grad-${node.id}`}
              cx="50%"
              cy="35%"
              r="65%"
            >
              <stop offset="0%" stopColor={node.accentColor} stopOpacity="0.9" />
              <stop offset="60%" stopColor={node.color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={node.color} stopOpacity="0.3" />
            </radialGradient>
          ))}
          {/* Core gradient */}
          <radialGradient id="core-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="oklch(0.72 0.12 255)" stopOpacity="0.9" />
            <stop offset="55%" stopColor="oklch(0.45 0.16 270)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.30 0.12 270)" stopOpacity="0.4" />
          </radialGradient>
          {/* Line gradient */}
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.18 255)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="oklch(0.68 0.20 295)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="oklch(0.70 0.16 255)" stopOpacity="0.08" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft filter for connections */}
          <filter id="line-soft" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.2" />
          </filter>
        </defs>

        {/* === CONNECTIONS — rendered below nodes === */}
        {CONNECTIONS.map(([aId, bId], i) => {
          const a = getNodeCenter(aId);
          const b = getNodeCenter(bId);
          // Gentle cubic bezier through center region
          const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * 8;
          const my = (a.y + b.y) / 2 + (Math.random() - 0.5) * 8;
          return (
            <motion.path
              key={`conn-${aId}-${bId}`}
              d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
              fill="none"
              stroke="url(#line-grad)"
              strokeWidth="0.3"
              filter="url(#line-soft)"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{
                duration: reduced ? 0 : 1.2,
                delay: reduced ? 0 : 0.3 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}

        {/* Connections to center core */}
        {NODES.map((node, i) => (
          <motion.line
            key={`core-conn-${node.id}`}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={node.cx}
            y2={node.cy}
            stroke={node.accentColor}
            strokeWidth="0.15"
            strokeOpacity="0.18"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduced ? 0 : 0.8,
              delay: reduced ? 0 : 0.6 + i * 0.05,
            }}
          />
        ))}

        {/* === SATELLITE DOTS === */}
        {satellites.map((s, i) => (
          <motion.circle
            key={`sat-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r / 10}
            fill={s.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              reduced
                ? { opacity: s.opacity, scale: 1 }
                : {
                    opacity: [s.opacity * 0.5, s.opacity, s.opacity * 0.6, s.opacity],
                    scale: [0.8, 1, 0.85, 1],
                  }
            }
            transition={{
              duration: reduced ? 0.3 : s.d,
              delay: reduced ? 0 : i * 0.2,
              repeat: reduced ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* === CORE NODE — center of the archive === */}
        <motion.g
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Outer glow ring */}
          <motion.circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={5.5}
            fill="none"
            stroke="oklch(0.72 0.18 255)"
            strokeWidth="0.2"
            strokeOpacity="0.3"
            animate={reduced ? undefined : { r: [5.5, 6.5, 5.5], opacity: [0.3, 0.6, 0.3] }}
            transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Core circle */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={3.5}
            fill="url(#core-grad)"
            filter="url(#node-glow)"
          />
          {/* Core inner bright spot */}
          <circle
            cx={CENTER_X - 0.8}
            cy={CENTER_Y - 0.8}
            r={1.2}
            fill="oklch(0.92 0.06 255)"
            fillOpacity="0.7"
          />
          {/* Core label */}
          <text
            x={CENTER_X}
            y={CENTER_Y + 5.8}
            textAnchor="middle"
            fontSize="1.8"
            fill="oklch(0.72 0.18 255)"
            fillOpacity="0.7"
            fontFamily="'Inter', sans-serif"
            letterSpacing="0.3"
            style={{ textTransform: "uppercase" }}
          >
            Archive
          </text>
        </motion.g>

        {/* === MEDIA TYPE NODES === */}
        {NODES.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reduced ? 0 : 0.7,
              delay: reduced ? 0 : 0.2 + i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Outer ring */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r / 10 + 1.2}
              fill="none"
              stroke={node.accentColor}
              strokeWidth="0.2"
              strokeOpacity="0.25"
              animate={
                reduced
                  ? undefined
                  : {
                      r: [node.r / 10 + 1.2, node.r / 10 + 1.8, node.r / 10 + 1.2],
                      opacity: [0.25, 0.5, 0.25],
                    }
              }
              transition={
                reduced
                  ? undefined
                  : {
                      duration: node.orbitDuration * 0.3,
                      delay: node.delay * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
            {/* Node body */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r / 10}
              fill={`url(#node-grad-${node.id})`}
              filter="url(#node-glow)"
            />
            {/* Highlight */}
            <circle
              cx={node.cx - node.r / 30}
              cy={node.cy - node.r / 30}
              r={node.r / 35}
              fill="white"
              fillOpacity="0.55"
            />
            {/* Label */}
            <text
              x={node.cx}
              y={node.cy + node.r / 10 + 2}
              textAnchor="middle"
              fontSize="1.6"
              fill={node.accentColor}
              fillOpacity="0.65"
              fontFamily="'Inter', sans-serif"
              letterSpacing="0.25"
            >
              {node.label}
            </text>
          </motion.g>
        ))}

        {/* === TIMELINE ARC — subtle, suggests time passing === */}
        <motion.path
          d={`M 15 85 Q 50 78 85 85`}
          fill="none"
          stroke="oklch(0.72 0.12 255)"
          strokeWidth="0.15"
          strokeOpacity="0.12"
          strokeDasharray="0.5 1.5"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 1.5, delay: reduced ? 0 : 1.2 }}
        />

        {/* Tick marks on timeline */}
        {[20, 30, 40, 50, 60, 70, 80].map((x) => (
          <motion.line
            key={`tick-${x}`}
            x1={x}
            y1={84.2}
            x2={x}
            y2={85.5}
            stroke="oklch(0.72 0.12 255)"
            strokeWidth="0.12"
            strokeOpacity="0.18"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 1.5 + (x - 20) * 0.02 }}
          />
        ))}

        <motion.text
          x="50"
          y="88.5"
          textAnchor="middle"
          fontSize="1.5"
          fill="oklch(0.68 0.012 270)"
          fillOpacity="0.35"
          fontFamily="'Inter', sans-serif"
          letterSpacing="0.4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 1.8 }}
        >
          YOUR TIMELINE
        </motion.text>
      </svg>

      {/* === FILM GRAIN OVERLAY === */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.8'/></svg>\")",
        }}
      />

      {/* === RIGHT EDGE FADE — blends into form panel === */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[18%]"
        style={{
          background: "linear-gradient(to right, transparent, oklch(0.08 0.02 270 / 0.85))",
        }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[15%]"
        style={{
          background: "linear-gradient(to top, oklch(0.09 0.015 270), transparent)",
        }}
      />
    </div>
  );
}
