import { Plus } from "lucide-react";
import { motion } from "motion/react";

export function CreateCollectionFab({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="group glass-floating fixed bottom-24 right-6 z-50 flex items-center gap-2 overflow-hidden rounded-full pl-3 pr-3 py-3 text-sm font-medium shadow-[0_30px_60px_-20px_oklch(0_0_0/0.6)] md:bottom-10 md:right-10"
      style={{ boxShadow: "0 30px 60px -20px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.06)" }}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <Plus className="h-4 w-4" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 opacity-0 transition-all duration-500 group-hover:max-w-[180px] group-hover:pr-2 group-hover:opacity-100">
        Create collection
      </span>
    </motion.button>
  );
}
