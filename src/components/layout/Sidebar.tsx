import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronsLeft, ChevronsRight, Command } from "lucide-react";
import { NAV, GROUP_LABELS, NAV_GROUP_ORDER } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar({ 
  onOpenSearch, 
  collapsed, 
  onToggle 
}: { 
  onOpenSearch: () => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const groups = NAV_GROUP_ORDER;

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass fixed top-4 bottom-4 left-4 z-40 hidden flex-col overflow-hidden rounded-3xl lg:flex"
      style={{ boxShadow: "var(--shadow-glass)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-[0_0_24px_oklch(0.72_0.18_255/0.45)]">
          <span className="font-display text-lg leading-none">C</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate font-display text-lg leading-none">Chronicle</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Memory operating system
            </div>
          </div>
        )}
      </div>

      {/* Search trigger */}
      <button
        onClick={onOpenSearch}
        aria-label="Search"
        className={cn(
          "mx-3 mt-1 mb-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-3 py-2.5 text-left text-sm text-muted-foreground transition press-scale hover:bg-background/70 hover:text-foreground",
        )}
      >
        <Command className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">Spotlight…</span>
            <kbd className="rounded-md border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] tracking-wider">
              ⌘K
            </kbd>
          </>
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {groups.map((g) => {
          const items = NAV.filter((n) => n.group === g);
          return (
            <div key={g} className="mb-4">
              {!collapsed && GROUP_LABELS[g] && (
                <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                  {GROUP_LABELS[g]}
                </div>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    item.to === "/app" || item.to === "/app/library"
                      ? pathname === item.to
                      : pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition press-scale",
                          active
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 -z-10 rounded-xl"
                            style={{
                              background:
                                "linear-gradient(120deg, oklch(0.72 0.18 255 / 0.18), oklch(0.65 0.22 295 / 0.14))",
                              boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.08)",
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Collapse */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/30 py-2 text-xs text-muted-foreground transition press-scale hover:text-foreground"
      >
        {collapsed ? (
          <ChevronsRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronsLeft className="h-4 w-4" /> Collapse
          </>
        )}
      </button>
    </motion.aside>
  );
}

