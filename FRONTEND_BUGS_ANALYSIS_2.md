# FRONTEND BUGS & ISSUES ANALYSIS v2
## Avuno — Chronicle Your Media Story

**Date:** 2026-08-06
**Status:** CRITICAL — Production Issues Detected
**Files Analyzed:** 441 TypeScript/TSX files
**Severity Levels:** CRITICAL | HIGH | MEDIUM | LOW

---

## EXECUTIVE SUMMARY

This comprehensive line-by-line analysis of the Avuno frontend codebase identified **80+ bugs, architectural issues, and production risks**. The application relies on extensive **hardcoded/mock data**, has **incomplete API integrations**, **missing error handling**, **type safety violations**, **race conditions**, and **performance anti-patterns** that will cause severe production failures.

### Impact Assessment

| Area | Severity | Impact |
|------|----------|--------|
| Data Integrity | CRITICAL | Mock data masking real API failures |
| User Experience | CRITICAL | Silent failures and broken features |
| Performance | HIGH | Memory leaks and unnecessary re-renders |
| Maintainability | HIGH | Type safety violations everywhere |
| Security | MEDIUM | Missing input validation, token handling |
| Analytics | HIGH | Events only tracked in dev mode |
| Testing | MEDIUM | 1 E2E test, 0 unit tests |

### Code Quality Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TypeScript `any` usage | 67+ | 0 | FAIL |
| Mock/hardcoded data arrays | 14+ files | 0 | FAIL |
| Test coverage | ~1% | >70% | FAIL |
| Error tracking | None | Sentry | FAIL |
| Analytics in prod | Broken | Working | FAIL |
| TypeScript strict mode | Off | On | FAIL |

---

## CRITICAL ISSUES — PRODUCTION BLOCKERS

---

### ISSUE #1: Hardcoded Empty Arrays (Mock Data) — 14 Locations

**Severity:** CRITICAL
**Impact:** Users see empty screens even when backend has data

#### 1a. `src/lib/types.ts:96-102`
```
export const MEDIA: any[] = [];
export function getMediaItems(): any[] {
  if (typeof window !== 'undefined' && (window as any).__CHRONICLE_MEDIA__) {
    return (window as any).__CHRONICLE_MEDIA__;
  }
  return MEDIA;
}
```
- Root Cause: Legacy placeholder never connected to API
- Fix: Remove entirely, use `useMediaList()` hook instead

#### 1b. `src/routes/app.calendar.tsx:13-14`
```
const CALENDAR_YEAR: any = {};
const MEDIA: any[] = [];
```
- Root Cause: Leftover from before API integration
- Fix: Remove both lines

#### 1c. `src/components/dashboard/JournalPreview.tsx:5`
```
const JOURNAL: any[] = [];
```
- Root Cause: Journal API hook exists (`useJournalEntries()`) but component never calls it
- Fix: Replace with `useJournalEntries()` hook call

#### 1d. `src/components/collections/CollectionJournal.tsx:5`
```
const JOURNAL: any[] = [];
```
- Fix: Connect to `useJournalEntries()` hook

#### 1e. `src/lib/goals.ts:36`
```
export const GOALS_FULL: Goal[] = [];
export const getCurrentGoals = () => GOALS_FULL.filter((g) => g.status === "Active");
export const getCompletedGoals = () => GOALS_FULL.filter((g) => g.status === "Completed");
export const getGoalInsights = () => [];
```
- Fix: Create `useGoals()` hook connected to API, or remove goals feature

#### 1f. `src/lib/achievements.ts:32`
```
export const ACHIEVEMENTS_FULL: any[] = [];
export const getAchievements = () => ACHIEVEMENTS_FULL;
export const getMilestones = () => ACHIEVEMENTS_FULL.slice(0, 5);
export function getAchievementsByCategory() {
  return {} as Record<AchievementCategory, Achievement[]>;
}
```
- Fix: Create `useAchievements()` hook or remove feature

#### 1g. `src/components/dashboard/ThisWeek.tsx:10`
```
const THIS_WEEK: any[] = [];
```
- Root Cause: Component reads from hardcoded array instead of API
- Fix: Create `useThisWeekStats()` hook from analytics API

#### 1h. `src/lib/library.ts:43`
```
export const ALL_LIBRARY: MediaItem[] = [];
```
- Note: Less critical since `liveItems()` reads from Zustand store, but exported `ALL_LIBRARY` is misleading

#### 1i. `src/lib/collectionRelationships.ts`
```
const COLLECTIONS: any[] = [];
```

#### 1j. `src/lib/collectionInsights.ts`
```
export const getCollectionInsights = (collection: any) => [];
```

#### 1k. `src/lib/collectionWorkspace.ts`
```
export const getWorkspace = (id: any) => ({ notes: [], questions: [], materials: [] } as any);
```

#### 1l. `src/lib/notesEngine.ts`
- All return empty arrays, never connected to API

#### 1m. `src/lib/saveForLater.ts`
- All return empty arrays, never connected to API

#### 1n. `src/lib/bookmarks.ts`
- Uses localStorage only, not synced with backend

---

### ISSUE #2: Intelligence Components — All Fake Data

**Severity:** CRITICAL
**Impact:** 3 analytics components show completely fake/hardcoded data

#### 2a. `src/components/intelligence/LibraryMap.tsx:5-15`
```
export function LibraryMap(props: any) {
  const tags = [
    { name: "Sci-Fi", count: 42, color: "var(--primary)" },
    { name: "Cyberpunk", count: 18, color: "oklch(0.65 0.22 295)" },
    { name: "Fantasy", count: 35, color: "oklch(0.78 0.16 50)" },
    // ... all hardcoded fake data
  ];
}
```
- Fix: Accept genre analytics from `useAnalytics()` hook

#### 2b. `src/components/intelligence/MediaEvolution.tsx:12-20`
```
export function MediaEvolution(props: any) {
  const data = [
    { year: "2019", SciFi: 20, Drama: 80, Action: 40 },
    { year: "2020", SciFi: 45, Drama: 60, Action: 50 },
    // ... all hardcoded fake data
  ];
}
```
- Fix: Accept timeline data from analytics API

#### 2c. `src/components/intelligence/MemoryDNA.tsx:13-21`
```
export function MemoryDNA(props: any) {
  const data = [
    { trait: "Nostalgic", value: 85, fullMark: 100 },
    { trait: "Thrilling", value: 65, fullMark: 100 },
    // ... all hardcoded fake data
  ];
}
```
- Fix: Accept emotional analysis from journal API

---

### ISSUE #3: Collection Components — Fake Data + No Types

**Severity:** CRITICAL
**Impact:** Collection features show fake/unusable data

#### 3a. `src/components/collections/CollectionAnalyticsPreview.tsx:14,18-26`
```
interface Props {
  collection: any;
}
const data = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 19 },
  // ... all hardcoded
];
```

#### 3b. `src/components/collections/CollectionMoodboard.tsx:6,11-16`
```
interface Props {
  collection: any;
}
const images = collection?.images ?? [
  "https://images.unsplash.com/photo-...",
  // ... external URLs
];
```

#### 3c. `src/components/collections/CollectionExplorer.tsx:7`
```
interface Props {
  collections: any[];
}
```

#### 3d. `src/components/challenges/SmartCollectionCard.tsx:7`
```
interface Props {
  collection: any; // Using any temporarily
}
```

#### 3e. `src/components/discovery/GenreExpansion.tsx:13`
```
interface Props {
  data?: any;
}
const chartData = [
  { genre: "Sci-Fi", A: 120, B: 110, fullMark: 150 },
  // ... all hardcoded
];
```

---

### ISSUE #4: Profile Museum — Empty Gallery Data

**Severity:** CRITICAL
**Impact:** Museum feature shows empty galleries

#### `src/lib/museumEngine.ts:12-21`
```
export function getMuseum(): MuseumGallery[] {
  return [
    { id: "emotional", title: "Most Emotional", items: [] },
    { id: "beautiful", title: "Most Beautiful", items: [] },
    // ... all items arrays are EMPTY
  ];
}
```
#### `src/components/profile/Museum.tsx:16`
```
const items = (g as any).items.map((m: any) =>
  libraryItems.find(x => x.id === m.id || x.mediaId === m.id)
).filter(Boolean);
```
- Root Cause: `getMuseum()` returns empty `items: []` for all galleries
- Fix: Museum needs a backend endpoint that returns curated items, or remove feature

---

### ISSUE #5: Token Refresh Race Condition

**Severity:** CRITICAL
**Impact:** Multiple simultaneous 401s trigger multiple token refreshes, causing user logout

#### `src/lib/api/fetch.ts:69-76`
```
async function forceRefreshValidToken(): Promise<string> {
  if (!getTokenStore().refreshPromise) {
    modRefreshPromise = refreshAccessToken().finally(() => {
      modRefreshPromise = null;
    });
  }
  return (await (getTokenStore().refreshPromise || modRefreshPromise)) as string;
}
```
- Bug: `getTokenStore()` reads from module-level `modRefreshPromise`, but the condition checks the same variable through a function call, creating a race window

#### `src/lib/api/fetch.ts:123,163-178`
```
let refreshAttempted = false; // Per-request, NOT shared

if (response.status === 401 && !skipAuth) {
  if (refreshAttempted) {
    throw new ApiError('Session expired', 401, 'SESSION_EXPIRED');
  }
  refreshAttempted = true; // Only blocks THIS request
  const newToken = await forceRefreshValidToken();
  if (newToken) { continue; }
}
```
- Impact: If 5 API calls fail simultaneously, all 5 try to refresh the token
- Fix: Store refresh promise in a shared module-level variable, add mutex lock

---

### ISSUE #6: Calendar Fallback Uses Hardcoded MEDIA Array

**Severity:** CRITICAL
**Impact:** When API data is missing, calendar shows "Story 1, Story 2" instead of real titles

#### `src/routes/app.calendar.tsx:126-136`
```
return Array.from({ length: Math.min(cell.mediaCount, 6) }, (_, i) => {
  const media = MEDIA.length > 0
    ? MEDIA[(monthIdx * 100 + selectedDay + i * 7) % MEDIA.length]
    : undefined;
  const title = media ? media.title : `Story ${i + 1}`;
  // Falls back to fake "Story 1", "Story 2", etc.
});
```
- Fix: Remove the MEDIA fallback entirely, use only `dayData` from API

---

### ISSUE #7: DevPlayground Uses `any`

**Severity:** LOW (dev-only route)
**Impact:** None in production, but violates type safety

#### `src/routes/app.dev.tsx:19`
```
const findings: any[] = [];
```

---

## HIGH PRIORITY ISSUES

---

### ISSUE #8: ErrorBoundary Doesnt Log Errors

**Severity:** HIGH
**Impact:** Production errors silently disappear, impossible to debug

#### `src/components/common/ErrorBoundary.tsx:17-18`
```
static getDerivedStateFromError(error: Error): State {
  return { error };
  // ERROR CAUGHT BUT NEVER LOGGED
}
```
- Fix: Add `console.error` + Sentry integration in `componentDidCatch`

---

### ISSUE #9: Analytics Only Works in Dev Mode

**Severity:** HIGH
**Impact:** ZERO analytics data collected in production

#### `src/lib/analytics.ts:5-8`
```
track: (eventName: string, properties?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Track: ${eventName}`, properties);
    return; // EXITS EARLY in dev
  }
  // PostHog/Plausible only runs in prod
  // But if not loaded, nothing happens
},
```
- Fix: Always track events (plus dev logging), initialize PostHog/Plausible on app load

---

### ISSUE #10: console.log in Production Auth Code

**Severity:** HIGH
**Impact:** User data leaks to console in dev mode

#### `src/routes/auth.tsx:483`
```
onSubmit={signUp.handleSubmit(onSubmit, (errors) => {
  console.error("Form validation failed:", errors);
  setErrorMessage(Object.values(errors)[0]?.message || "Validation failed");
})}
```
- Fix: Remove console.error, use error tracking service

---

### ISSUE #11: Missing Input Validation in AddSheet

**Severity:** HIGH
**Impact:** Invalid data can be added to library

#### `src/components/capture/AddSheet.tsx:97,105`
```
const yearNum = Number(year) || new Date().getFullYear();
// Number("abc") = NaN, falls back to current year silently

const poster = poster.trim() || DEFAULT_POSTER;
// No URL validation - user could enter garbage
```
- Fix: Add Zod schema validation, validate year range 1800-2100, validate URL format

---

### ISSUE #12: Missing Debounce on Search Input

**Severity:** HIGH
**Impact:** Excessive API calls on every keystroke

#### `src/components/search/CommandPalette.tsx:331-333`
```
<input
  value={q}
  onChange={(e) => setQ(e.target.value)} // Triggers search immediately
/>
```
- Fix: Add debounce (300-500ms) using `use-debounce` or custom hook

---

### ISSUE #13: Memory Leaks — Timeouts Not Cleaned

**Severity:** HIGH
**Impact:** App becomes slow after extended use

#### `src/components/media/ItemActionBar.tsx:73,158`
```
const timeoutRef = useRef<NodeJS.Timeout | null>(null);

// Cleanup only clears ONE timeout:
useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);

// But multiple timeouts can be set:
timeoutRef.current = setTimeout(() => openReflection(id), 60);
// If another timeout is set before cleanup, the first one leaks
```
- Fix: Use array of timeouts and clean all on unmount

#### `src/components/search/CommandPalette.tsx:94`
```
setTimeout(() => inputRef.current?.focus(), 60);
// Never cleaned up on unmount
```

---

### ISSUE #14: Race Condition in Library Store

**Severity:** HIGH
**Impact:** Status updates may be lost

#### `src/lib/store/libraryStore.ts:120-133`
```
setStatus: (id, status) =>
  set((s) => {
    const prev = s.meta[id] ?? { status };
    const next: StoredMeta = { ...prev, status, lastActivityAt: "Just now" };
    // Two rapid setStatus calls: second overwrites first
    return { meta: { ...s.meta, [id]: next } };
  }),
```
- Fix: Use Zustand immer middleware for safer updates

---

### ISSUE #15: Adapter Null/Undefined Handling

**Severity:** HIGH
**Impact:** App crashes when API returns unexpected null values

#### `src/lib/adapters/media.ts:36,67`
```
year: m.releaseYear ?? 0,  // BAD: 0 is not a valid year
year: media?.releaseYear ?? 0,  // BAD: 0 is not a valid year
```
- Fix: Use `new Date().getFullYear()` for year fallback, log warnings for unexpected data

---

### ISSUE #16: Search Params Use `[key: string]: any`

**Severity:** HIGH
**Impact:** No type safety on any API query parameter

#### Affected Files:
- `src/lib/api/media.ts:39` — `MediaSearchParams`
- `src/lib/api/media.ts:54` — `MediaFilterParams`
- `src/lib/api/library.ts:68` — `LibraryFilterParams`
- `src/lib/api/search.ts:59` — `SearchParams`

```
export interface MediaSearchParams {
  [key: string]: any;  // Allows ANY property
  search: string;
  // ...
}
```
- Fix: Remove index signature, use only defined properties

---

### ISSUE #17: Collection Journal Maps Empty Array

**Severity:** HIGH
**Impact:** Collection journal section always empty

#### `src/components/collections/CollectionJournal.tsx:25`
```
{JOURNAL.map((j) => ( // Maps over empty array
  <li key={j.id}> ... </li>
))}
```
- Fix: Connect to `useJournalEntries()` hook, filter by collection

---

### ISSUE #18: Recharts Components Typed as `any`

**Severity:** MEDIUM
**Impact:** No type safety for chart configurations

#### Affected Files:
- `src/components/dashboard/ThisWeek.tsx:4-6`
- `src/components/intelligence/MediaEvolution.tsx:4-8`
- `src/components/intelligence/MemoryDNA.tsx:4-9`
- `src/components/collections/CollectionAnalyticsPreview.tsx:4-8`
- `src/components/discovery/GenreExpansion.tsx:4-8`

```
const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({
    default: m.ResponsiveContainer as unknown as ComponentType<any>
  }))
);
```
- Fix: Use proper Recharts types instead of `ComponentType<any>`

---

## MEDIUM PRIORITY ISSUES

---

### ISSUE #19: API Base URL Fallback Logic

**Severity:** MEDIUM
**Impact:** Production builds may use wrong API URL

#### `src/lib/api/constants.ts:1-3`
```
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.SSR
  ? 'http://api:3000/api'
  : '/api');
```
- Issue: Falls back to `http://api:3000/api` in SSR which is a Docker internal URL
- Fix: Require `VITE_API_URL` in production, fail explicitly if missing

---

### ISSUE #20: Date Formatting Inconsistency

**Severity:** MEDIUM
**Impact:** Confusing time displays across the app

#### Multiple locations use different formats:
- `"Just now"` — hardcoded string in `libraryStore.ts:123`
- `"Today"` — hardcoded in `libraryStore.ts:125`
- ISO date strings — in API responses
- Relative times — in some components
- `new Date().toISOString()` — in others

- Fix: Create central date formatting utility with `date-fns`, respect user locale

---

### ISSUE #21: Missing Image Optimization

**Severity:** MEDIUM
**Impact:** Slow page loads with many images

#### `src/components/media/MediaCard.tsx` (and others)
```
<img
  src={item.poster}
  loading="lazy" // Good
  // Missing: srcSet for responsive images
  // Missing: blur placeholder
  // Missing: error handling for broken images
/>
```
- Fix: Add srcSet, blur hash placeholder, error fallback

---

### ISSUE #22: Missing Offline Support

**Severity:** MEDIUM
**Impact:** App breaks without internet

- No service worker
- No API response caching
- No offline indicator
- No mutation queue for offline operations

---

### ISSUE #23: Accessibility Issues

**Severity:** MEDIUM
**Impact:** App not usable for screen reader users

#### Identified Issues:
- Missing ARIA labels on icon-only buttons
- No focus management in modals
- Color contrast issues in dark mode
- No screen reader announcements for loading states
- CommandPalette keyboard navigation works but lacks proper ARIA attributes

---

### ISSUE #24: Incomplete Test Coverage

**Severity:** MEDIUM
**Impact:** Regressions ship to production undetected

#### Current State:
- 1 E2E test (`tests/e2e.test.ts`) — auth + dashboard flow only
- 0 unit tests
- 0 integration tests
- `vitest` is configured but no test files exist in `src/`

#### Critical Paths Needing Tests:
1. Auth flow (login, register, token refresh)
2. Library CRUD (add, update status, remove)
3. Journal entries (create, edit, delete)
4. Search functionality
5. Calendar data rendering
6. Adapters (API response -> UI type)

---

### ISSUE #25: Inconsistent Naming Conventions

**Severity:** LOW
**Impact:** Developer confusion

#### Mixed conventions:
- Some files: `PascalCase.tsx` (e.g., `MediaCard.tsx`)
- Some files: `kebab-case.tsx` (e.g., `use-media.ts`)
- Components: PascalCase
- Hooks: kebab-case with `use-` prefix
- Utils: kebab-case

---

### ISSUE #26: Missing Keyboard Shortcuts Help

**Severity:** LOW
**Impact:** Users dont know about shortcuts

#### `src/lib/shortcuts.ts` exists but:
- No help modal
- No tooltip hints
- No documentation

---

## API CONTRACT VERIFICATION

### Backend DTO vs Frontend Type Mismatches

| Frontend Type | Backend DTO | Issue |
|---------------|-------------|-------|
| `MediaItem.year` | `MediaResponse.releaseYear` | `0` fallback invalid |
| `MediaItem.rating` | `LibraryItemResponse.rating` | Scale mismatch possible |
| `MediaItem.status` | `LibraryItemResponse.status` | String vs enum |
| `UIMediaItem.poster` | `MediaResponse.posterUrl` | Multiple fallback paths |
| `UIJournalEntry` | `JournalEntryResponse` | Fields may not match |
| `UICalendarYear` | `CalendarYearResponse` | Complex nested structure |

### API Response Validation Needed:
1. All `apiGet` responses should be validated with Zod at runtime
2. Backend pagination (`hasMore`, `nextCursor`) should use `null` not `undefined`
3. Error responses should always include `code` field
4. 204 responses return `null as unknown as T` — potential crash

---

## RECOMMENDED FIX PLAN

### Phase 1: Production Blockers (Week 1) — DO FIRST

1. **Remove ALL hardcoded data arrays** (14 files)
   - `src/lib/types.ts` — Remove `MEDIA` array and `getMediaItems()`
   - `src/routes/app.calendar.tsx` — Remove lines 13-14
   - `src/components/dashboard/JournalPreview.tsx` — Connect to API
   - `src/components/collections/CollectionJournal.tsx` — Connect to API
   - `src/lib/goals.ts` — Connect to API or remove
   - `src/lib/achievements.ts` — Connect to API or remove
   - `src/components/dashboard/ThisWeek.tsx` — Connect to API
   - `src/lib/library.ts` — Remove `ALL_LIBRARY`
   - All others listed in Issue #1

2. **Fix token refresh race condition**
   - `src/lib/api/fetch.ts` — Add mutex lock for refresh

3. **Add error logging to ErrorBoundary**
   - `src/components/common/ErrorBoundary.tsx` — Add `componentDidCatch` + Sentry

4. **Fix calendar fallback**
   - `src/routes/app.calendar.tsx` — Remove MEDIA fallback

5. **Write unit tests for critical paths**
   - Auth flow, Library CRUD, Journal CRUD, Adapters

### Phase 2: Type Safety (Week 2)

1. **Replace all 67+ `any` types** with proper interfaces
2. **Fix API param types** — Remove `[key: string]: any` index signatures
3. **Fix intelligence components** — Add proper props types
4. **Fix collection components** — Add proper props types
5. **Enable TypeScript strict mode**

### Phase 3: Data Integrity & UX (Week 3)

1. **Add input validation** to AddSheet.tsx (Zod schemas)
2. **Add debounce** to CommandPalette.tsx search
3. **Fix memory leaks** — Audit all setTimeout/setInterval
4. **Add loading/error/skeleton states** everywhere
5. **Fix adapter null handling**

### Phase 4: Analytics & Monitoring (Week 4)

1. **Fix analytics.ts** — Always track events
2. **Initialize PostHog** in production
3. **Add Sentry** for error tracking
4. **Standardize date formatting**

### Phase 5: Performance & Polish (Week 5+)

1. **Add React.memo** to heavy components
2. **Code-split routes** with lazy()
3. **Optimize images** (srcSet, blur placeholders)
4. **Add service worker** for offline support
5. **Run accessibility audit**

---

## FILES REQUIRING IMMEDIATE ATTENTION

### Top Priority (Fix Today):
1. `src/lib/types.ts` — Remove MEDIA array
2. `src/routes/app.calendar.tsx` — Remove unused variables + fix fallback
3. `src/components/dashboard/JournalPreview.tsx` — Connect to API
4. `src/components/collections/CollectionJournal.tsx` — Connect to API
5. `src/components/dashboard/ThisWeek.tsx` — Connect to API
6. `src/lib/api/fetch.ts` — Fix token refresh race
7. `src/components/common/ErrorBoundary.tsx` — Add error logging
8. `src/lib/goals.ts` — Connect to API or remove
9. `src/lib/achievements.ts` — Connect to API or remove

### Second Priority (Fix This Week):
10. `src/components/intelligence/*.tsx` — All 3 components need API data
11. `src/components/collections/CollectionAnalyticsPreview.tsx` — Connect to API
12. `src/components/collections/CollectionMoodboard.tsx` — Connect to API
13. `src/lib/museumEngine.ts` — Connect to API
14. `src/lib/analytics.ts` — Fix production tracking
15. `src/components/capture/AddSheet.tsx` — Add validation
16. `src/components/search/CommandPalette.tsx` — Add debounce

---

## TESTING CHECKLIST

### Before Deploying to Production:
- [ ] All API endpoints return real data (no mocks)
- [ ] Journal entries can be created and viewed
- [ ] Calendar loads without crashes
- [ ] Token refresh works under load
- [ ] Errors are logged to Sentry
- [ ] Memory usage stable after 1 hour
- [ ] All TypeScript errors resolved
- [ ] No `any` types in critical paths
- [ ] Input validation prevents bad data
- [ ] Images load efficiently
- [ ] App works on slow networks
- [ ] Accessibility audit passes
- [ ] No console errors in production build
- [ ] All unit tests pass
- [ ] All E2E tests pass

---

**Generated:** 2026-08-06
**Version:** 2.0
**Next Review:** After Phase 1 fixes complete
