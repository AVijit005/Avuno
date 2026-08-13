import { Plus } from "lucide-react";
import { motion } from "motion/react";

export function CreateCollectionFab({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group fixed bottom-24 right-6 z-50 flex items-center gap-2 overflow-hidden rounded-xl pl-3 pr-3 py-3 text-sm font-medium bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-[1px] active:scale-[0.98] transition-[background-color,transform,box-shadow] duration-[140ms] md:bottom-10 md:right-10"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl">
        <Plus className="h-4 w-4" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 opacity-0 transition-[max-width,padding,opacity] duration-500 group-hover:max-w-[180px] group-hover:pr-2 group-hover:opacity-100">
        Create collection
      </span>
    </motion.button>
  );
}
