import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MemoryChipVariant = "mood" | "season" | "weather" | "companion" | "location" | "impact";

interface Props {
  variant: MemoryChipVariant;
  label: string;
  icon?: ReactNode;
  className?: string;
}

const labelByVariant: Record<MemoryChipVariant, string> = {
  mood: "Mood",
  season: "Season",
  weather: "Weather",
  companion: "With",
  location: "Where",
  impact: "Impact",
};

export function MemoryChip({ variant, label, icon, className }: Props) {
  return (
    <span
      aria-label={`${labelByVariant[variant]}: ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-tight",
        "glass-subtle text-foreground/80 border border-foreground/[0.08] hover:bg-foreground/[0.1] transition-[background-color,transform] duration-[140ms] active:scale-[0.96]",
        className,
      )}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      <span className="uppercase tracking-[0.16em] text-muted-foreground/80">
        {labelByVariant[variant]}
      </span>
      <span className="text-foreground/90">{label}</span>
    </span>
  );
}
