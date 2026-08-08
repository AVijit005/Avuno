import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import { ChevronRight, Plus, Search, NotebookPen, Layers } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

const ACTIONS = [
  { icon: Plus, label: "Add media", hint: "Press ⌘N", id: "add" },
  { icon: Search, label: "Spotlight", hint: "Press ⌘K", id: "spotlight" },
  { icon: NotebookPen, label: "Journal entry", hint: "Press ⇧J", id: "journal" },
  { icon: Layers, label: "New collection", hint: "Press ⇧C", id: "collections" },
];

export function InteractiveWidgets() {
  const navigate = useNavigate();
  const { openAdd } = useMediaActions();
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {ACTIONS.map((q, i) => (
        <InteractiveWidget
          key={q.id}
          q={q}
          reduced={reduced}
          onClick={() => {
            switch (q.id) {
              case "add":
                openAdd();
                break;
              case "spotlight":
                window.dispatchEvent(new KeyboardEvent("keydown", { metaKey: true, key: "k" }));
                break;
              case "journal":
                navigate({ to: "/app/journal" });
                break;
              case "collections":
                navigate({ to: "/app/collections" });
                break;
            }
          }}
        />
      ))}
    </motion.div>
  );
}

function InteractiveWidget({
  q,
  reduced,
  onClick,
}: {
  q: { icon: typeof Plus; label: string; hint: string };
  reduced: boolean;
  onClick: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  function handleMouse(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    tiltX.set(event.clientX - centerX);
    tiltY.set(event.clientY - centerY);
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  const rotateX = useTransform(tiltY, [-100, 100], [8, -8], { clamp: true });
  const rotateY = useTransform(tiltX, [-100, 100], [-8, 8], { clamp: true });

  return (
    <motion.button
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      aria-label={q.label}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={reduced ? undefined : { scale: 1.02, y: -4, zIndex: 10 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative group flex items-center gap-3 rounded-2xl p-4 text-left border border-white/[0.05] bg-black/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),_0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden hover:border-white/[0.12] transition-colors duration-500"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`radial-gradient(120px circle at ${x}px ${y}px, rgba(255,255,255,0.4), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none mix-blend-screen bg-primary/20 blur-[20px]" />
      <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] shadow-sm transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_12px_rgba(var(--primary),0.3)] z-10">
        <q.icon className="h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors duration-300 drop-shadow-sm group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
      </div>
      <div className="flex-1 relative z-10">
        <div className="text-[13px] font-medium text-foreground/90 tracking-tight group-hover:text-white transition-colors drop-shadow-sm">
          {q.label}
        </div>
        <div className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase mt-0.5 transition-colors group-hover:text-primary/70">
          {q.hint}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary relative z-10" />
    </motion.button>
  );
}
