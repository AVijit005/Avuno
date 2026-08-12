import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "solid" | "glass";

interface Props {
  icon: ReactNode;
  size?: Size;
  variant?: Variant;
  className?: string;
}

const sizes: Record<Size, string> = {
  sm: "h-8 w-8 rounded-xl [&>span>svg]:h-4 [&>span>svg]:w-4",
  md: "h-10 w-10 rounded-xl [&>span>svg]:h-5 [&>span>svg]:w-5",
  lg: "h-14 w-14 rounded-2xl [&>span>svg]:h-6 [&>span>svg]:w-6",
  xl: "h-16 w-16 rounded-2xl [&>span>svg]:h-7 [&>span>svg]:w-7",
};

const variants: Record<Variant, string> = {
  glass:
    "bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-[inset_0_1px_0_oklch(1_1_1/0.1)] ring-1 ring-primary/20 group-hover/squircle:from-primary/20 group-hover/squircle:to-primary/10 group-hover/squircle:text-primary-foreground group-hover/squircle:shadow-[0_0_40px_oklch(0.72_0.18_255/0.6)] group-hover/squircle:ring-primary/50",
  solid:
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_1_1/0.3),0_10px_20px_-10px_oklch(0.72_0.18_255/0.6)] ring-1 ring-primary/50 group-hover/squircle:shadow-[inset_0_1px_0_oklch(1_1_1/0.4),0_0_40px_oklch(0.72_0.18_255/0.7)] group-hover/squircle:ring-white/40",
};

export function PremiumSquircle({ icon, size = "md", variant = "glass", className }: Props) {
  return (
    <div
      className={cn(
        "group/squircle inline-flex cursor-pointer items-center justify-center",
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center transition-[transform,box-shadow,background,ring-color] duration-500 ease-out active:scale-95 group-hover/squircle:scale-110 motion-reduce:transform-none",
          variants[variant],
          sizes[size],
        )}
      >
        <span className="flex items-center justify-center transition-transform duration-500 group-hover/squircle:rotate-12">
          {icon}
        </span>
      </span>
    </div>
  );
}
