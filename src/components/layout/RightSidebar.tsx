import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface RightSidebarSection {
  title: string;
  content: ReactNode;
}

export function RightSidebar({
  sections,
  className,
}: {
  sections: RightSidebarSection[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        aria-expanded={open}
        aria-controls="right-sidebar"
        className="fixed bottom-24 right-16 z-40 hidden lg:grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-muted-foreground ring-1 ring-white/10 backdrop-blur transition hover:text-foreground"
      >
        {open ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.aside
            key="right-sidebar"
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed right-4 top-20 z-30 hidden w-[320px] max-h-[calc(100dvh-7rem)] overflow-y-auto lg:block",
              className,
            )}
            id="right-sidebar"
            aria-label="Helper panel"
          >
            <PremiumGlass variant="strong">
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Helper
                </div>
                <div className="mt-4 space-y-5">
                  {sections.map((s) => (
                    <section key={s.title}>
                      <h3 className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
                        {s.title}
                      </h3>
                      <div className="mt-2 text-sm">{s.content}</div>
                    </section>
                  ))}
                </div>
              </div>
            </PremiumGlass>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
