import { NotebookPen, Sparkles } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumSquircle } from "@/components/ui/PremiumSquircle";

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
    <PremiumGlass
      interactive
      variant="strong"
      glow="oklch(0.7 0.18 255 / 0.15)"
      className="mx-auto flex max-w-2xl flex-col items-center p-8 md:p-14"
    >
      <header className="mb-10 flex w-full items-baseline justify-between border-b border-foreground/10 pb-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        <span>{timeContext}</span>
        <span className="italic text-foreground/70">Reflective</span>
      </header>

      <div className="flex w-full justify-center">
        <PremiumSquircle icon={<Sparkles />} size="xl" variant="glass" className="py-4" />
      </div>
      <p className="mt-4 text-center font-display text-3xl leading-snug tracking-tight md:text-4xl text-foreground drop-shadow-sm">
        &ldquo;{prompts[promptIndex] ?? ""}&rdquo;
      </p>

      <div className="mt-12 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
        <PremiumGlass
          interactive
          variant="default"
          glow="oklch(0.7 0.18 255 / 0.5)"
          className="group cursor-pointer rounded-2xl bg-white/[0.08] px-8 py-4 transition-colors hover:bg-white/[0.12]"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartWriting}
        >
          <div className="flex h-full w-full items-center justify-center gap-3">
            <NotebookPen className="h-5 w-5 text-primary drop-shadow-[0_0_12px_currentColor] transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110" />
            <span className="font-display text-lg font-medium text-foreground tracking-wide">
              Start writing
            </span>
          </div>
        </PremiumGlass>

        <PremiumGlass
          interactive
          variant="subtle"
          className="cursor-pointer rounded-2xl px-6 py-3.5 transition-colors hover:bg-white/[0.04]"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextPrompt}
        >
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              Different prompt
            </span>
          </div>
        </PremiumGlass>
      </div>
    </PremiumGlass>
  );
}
