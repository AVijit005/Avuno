import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { NotebookPen } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { StatCardPremium } from "@/components/analytics/AnalyticsKit";
import { MemoryBookmarks } from "@/components/memory/MemoryBookmarks";
import { getActiveChallenge } from "@/lib/challenges";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { MemoryDNA } from "@/components/intelligence/MemoryDNA";
import { YourReflectionsRail } from "@/components/memory/YourReflectionsRail";
import { LiveStatsStrip } from "@/components/memory/LiveStatsStrip";
import { useJournalEntries, useJournalStats, useCreateJournalEntry, useJournalPrompts } from "@/hooks/use-journal";
import { useDiscovery } from "@/hooks/use-analytics";
import { toast } from "sonner";
import { adaptJournalEntry } from "@/lib/adapters/journal";
import { useMemo, useState, useEffect, useRef } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { countWords } from "@/lib/utils/words";
import { JournalHero, JournalPrompt, MoodChart, JournalEntryCard, WriteOverlay } from "@/components/journal";
import { MemoryZone } from "@/components/calendar";

export const Route = createFileRoute("/app/journal")({
  component: JournalPage,
  head: () => ({
    meta: [
      { title: "Journal — Chronicle" },
      { name: "description", content: "Write about the stories that stayed with you. Capture moods, memories, and moments." },
      { property: "og:title", content: "Chronicle Journal" },
      { property: "og:description", content: "Words for the stories that stayed." },
    ],
  }),
  pendingComponent: PageSkeleton,
});

function JournalPage() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodRange, setMoodRange] = useState<7 | 30 | 90>(30);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chronicle-journal-draft');
    if (saved) {
      setJournalText(saved);
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 3000);
    }
  }, []);

  useEffect(() => {
    if (journalText.length === 0) return;
    const t = setTimeout(() => {
      localStorage.setItem('chronicle-journal-draft', journalText);
    }, 1000);
    return () => clearTimeout(t);
  }, [journalText]);

  const clearDraft = () => {
    localStorage.removeItem('chronicle-journal-draft');
    setJournalText('');
    setIsDraftSaved(false);
  };
  const [isWriting, setIsWriting] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isSealing, setIsSealing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createJournalEntry = useCreateJournalEntry();

  useEffect(() => {
    if (isWriting && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isWriting]);

  useEffect(() => {
    if (!isWriting) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsWriting(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isWriting]);

  const { data: journalData, isLoading: isLoadingJournal, isError: isJournalError, refetch: refetchJournal, hasNextPage, fetchNextPage, isFetchingNextPage } = useJournalEntries();
  const { data: statsData } = useJournalStats();
  const { data: discovery } = useDiscovery();
  const { data: prompts } = useJournalPrompts();

  const hour = new Date().getHours();
  const timeContext =
    hour < 12 ? "This morning" :
    hour < 17 ? "This afternoon" :
    hour < 21 ? "This evening" :
    "Tonight";

  const entries = useMemo(() => {
    return journalData?.pages.flatMap((p) => p.items).filter(Boolean).map(adaptJournalEntry) ?? [];
  }, [journalData]);

  const favoriteMood = useMemo(() => {
    const tally: Record<string, number> = {};
    entries.forEach((e) => { if (e.mood) tally[e.mood] = (tally[e.mood] || 0) + 1; });
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  }, [entries]);

  const moodTimeline = useMemo(() => {
    const MOOD_COLORS: Record<string, string> = {
      "Happy": "oklch(0.78 0.16 80)", "Inspired": "oklch(0.7 0.2 145)",
      "Emotional": "oklch(0.65 0.22 295)", "Excited": "oklch(0.7 0.18 25)",
      "Relaxed": "var(--primary)", "Thoughtful": "oklch(0.55 0.18 280)",
    };
    const range = moodRange;
    const today = new Date();
    const MAX_WORDS_INTENSITY = 1500;
    const lastN = Array.from({ length: range }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = entries.find((e) => e.createdAt.slice(0, 10) === dateStr);
      const moodStr = entry?.mood ?? null;
      const color = moodStr ? (MOOD_COLORS[moodStr] || "var(--primary)") : "oklch(0.5 0 0 / 0.15)";
      const words = entry ? countWords(entry.content) : 0;
      return { day: range - i, mood: moodStr, color, intensity: moodStr ? Math.min(1, Math.max(0.08, words / MAX_WORDS_INTENSITY)) : 0.04 };
    }).reverse();
    return lastN;
  }, [entries, moodRange]);

  const favoriteEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2);
  }, [entries]);

  const handleSeal = async () => {
    setIsSealing(true);
    try {
      await createJournalEntry.mutateAsync({ content: journalText, mood: selectedMood || "Thoughtful" });
      toast.success("Entry sealed and saved.");
      setIsWriting(false);
      clearDraft();
    } catch {
      toast.error("Failed to save entry. Please try again.");
    } finally {
      setIsSealing(false);
    }
  };

  if (isJournalError) {
    return (
      <div className="py-20">
        <PremiumErrorState
          title="Couldn't load your journal"
          description="Something went wrong fetching your entries. Please try again."
          action={<PremiumButton variant="primary" onClick={() => refetchJournal()}>Retry</PremiumButton>}
        />
      </div>
    );
  }

  return (
    <div className="pb-32 pt-2">
      <JournalHero isLoading={isLoadingJournal} stats={statsData ? { journalCount: statsData.journalCount, writingStreak: statsData.writingStreak } : null} entries={entries} favoriteMood={favoriteMood} />

      <MemoryZone title={`A prompt for ${timeContext.toLowerCase()}`} sub="One question. No pressure.">
        <JournalPrompt promptIndex={promptIndex} timeContext={timeContext} onStartWriting={() => setIsWriting(true)} onNextPrompt={() => setPromptIndex((prev) => (prev + 1) % ((prompts?.length ?? 1) || 1))} />
      </MemoryZone>

      <MemoryZone title="Your writing, today" sub="Pulled straight from your library — no demo data.">
        <LiveStatsStrip />
      </MemoryZone>

      <MemoryZone title="What you watched & played" sub="The stories that shaped your thoughts this month.">
        <MemoryBookmarks />
      </MemoryZone>

      <MemoryZone title="Recurring themes" sub="The algorithm noticed these patterns in your writing.">
        <MemoryDNA />
      </MemoryZone>

      <MemoryZone title="Follow the thread">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ChallengeCard challenge={getActiveChallenge()} />
        </div>
      </MemoryZone>

      <MemoryZone title="Past reflections" sub="Your own words, resurfaced when relevant.">
        <YourReflectionsRail />
      </MemoryZone>

      <MemoryZone title="Lately">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {entries.length === 0 && !isLoadingJournal && (
            <div className="col-span-full">
              <EmptyState 
                title="Your journal is empty" 
                description="Write your first entry and capture your current mood."
                action={<PremiumButton variant="primary" onClick={() => setIsWriting(true)}>Write entry</PremiumButton>}
              />
            </div>
          )}
          {entries.slice(0, 4).map((j, i) => <JournalEntryCard key={j.id} entry={j} index={i} />)}
        </div>
        {hasNextPage && entries.length > 0 && (
          <div className="mt-6 flex justify-center">
            <PremiumButton variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? "Loading…" : "Load more entries"}
            </PremiumButton>
          </div>
        )}
      </MemoryZone>

      <div className="mb-12">
        <div className="flex items-center justify-end gap-2 mb-4">
          {[7, 30, 90].map((r) => (
            <button key={r} onClick={() => setMoodRange(r as 7 | 30 | 90)}
              className={`glass-subtle rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${moodRange === r ? 'border-white/20 text-foreground shadow-[0_0_12px_rgba(255,255,255,0.06)]' : 'text-muted-foreground border border-transparent hover:border-white/5'}`}>
              {r === 7 ? 'Week' : r === 30 ? 'Month' : 'Quarter'}
            </button>
          ))}
        </div>
        {isLoadingJournal ? (
        <div className="mt-16 md:mt-24">
          <ShimmerSkeleton className="mb-6 h-6 w-48 rounded-full" variant="line" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => <ShimmerSkeleton key={i} className="h-24 rounded-2xl" variant="glass" />)}
          </div>
        </div>
      ) : (
        <MemoryZone title="Writing statistics">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCardPremium label="Entries" value={statsData?.journalCount ?? 0} />
            <StatCardPremium label="Words" value={entries.reduce((acc, cur) => acc + countWords(cur.content), 0)} accent="oklch(0.65 0.22 295 / 0.4)" />
            <StatCardPremium label="Longest streak" value={statsData?.writingStreak ?? 0} accent="oklch(0.82 0.16 80 / 0.4)" />
            <StatCardPremium label="Average length" value={entries.length ? Math.round(entries.reduce((acc, cur) => acc + countWords(cur.content), 0) / entries.length) : 0} accent="oklch(0.72 0.16 160 / 0.4)" />
            <StatCardPremium label="Top mood" value={favoriteMood ?? "—"} accent="oklch(0.78 0.18 50 / 0.4)" />
          </div>
        </MemoryZone>
      )}
      </div>

      <MemoryZone title="Recent highlights">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {favoriteEntries.map((j) => <JournalEntryCard key={j.id} entry={j} index={-1} />)}
          {favoriteEntries.length === 0 && <div className="text-muted-foreground text-sm">No entries yet. Start writing.</div>}
        </div>
      </MemoryZone>


      <WriteOverlay
        isOpen={isWriting}
        promptIndex={promptIndex}
        timeContext={timeContext}
        journalText={journalText}
        isSealing={isSealing}
        isDraftSaved={isDraftSaved}
        textareaRef={textareaRef}
        onTextChange={setJournalText}
        onClose={() => setIsWriting(false)}
        onSeal={handleSeal}
      />
    </div>
  );
}
