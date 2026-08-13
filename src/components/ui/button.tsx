import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[transform,box-shadow,opacity,background-color] duration-[140ms] ease-out disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:translate-y-[1px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-[1px] hover:bg-primary/95",
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-[1px] hover:bg-primary/95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:-translate-y-[1px]",
        tertiary: "glass-subtle text-foreground hover:bg-foreground/5 hover:-translate-y-[1px]",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-button)] hover:bg-destructive/90 hover:-translate-y-[1px]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:-translate-y-[1px]",
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
