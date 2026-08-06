import { Link } from "@tanstack/react-router";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { BookOpen } from "lucide-react";
import type { Collection } from "@/lib/types";
import { useJournalEntries } from "@/hooks/use-journal";

export function CollectionJournal({ collection: _c }: { collection: Collection }) {
  const { data, isLoading } = useJournalEntries({ limit: 5 });
  const entries = data?.pages?.flatMap((p: any) => p.items ?? p.data ?? [])?.slice(0, 5) ?? [];

  if (isLoading) return null;
  if (entries.length === 0) return null;

  return (
    <PremiumGlass variant="subtle">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Journal · pinned
          </div>
          <Link
            to="/app/journal"
            className="story-link text-xs text-muted-foreground hover:text-foreground"
          >
            Open journal
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {entries.map((j: any) => (
            <li key={j.id} className="border-l-2 border-primary/40 pl-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
                {new Date(j.createdAt).toLocaleDateString()} {j.mood ? `· ${j.mood}` : ""}
              </div>
              <div className="text-sm">{j.title ?? "Untitled"}</div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{j.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </PremiumGlass>
  );
}
