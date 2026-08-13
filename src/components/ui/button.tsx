import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-[140ms] ease-out disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:translate-y-[1px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_oklch(0.72_0.18_255/0.6),inset_0_1px_0_oklch(1_1_1/0.2)] hover:bg-primary/90 hover:shadow-[0_6px_16px_-4px_oklch(0.72_0.18_255/0.7),inset_0_1px_0_oklch(1_1_1/0.25)] hover:-translate-y-[1px]",
        primary:
          "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_oklch(0.72_0.18_255/0.6),inset_0_1px_0_oklch(1_1_1/0.2)] hover:bg-primary/90 hover:shadow-[0_6px_16px_-4px_oklch(0.72_0.18_255/0.7),inset_0_1px_0_oklch(1_1_1/0.25)] hover:-translate-y-[1px]",
        secondary:
          "glass text-foreground hover:bg-foreground/[0.08] hover:shadow-md hover:-translate-y-[1px]",
        tertiary: "glass-subtle text-foreground hover:bg-foreground/5 hover:-translate-y-[1px]",
        ghost:
          "hover:bg-foreground/[0.08] hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-button)] hover:bg-destructive/90 hover:-translate-y-[1px]",
        outline:
          "glass-subtle border-border/80 hover:bg-foreground/[0.05] hover:text-foreground",
        icon: "glass-subtle hover:bg-foreground/5 hover:text-primary",
        floating:
          "glass-floating text-foreground shadow-[var(--shadow-elevated)] hover:-translate-y-[2px]",
        glass:
          "glass text-foreground hover:shadow-[var(--shadow-ghost-hover)] hover:-translate-y-[1px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 rounded-2xl min-w-[44px]",
        sm: "h-9 px-3.5 text-xs rounded-xl min-w-[44px]",
        lg: "h-12 px-6 rounded-2xl min-w-[44px]",
        icon: "h-11 w-11 rounded-2xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
