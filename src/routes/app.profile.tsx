import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/common/Section";
import { IdentityHero } from "@/components/profile/IdentityHero";
import { MediaDNA } from "@/components/profile/MediaDNA";
import { MemoryMap } from "@/components/profile/MemoryMap";
import { LifeChapters } from "@/components/profile/LifeChapters";
import { MemoryCapsules } from "@/components/profile/MemoryCapsules";
import { Museum } from "@/components/profile/Museum";
import { QuoteGallery } from "@/components/profile/QuoteGallery";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";
import { LifetimeMilestones } from "@/components/profile/LifetimeMilestones";
import { BookmarkPanel } from "@/components/profile/BookmarkPanel";
import { SaveForLaterPanel } from "@/components/profile/SaveForLaterPanel";
import { UniversalNotes } from "@/components/profile/UniversalNotes";
import { EditorialProfileFooter } from "@/components/profile/EditorialProfileFooter";
import { Section } from "@/components/common/Section";
import { PullQuote } from "@/components/editorial/PullQuote";
import { SplitBlock } from "@/components/editorial/SplitBlock";
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

  const museumCovers = libraryData?.pages.flatMap(p => p.data).map(adaptLibraryItem).slice(0, 4) || [];

  return (
    <div className="pt-2 pb-20">
      <IdentityHero />

      {/* Editorial breath between identity and metrics */}
      <PullQuote attribution="Chronicle · a living record">
        You aren't a list of titles. You're the pattern between them.
      </PullQuote>

      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total hours" value={`${(overview?.hoursSpent || 0).toLocaleString()}h`} />
        <StatCard label="Completed" value={overview?.completedItems || 0} accent="oklch(0.72 0.16 160 / 0.4)" />
        <StatCard label="Streak" value={`${streaks?.current || 0}d`} accent="oklch(0.82 0.16 80 / 0.4)" />
        <StatCard
          label="Collections"
          value={collections.length}
          accent="oklch(0.65 0.22 295 / 0.4)"
        />
      </div>

      {/* DNA — centered, full-bleed feel */}
      <Section title="Media DNA" subtitle="A fingerprint of how you experience stories.">
        <MediaDNA />
      </Section>

      {/* Life chapters as split editorial */}
      <div className="mt-16">
        <SplitBlock
          ratio="60/40"
          primary={<LifeChapters />}
          secondary={
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85">Eras</div>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                Life chapters
              </h2>
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-foreground/80">
                The seasons your stories grew alongside you — each one a small archive of who you
                were becoming.
              </p>
            </div>
          }
        />
      </div>

      {/* Memory map — full width */}
      <Section title="Memory map" subtitle="Every corner of your Chronicle, one tap away.">
        <MemoryMap />
      </Section>

      {/* Capsules as right-heavy split */}
      <div className="mt-16">
        <SplitBlock
          ratio="60/40"
          reverse
          primary={<MemoryCapsules />}
          secondary={
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85">
                Captured
              </div>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                Memory capsules
              </h2>
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-foreground/80">
                Weekends and weeks Chronicle quietly folded into a single feeling — opened only when
                you want them.
              </p>
            </div>
          }
        />
      </div>

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

      {/* Pull quote separating archive-of-self from kept fragments */}
      <PullQuote attribution="Lines that stayed with you">
        The quotes you save are the version of yourself you keep rereading.
      </PullQuote>

      <Section title="Quotes you've kept">
        <QuoteGallery limit={6} />
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
