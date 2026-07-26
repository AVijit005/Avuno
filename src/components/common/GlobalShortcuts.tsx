import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { useShortcuts, SHORTCUT_HELP } from "@/lib/shortcuts";
import { PremiumGlass } from "@/components/ui/PremiumGlass";

/** Mounts global shortcuts and a quiet shortcut-guide overlay opened with `?`. */
export function GlobalShortcuts() {
  const navigate = useNavigate();
  const [help, setHelp] = useState(false);

  useShortcuts({
    "g h": () => navigate({ to: "/app" }),
    "g l": () => navigate({ to: "/app/library" }),
    "g c": () => navigate({ to: "/app/collections" }),
    "g j": () => navigate({ to: "/app/journal" }),
    "g t": () => navigate({ to: "/app/timeline" }),
    "g a": () => navigate({ to: "/app/analytics" }),
    "g w": () => navigate({ to: "/app/wrapped" }),
    "shift+j": () => navigate({ to: "/app/journal" }),
    "shift+c": () => navigate({ to: "/app/collections" }),
    "?": () => setHelp((v) => !v),
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelp(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <AnimatePresence>
      {help && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] grid place-items-center bg-background/45 px-4 backdrop-blur-2xl"
          onClick={() => setHelp(false)}
          role="button"
          aria-label="Close shortcuts help"
          tabIndex={0}
        >
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <PremiumGlass variant="strong">
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Keyboard shortcuts
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {SHORTCUT_HELP.map((s) => (
                    <li key={s.keys} className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">{s.desc}</span>
                      <kbd className="rounded-md border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px] tracking-wider">
                        {s.keys}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </div>
            </PremiumGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
