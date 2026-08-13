import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-pulse rounded-xl bg-foreground/[0.05] ring-1 ring-foreground/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
