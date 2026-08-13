import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-sm shadow-[inset_0_2px_4px_oklch(0_0_0/0.1)] transition-[border-color,background-color,box-shadow] duration-[140ms] ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 hover:border-foreground/20 hover:bg-foreground/[0.05] focus-visible:outline-none focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:bg-foreground/[0.05] disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
