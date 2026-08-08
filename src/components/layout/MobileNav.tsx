import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Library, Layers, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/library", label: "Library", icon: Library },
  { to: "/app/collections", label: "Collections", icon: Layers, fab: true },
  { to: "/app/search", label: "Search", icon: Search },
  { to: "/app/profile", label: "You", icon: User },
];

export function MobileNav({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Mobile navigation"
      className="glass-strong fixed inset-x-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2 pb-safe lg:hidden"
      style={{ bottom: "env(safe-area-inset-bottom, 12px)" }}
    >
      {items.map((it) => {
        const active = it.to === "/app" ? pathname === "/app" : pathname.startsWith(it.to);
        if (it.fab) {
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
              className="-mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.18_255/0.6)] press-scale"
            >
              <it.icon className="h-5 w-5" />
            </Link>
          );
        }
        if (it.label === "Search") {
          return (
            <button
              key={it.label}
              onClick={onOpenSearch}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] transition",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <it.icon className={cn("h-5 w-5", active && "text-primary")} />
              <span>{it.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={it.to}
            to={it.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] transition",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <it.icon className={cn("h-5 w-5", active && "text-primary")} />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
