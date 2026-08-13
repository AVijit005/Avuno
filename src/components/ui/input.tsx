import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 min-h-[44px] sm:min-h-0 w-full rounded-xl border border-foreground/8 bg-foreground/[0.04] px-3 py-2 text-sm shadow-none transition-[border-color,box-shadow,background-color] duration-[140ms] ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 hover:border-foreground/15 hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:bg-foreground/[0.06] disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
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
