import { cn } from "@/lib/utils";

export function TasteChip({
  label,
  count,
  className,
}: {
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "glass-subtle inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] text-foreground/80 transition-[transform,border-color,color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground hover:shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_20px_oklch(0.72_0.18_255/0.1)] active:scale-95 cursor-pointer",
        className,
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-muted-foreground/70 tabular-nums">{count}</span>
      )}
    </button>
  );
}
