import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
interface Props {
  heatmap?: { w: number; d: number; v: number }[];
}

export function MediaHeatmap({ heatmap }: Props) {
  const cells = heatmap?.length ? heatmap : [];

  return (
    <PremiumGlass className="p-6 md:p-8 border border-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
      <div className="overflow-x-auto pb-2">
        <div
          className="grid grid-rows-7 gap-1"
          style={{ gridTemplateColumns: `repeat(52, minmax(10px, 1fr))` }}
        >
          <TooltipProvider delayDuration={0}>
            {cells.map((c, i: number) => {
              const isActive = c.v >= 0.15;
              const opacity = isActive ? Math.min(1, 0.15 + c.v * 0.85) : 0;
              return (
                <Tooltip key={`${c.w}-${c.d}`}>
                  <TooltipTrigger asChild>
                    <div
                      className="relative aspect-square rounded-[3px] cursor-crosshair overflow-hidden group transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                      role="img"
                      aria-label={`Week ${c.w + 1}, Day ${c.d + 1}: ${(c.v * 100).toFixed(0)}% activity`}
                      style={{
                        gridColumnStart: c.w + 1,
                        gridRowStart: c.d + 1,
                        backgroundColor: "rgba(0, 0, 0, 0.25)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background: `radial-gradient(150% 150% at 50% 50%, oklch(0.72 0.18 255 / ${opacity}) 0%, oklch(0.72 0.18 255 / 0) 100%)`,
                          }}
                        />
                      )}
                      {isActive && (
                        <div
                          className="absolute inset-0 blur-[2px] transition-opacity duration-500"
                          style={{ backgroundColor: "var(--primary)", opacity: opacity * 0.4 }}
                        />
                      )}
                      <div
                        className="absolute inset-0 pointer-events-none border border-white/5 group-hover:border-white/20 transition-colors"
                        style={{
                          boxShadow:
                            "inset 0 1px 1px 0 rgba(255,255,255,0.2), inset 0 -1px 1px 0 rgba(0,0,0,0.6)",
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="text-[11px] font-medium tracking-wide"
                  >
                    <span className="opacity-70 uppercase text-[9px] tracking-[0.1em]">
                      Week {c.w + 1} · Day {c.d + 1}
                    </span>
                    <span className="mx-2 text-primary/40">|</span>
                    <span className="text-white">{(c.v * 100).toFixed(0)}% Activity</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Less{" "}
        <span className="flex gap-1">
          {[0.1, 0.3, 0.5, 0.7, 0.95].map((v, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-[3px]"
              style={{
                background:
                  v < 0.15
                    ? "oklch(1 0 0 / 0.05)"
                    : v < 0.4
                      ? "oklch(0.72 0.18 255 / 0.3)"
                      : v < 0.6
                        ? "oklch(0.72 0.18 255 / 0.55)"
                        : v < 0.8
                          ? "oklch(0.72 0.18 255 / 0.8)"
                          : "oklch(0.72 0.18 255 / 1)",
              }}
            />
          ))}
        </span>{" "}
        More
      </div>
    </PremiumGlass>
  );
}
