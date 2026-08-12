// Depth/layer presets — consistent z, shadow, blur tokens for surfaces.
export const depth = {
  surface: { z: 0, className: "bg-background" },
  card: { z: 10, className: "glass" },
  floating: { z: 20, className: "glass-elevated shadow-[0_18px_44px_-22px_oklch(0_0_0/0.6)]" },
  overlay: { z: 40, className: "bg-black/60 backdrop-blur-sm" },
  modal: { z: 50, className: "glass-elevated shadow-[0_30px_80px_-30px_oklch(0_0_0/0.7)]" },
  drawer: { z: 50, className: "glass-elevated" },
  tooltip: { z: 60, className: "glass-elevated text-xs" },
  toast: { z: 70, className: "glass-elevated" },
  dropdown: { z: 50, className: "glass-elevated" },
  menu: { z: 50, className: "glass" },
} as const;

export type DepthLayer = keyof typeof depth;
