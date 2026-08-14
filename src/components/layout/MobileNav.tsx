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
      className="glass-floating shadow-[0_-1px_0_oklch(1_0_0_/_0.06)_inset,_0_-8px_32px_-8px_oklch(0_0_0_/_0.4)] fixed inset-x-3 z-40 flex items-center justify-around rounded-2xl px-1 py-2.5 pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      {items.map((it) => {
        if (it.fab) {
          return (
            <button
              key={it.label}
              onClick={openAdd}
              aria-label={it.label}
              className="-mt-8 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_16px_oklch(0.72_0.18_255/0.5),inset_0_1px_0_oklch(1_1_1/0.2)] hover:scale-105 active:scale-95 transition-transform duration-[140ms] focus-ring"
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
              "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 min-h-[44px] text-[10px] transition-colors duration-[140ms] focus-visible:ring-2 focus-visible:ring-ring",
              active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-primary" />
            )}
            <it.icon className={cn("h-5 w-5", active && "text-primary")} />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
