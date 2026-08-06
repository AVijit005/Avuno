# 🏆 AVUNO — COMPLETE BUG FIX IMPLEMENTATION PLAN

**Date:** 2026-08-06
**Total Verified Bugs:** 28 critical + high
**Phases:** 5 | **Estimated Scope:** ~40 files

---

## PHASE 1: DELETE DEAD DATA (5 files, 1 commit)

> Remove ALL mock/hardcoded empty arrays. These are the #1 reason features appear broken.

### 1.1 — `src/lib/types.ts:96-102`
```
DELETE: const MEDIA: any[] = []
DELETE: function getMediaItems()
```
- **Also run:** `grep -r "getMediaItems\|from.*types" src/ --include="*.tsx"` to find all consumers
- **Replace consumers** with `useMediaList()` or actual hook

### 1.2 — `src/lib/goals.ts:36`
```
DELETE: export const GOALS_FULL: Goal[] = []
DELETE: getCurrentGoals, getCompletedGoals, getUpcomingGoals, getGoalInsights, rankGoals, getRelatedGoal
```
- **Replace all consumers** with `useChallenges()` from hooks

### 1.3 — `src/lib/achievements.ts:32`
```
DELETE: export const ACHIEVEMENTS_FULL: any[] = []
DELETE: getAchievements, rankAchievements, getMilestones, getAchievementsByCategory
```

### 1.4 — `src/lib/challenges.ts:27`
```
DELETE: export const CHALLENGES: Challenge[] = []
DELETE: getChallenges, getRecommendedChallenge, getActiveChallenge
```

### 1.5 — `src/lib/library.ts:43`
```
DELETE: export const ALL_LIBRARY: MediaItem[] = []
```
- **Replace all imports** with `useLibrary()` hook

---

## PHASE 2: CONNECT DEAD FEATURES TO API (12 files, 1 commit)

> Features that exist as empty shells — connect them to their already-existing backend endpoints.

### 2.1 — JournalPreview → useJournalEntries()
**File:** `src/components/dashboard/JournalPreview.tsx`
```
BEFORE: const JOURNAL: any[] = []
        {JOURNAL.map(...)}

AFTER:  const { data: entries } = useJournalEntries()
        {entries?.map(...) || <EmptyState />}
```

### 2.2 — CollectionJournal → useJournalEntries()
**File:** `src/components/collections/CollectionJournal.tsx`
```
BEFORE: const JOURNAL: any[] = []
        {JOURNAL.map(...)}

AFTER:  const { data: entries } = useJournalEntries()
        const filtered = entries?.filter(e => e.collectionId === collection.id)
        {filtered?.map(...)}
```

### 2.3 — ThisWeek → useOverview() + useStreaks()
**File:** `src/components/dashboard/ThisWeek.tsx`
```
BEFORE: const THIS_WEEK: any[] = []
        Uses THIS_WEEK.watchTime, THIS_WEEK.topGenre (undefined)
        Uses Math.sin for fake sparkline

AFTER:  const { data: overview } = useOverview()
        const { data: streaks } = useStreaks()
        // Use real data from API responses
```

### 2.4 — LibraryMap → useGenreAnalytics()
**File:** `src/components/intelligence/LibraryMap.tsx`
```
BEFORE: const tags = [{ name: "Sci-Fi", count: 42, ...}] (hardcoded)

AFTER:  interface Props { genreData?: Array<{ name: string; count: number }> }
        const { data: analytics } = useIntelligence()
        const tags = analytics?.genres ?? []
```

### 2.5 — MediaEvolution → useIntelligence()
**File:** `src/components/intelligence/MediaEvolution.tsx`
```
BEFORE: const data = [{ year: "2019", SciFi: 20, Drama: 80, ...}] (hardcoded)

AFTER:  const { data: intelligence } = useIntelligence()
        const data = intelligence?.yearlyEvolution ?? []
```

### 2.6 — MemoryDNA → useIntelligence()
**File:** `src/components/intelligence/MemoryDNA.tsx`
```
BEFORE: const data = [{ trait: "Nostalgic", value: 85, ...}] (hardcoded)

AFTER:  const { data: intelligence } = useIntelligence()
        const data = intelligence?.emotionalProfile ?? []
```

### 2.7 — CollectionAnalyticsPreview → useCollectionStats()
**File:** `src/components/collections/CollectionAnalyticsPreview.tsx`
```
BEFORE: const data = [{ name: "Mon", value: 12 }, ...] (hardcoded)
        Shows "1284 views" and "42 hrs" hardcoded

AFTER:  const { data: stats } = useCollectionStats(collection.id)
        // Use real stats data
```

### 2.8 — GenreExpansion → useIntelligence()
**File:** `src/components/discovery/GenreExpansion.tsx`
```
BEFORE: const chartData = [{ genre: "Sci-Fi", A: 120, ...}] (hardcoded)

AFTER:  const { data: intelligence } = useIntelligence()
        const chartData = intelligence?.genreComparison ?? []
```

### 2.9 — CreatorEngine → useCreators()
**File:** `src/lib/creatorEngine.ts`
```
BEFORE: allCreators() returns [], getCreator() returns undefined

AFTER:  Derive from useLibrary() data grouped by creator field
        Or connect to dedicated backend endpoint
```

### 2.10 — FranchiseEngine → useFranchises()
**File:** `src/lib/franchiseEngine.ts`
```
BEFORE: FRANCHISES = [], all functions return empty

AFTER:  Derive from media data or connect to backend endpoint
```

### 2.11 — MuseumEngine → derive from library
**File:** `src/lib/museumEngine.ts`
```
BEFORE: All 7 galleries have items: []

AFTER:  const { data: library } = useLibrary()
        Derive galleries from actual user data:
        - Most Emotional → highest rated journal entries
        - Masterpieces → items rated 5 stars
        - Most Replayed → rewatched/reread items
```

### 2.12 — Life Chapters / Memory Insights
**File:** `src/lib/lifeChapters.ts` + `src/lib/memoryInsights.ts`
```
BEFORE: All exports are empty arrays

AFTER:  Derive from journal entries and library timeline
        Or deprecate the feature with <ComingSoon /> component
```

---

## PHASE 3: FIX REAL RUNTIME BUGS (6 files, 1 commit)

> These are actual code bugs, not just missing data.

### 3.1 — Token Refresh Race Condition
**File:** `src/lib/api/fetch.ts`
```
PROBLEM: Multiple concurrent 401s create multiple refresh promises.
         refreshAttempted is per-request, not shared.

FIX:
  - Move refreshPromise to module-level (already done in Phase 1)
  - In 401 handler: use getValidToken() instead of direkt refreshAccessToken()
  - Remove the per-request refreshAttempted flag entirely
  - The global deduplication in getValidToken() handles it
```

### 3.2 — ErrorBoundary Missing Error Logging
**File:** `src/components/common/ErrorBoundary.tsx`
```
ADD after getDerivedStateFromError:

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    reportLovableError(error, {
      boundary: 'ErrorBoundary',
      componentStack: errorInfo.componentStack ?? undefined
    })
  }
```

### 3.3 — TopBar Hardcoded Initials
**File:** `src/components/layout/TopBar.tsx` line ~121
```
BEFORE: <span>AY</span> // always "AY"

AFTER:  const { data: user } = useQuery({ queryKey: queryKeys.auth.me() })
        const initials = user?.name
          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : user?.email?.slice(0, 2).toUpperCase() ?? 'U'
        <span>{initials}</span>
```

### 3.4 — Analytics Tracking Fix
**File:** `src/lib/analytics.ts`
```
BEFORE:
  track: (eventName, props) => {
    if (import.meta.env.DEV) { console.log(...); return }
    // nothing runs in prod
  }

AFTER:
  track: (eventName, props) => {
    if (import.meta.env.DEV) console.log(`[Analytics] Track: ${eventName}`, props)
    // Always attempt to send
    try {
      if (window.posthog) window.posthog.capture(eventName, props)
    } catch {}
  }
  
ADD on app load:
  import posthog from 'posthog-js'
  if (!import.meta.env.DEV) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, { api_host: '/ingest' })
  }
```

### 3.5 — Memory Leak: CommandPalette setTimeout
**File:** `src/components/search/CommandPalette.tsx` line ~94
```
BEFORE:
  setTimeout(() => inputRef.current?.focus(), 60)
  // Never cleaned up

AFTER:
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (open) {
      setQ("")
      setActive(0)
      timerRef.current = setTimeout(() => inputRef.current?.focus(), 60)
    }
    return () => clearTimeout(timerRef.current)
  }, [open])
```

### 3.6 — Search Debounce
**File:** `src/components/search/CommandPalette.tsx` line ~331
```
BEFORE:
  onChange={(e) => setQ(e.target.value)} // instant

AFTER:
  const [debouncedQ, setDebouncedQ] = useState('')
  const debouncedSetQ = useMemo(
    () => debounce((val: string) => setDebouncedQ(val), 300),
    []
  )
  onChange={(e) => { setQ(e.target.value); debouncedSetQ(e.target.value) }}
  // use debouncedQ for the actual search query, q for the input value
```

---

## PHASE 4: TYPE SAFETY & ADAPTERS (4 files, 1 commit)

### 4.1 — Remove `[key: string]: any` from API params
**Files:** `src/lib/api/media.ts`, `src/lib/api/library.ts`, `src/lib/api/search.ts`
```
DELETE: [key: string]: any
KEEP only explicitly defined properties
```

### 4.2 — Fix Adapter Year Fallback
**File:** `src/lib/adapters/media.ts` lines 36, 67
```
BEFORE: year: m.releaseYear ?? 0 // 0 is invalid year

AFTER:  year: m.releaseYear ?? null // let UI handle missing year
```

### 4.3 — Fix Library Store Race Condition
**File:** `src/lib/store/libraryStore.ts` lines 120-133
```
BEFORE:
  setStatus: (id, status) => set((s) => {
    const prev = s.meta[id] ?? { status }
    const next: StoredMeta = { ...prev, status, lastActivityAt: "Just now" }
    return { meta: { ...s.meta, [id]: next } }
  })

AFTER:
  setStatus: (id, status) => set((s) => ({
    meta: {
      ...s.meta,
      [id]: { ...s.meta[id], status, lastActivityAt: "Just now" }
    }
  }))
```

### 4.4 — Fix Date.now() ID Generation
**Files:** `libraryStore.ts`, `notesEngine.ts`, `saveForLater.ts`, `bookmarks.ts`
```
BEFORE: Date.now().toString(36) // collision risk

AFTER:  crypto.randomUUID() // guaranteed unique
```

---

## PHASE 5: BACKEND FIXES (3 files, 1 commit)

### 5.1 — Admin Metrics Use Real Data
**File:** `apps/backend/src/users/users.controller.ts` lines 101-105
```
BEFORE: return { usersCount: 42, activeUsers: 10 }

AFTER:  const total = await this.prisma.user.count()
        const active = await this.prisma.user.count({
          where: { lastLoginAt: { gte: subDays(new Date(), 30) } }
        })
        return { usersCount: total, activeUsers: active }
```

### 5.2 — Fix Console Email Transport Token Logging
**File:** `apps/backend/src/auth/services/console-email-transport.service.ts` line 18
```
BEFORE: console.log('Sending verification email:', link) // exposes full token

AFTER:  console.log('Sending verification email to:', email)
        // Mask sensitive token data
```

### 5.3 — Add deletedAt Filter to Search Queries
**File:** `apps/backend/src/search/search.repository.ts` lines 236-267
```
ADD: { deletedAt: null } to all WHERE clauses in search queries
```

---

## VERIFICATION COMMANDS

After each phase, run:

```bash
# Phase 1-2 (frontend build)
npm run build:dev

# Phase 5 (backend type check)
cd apps/backend && npx tsc --noEmit

# Full check
npm run build:dev && cd apps/backend && npx tsc --noEmit
```

---

## COMMIT PLAN

```
Phase 1: git commit -m "fix: remove all mock/hardcoded empty data arrays (5 files)"
Phase 2: git commit -m "fix: connect dead features to existing API endpoints (12 files)"
Phase 3: git commit -m "fix: runtime bugs — token refresh, error logging, analytics (6 files)"
Phase 4: git commit -m "fix: type safety, adapter fixes, race conditions (4 files)"
Phase 5: git commit -m "fix: backend — admin metrics, email logging, search filters (3 files)"
```

---

## ESTIMATED IMPACT

| Phase | Files | User-Visible Fix |
|-------|-------|------------------|
| 1 | 5 | No more silently empty screens |
| 2 | 12 | Dashboard, collections, intelligence, museum work |
| 3 | 6 | No random logouts, errors tracked, analytics live |
| 4 | 4 | Fewer crashes, safer updates |
| 5 | 3 | Real admin data, no token leaks in logs |

**Total:** ~30 files, 5 commits. Most fixes are deletions + connecting existing hooks. No new APIs needed.
