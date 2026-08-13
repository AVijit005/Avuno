import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { NotebookPen } from "lucide-react";
import type { MediaItem } from "@/lib/types";

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  excerpt: string;
}

interface Props {
  item: MediaItem;
  entries?: JournalEntry[];
}

export function JournalIntegration({ item, entries = [] }: Props) {
  const shown = entries.slice(0, 3);
  return (
    <div className="glass-subtle mb-10 overflow-hidden rounded-3xl p-8">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Journal
          </div>
          <Link to="/app/journal">
            <PremiumButton
              size="sm"
              variant="secondary"
              icon={<NotebookPen className="h-3.5 w-3.5" />}
            >
              New entry
            </PremiumButton>
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {shown.map((j) => (
            <li key={j.id} className="border-l-2 border-primary/40 pl-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
                {j.date} · {j.mood}
              </div>
              <div className="text-sm">{j.title}</div>
              <p className="text-[11px] text-muted-foreground">{j.excerpt}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">About {item.title}.</p>
      </div>
    </div>
  );
}
