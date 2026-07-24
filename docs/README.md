# Chronicle — Internal Documentation

Chronicle is a Personal Memory Operating System for media: movies, anime, books,
games, music, podcasts, courses, and more. Everything is editorial, deterministic,
and reuses one design language.

## Architecture

- **Framework**: TanStack Start (Vite 7, React 19, file-based routing in `src/routes/`).
- **Routes**: `__root.tsx` shell; `/app/*` houses the product. App layout lives in `src/components/layout/AppShell.tsx` and renders `<Outlet />`.
- **Data**: Pure deterministic mock under `src/lib/`. Source of truth: `mock.ts` (MEDIA, COLLECTIONS, JOURNAL, ACHIEVEMENTS, STATS, etc.). All selectors are seeded with `mulberry` (`src/lib/seed.ts`) and a fixed `TODAY` from `memory.ts` for SSR stability.
- **Styling**: Tailwind v4 + design tokens in `src/styles.css`. UI primitives in `src/components/ui/` (PremiumGlass, PremiumButton, PosterCard, etc.).

## Folder structure

```
src/
  components/
    ui/                primitives (PremiumGlass, PremiumButton, PosterCard…)
    common/            shared editorial widgets (QuickActionsMenu, ActivityFeed…)
    layout/            AppShell, Sidebar, TopBar, MobileNav, RightSidebar
    dashboard/         Dashboard-only widgets (greeting, focus, mood, footer…)
    library/           Library widgets (toolbar, hero, stats…)
    collections/       Collection widgets (timeline, fingerprint, workspace…)
    media/             Media Detail 3.0 widgets (LivingHeader, StoryJourney…)
    media-detail/      Legacy Media Detail widgets (hero, continue, info…)
    memory/            Memory OS (OnThisDay, EmotionMeter, MemoryJourney…)
    discovery/         Discovery Engine (hero, BecauseYouLoved, ContinueUniverse…)
    intelligence/      Intelligence Layer (TasteProfile, StoryDNA, MemoryDNA…)
    goals/             Goals widgets (hero, card, milestones…)
    achievements/      Achievement widgets
    challenges/        Challenges + smart collections
    search/            CommandPalette
    landing/           Marketing landing page
  lib/
    mock.ts            single source of truth for all mock data
    seed.ts            mulberry PRNG
    memory.ts          Memory taxonomy + fixed TODAY
    memoryJournal.ts   Journal/moments/arcs/scores
    resurfacing.ts     OnThisDay + resurfacing selectors
    memoryInsights.ts  Aggregate memory selectors
    discovery.ts       Discovery selectors (consumes recommendationEngine.ts)
    recommendationEngine.ts  Scoring + ranking
    mediaGraph.ts      Relationship builders
    intelligence.ts    Taste/DNA/impact builders
    goals.ts, achievements.ts, challenges.ts, smartCollections.ts
    dashboardGreeting.ts, dashboardContext.ts
    mediaStory.ts      Media Detail 3.0 helpers
    collectionEngine.ts, collectionInsights.ts, collectionWorkspace.ts, collectionRelationships.ts
    searchIndex.ts     Universal search index
    preferences.ts     localStorage prefs (SSR-safe)
    shortcuts.ts       Global keyboard shortcut hook
    activityFeed.ts    Activity model
    productAudit.ts    Deterministic checks on mock graph
    crosslinks.ts      Cross-feature linking helpers
  routes/
    app.tsx            mounts AppShell
    app.index.tsx      Dashboard (Living Homepage)
    app.library.*.tsx  Library status pages
    app.collections.* Collections (index + $id)
    app.media.$id.tsx  Media Detail 3.0
    app.timeline.tsx, app.journal.tsx, app.analytics.tsx, app.wrapped.tsx
    app.goals.tsx, app.achievements.tsx
    app.dev.tsx        Dev-only QA playground (hidden from nav)
```

## Memory OS

Every media item has an optional `MediaMemory` (built in `memory.ts` from `MEDIA`).
Selectors include `getFavoriteMemories`, `getComfortStories`, `getOnThisDay`, `getLifeChangingStories`, etc.

## Discovery Engine

Pure scoring + ranking in `recommendationEngine.ts`. Selectors in `discovery.ts`.
Recommendations carry `compatibility`, `confidence`, `reason`, `source`,
`discoveryTags`.

## Intelligence Layer

`intelligence.ts` produces taste profiles, DNA axes, library maps, soundtracks,
personal statements, evolution timelines — all deterministic.

## Dashboard (Living Homepage)

`dashboardContext.ts` returns a deterministic `sectionOrder` and a rich context
object. `dashboardGreeting.ts` ships 100+ greeting templates keyed by time of day,
streak, absence, and recent completions.

## Media Detail 3.0

Built additively on top of the existing detail page. Helpers in `mediaStory.ts`,
components under `src/components/media/`.

## Collections Workspace 3.0

Workspace metrics in `collectionEngine.ts`, editorial insights in
`collectionInsights.ts`, pinned widgets in `collectionWorkspace.ts`, adjacency
in `collectionRelationships.ts`.

## Final pass (v1.0)

- `searchIndex.ts` powers universal search.
- `QuickActionsMenu` is the shared context menu primitive.
- `RightSidebar` is a collapsible helper panel mounted in `AppShell`.
- `GlobalShortcuts` mounts ⌘K-friendly shortcuts and the `?` guide.
- `preferences.ts` stores per-user view/sort/sidebar state locally.
- `productAudit.ts` reports broken references on the dev playground.

## Future backend integration

All selectors are pure functions over `MEDIA`/`COLLECTIONS`/etc. To wire a real
backend later: replace the mock arrays with server-fetched data (TanStack Query
loaders), keep selector signatures identical.

## Design principles

- Quiet. Editorial. Premium. Emotional.
- One PremiumGlass identity; one PremiumButton identity.
- No hardcoded colors — every accent is a design token or an existing oklch value.
- Reduced motion respected globally via Motion's `motion-reduce` utilities.
