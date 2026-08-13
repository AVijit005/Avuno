import { NotebookPen, Sparkles } from "lucide-react";
import { PremiumSquircle } from "@/components/ui/PremiumSquircle";
import { motion } from "motion/react";

interface Props {
  promptIndex: number;
  timeContext: string;
  prompts?: string[];
  onStartWriting: () => void;
  onNextPrompt: () => void;
}

export function JournalPrompt({
  promptIndex,
  timeContext,
  prompts = [],
  onStartWriting,
  onNextPrompt,
}: Props) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center p-8 md:p-14 rounded-3xl glass">
      <header className="mb-10 flex w-full items-baseline justify-between glass-subtle rounded-xl p-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        <span>{timeContext}</span>
        <span className="italic text-muted-foreground">Reflective</span>
      </header>

      <div className="flex w-full justify-center">
        <PremiumSquircle icon={<Sparkles />} size="xl" variant="glass" className="py-4" />
      </div>
      <p className="mt-4 text-center font-display text-3xl leading-snug tracking-tight md:text-4xl text-foreground">
        &ldquo;{prompts[promptIndex] ?? ""}&rdquo;
      </p>

      <div className="mt-12 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
        <motion.button
          className="group cursor-pointer rounded-2xl bg-primary px-8 py-4 hover:-translate-y-[1px] hover:shadow-md transition-all duration-[140ms] active:scale-[0.98] hover:bg-primary/90"
          onClick={onStartWriting}
        >
          <div className="flex h-full w-full items-center justify-center gap-3">
            <NotebookPen className="h-5 w-5 text-primary-foreground transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110" />
            <span className="font-display text-lg font-medium text-primary-foreground tracking-wide">
              Start writing
            </span>
          </div>
        </motion.button>

        <motion.button
          className="cursor-pointer rounded-2xl px-6 py-3.5 glass-subtle hover:-translate-y-[1px] hover:shadow-md transition-all duration-[140ms] active:scale-[0.98]"
          onClick={onNextPrompt}
        >
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              Different prompt
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
