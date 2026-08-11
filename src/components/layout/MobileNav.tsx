import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Library, Plus, NotebookPen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

const items = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/app/library", label: "Library", icon: Library },
  { to: "action:add", label: "Add", icon: Plus, fab: true },
  { to: "/app/journal", label: "Journal", icon: NotebookPen },
  { to: "/app/timeline", label: "Timeline", icon: Clock },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { openAdd } = useMediaActions();

  return (
    <nav
      aria-label="Mobile navigation"
      className="glass-strong fixed inset-x-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2 pb-safe lg:hidden"
      style={{ bottom: "env(safe-area-inset-bottom, 12px)" }}
    >
      {items.map((it) => {
        if (it.fab) {
          return (
            <button
              key={it.label}
              onClick={openAdd}
              aria-label={it.label}
              className="-mt-8 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-[0_10px_30px_-10px_oklch(0.72_0.18_255/0.6)] press-scale ring-1 ring-white/20"
            >
              <it.icon className="h-6 w-6" />
            </button>
          );
        }

        const active = it.to === "/app" ? pathname === "/app" : pathname.startsWith(it.to);
        return (
          <Link
            key={it.to}
            to={it.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] transition",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
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
