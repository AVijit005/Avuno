import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/common/Section";
import { IdentityHero } from "@/components/profile/IdentityHero";
import { MemoryMap } from "@/components/profile/MemoryMap";
import { Museum } from "@/components/profile/Museum";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";
import { LifetimeMilestones } from "@/components/profile/LifetimeMilestones";
import { EditorialProfileFooter } from "@/components/profile/EditorialProfileFooter";
import { Section } from "@/components/common/Section";
import { BookmarkPanel } from "@/components/profile/BookmarkPanel";
import { SaveForLaterPanel } from "@/components/profile/SaveForLaterPanel";
import { UniversalNotes } from "@/components/profile/UniversalNotes";
import { Collage } from "@/components/editorial/Collage";
import { useOverview, useStreaks } from "@/hooks/use-analytics";
import { adaptOverview, adaptStreaks } from "@/lib/adapters/analytics";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";
import { useLibrary } from "@/hooks/use-library";
import { adaptLibraryItem } from "@/lib/adapters/media";

export const Route = createFileRoute("/app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { data: rawOverview } = useOverview();
  const { data: rawStreaks } = useStreaks();
  const { data: rawCollections } = useCollections();
  const { data: libraryData } = useLibrary();

  const overview = rawOverview ? adaptOverview(rawOverview) : null;
  const streaks = rawStreaks ? adaptStreaks(rawStreaks) : null;
  const collections = rawCollections ? rawCollections.map(adaptCollectionResponse) : [];

  const museumCovers =
    libraryData?.pages
      .flatMap((p) => p.data)
      .map(adaptLibraryItem)
      .slice(0, 4) || [];

  return (
    <div className="pt-2 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border/40 pb-6">
        <div>
          <div className="text-eyebrow mb-2">Your Profile</div>
          <h1 className="font-display text-4xl tracking-tight">The story of your stories</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            A living portrait of your media life — the patterns, the preferences, and the moments
            that shaped you.
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total hours" value={`${(overview?.hoursSpent || 0).toLocaleString()}h`} />
        <StatCard
          label="Completed"
          value={overview?.completedItems || 0}
          accent="oklch(0.72 0.16 160 / 0.4)"
        />
        <StatCard
          label="Streak"
          value={`${streaks?.current || 0}d`}
          accent="oklch(0.82 0.16 80 / 0.4)"
        />
        <StatCard
          label="Collections"
          value={collections.length}
          accent="oklch(0.65 0.22 295 / 0.4)"
        />
      </div>

      {/* Memory map — full width */}
      <Section title="Memory map" subtitle="Every corner of your Avuno, one tap away.">
        <MemoryMap />
      </Section>

      {/* Museum as collage instead of grid */}
      <Section title="Personal museum" subtitle="The shelves you're proudest of.">
        <Collage
          items={museumCovers.map((m) => ({
            id: m.id,
            image: m.poster,
            alt: m.title,
            node: (
              <div className="rounded-2xl bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                  {m.kind}
                </div>
                <div className="font-display text-xl tracking-tight text-white">{m.title}</div>
              </div>
            ),
          }))}
        />
        <div className="mt-8">
          <Museum />
        </div>
      </Section>

      <Section title="Activity">
        <ActivityCalendar />
      </Section>
      <Section title="Lifetime milestones">
        <LifetimeMilestones />
      </Section>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Section title="Bookmarks" className="mt-0">
          <BookmarkPanel />
        </Section>
        <Section title="Save for later" className="mt-0">
          <SaveForLaterPanel />
        </Section>
      </div>

      <Section title="Profile notes">
        <UniversalNotes kind="creator" refId="self" title="Private profile notes" />
      </Section>

      <EditorialProfileFooter />
    </div>
  );
}
