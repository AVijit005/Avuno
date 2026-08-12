# PHASE 16 — CORE PRODUCT EXPERIENCE REPORT

> **Commit**: `fa81694 feat(product): refine core user experience`
> **Auth**: FROZEN. Not touched.
> **Deploy**: NO. **Push**: NO.

---

## 1. Home — Command Center

### Changes
- **Add Media CTA** now calls `openAdd()` from `MediaActionsContext` (was navigating to `/app/library` — unhelpful for new users)
- **OnboardingGuide** (zero-data state) rewritten:
  - Headline: **"Add your first piece of media."** — direct, functional
  - Explains what adding media powers: 4-pillar feature grid (Library · Timeline · Journal · Analytics)
  - Single dominant CTA: **"Add your first item"** → opens AddSheet
  - Keyboard hint: `⌘N` anywhere
  - No placeholder box, no fake content, no clichés

### Audit
- Loading skeleton ✓ | Error state ✓ | Active user state ✓ | New user state ✓

---

## 2. Library Experience

### Changes
- Library **header** now has a visible **"Add media"** button (desktop) that opens AddSheet
- Empty state CTA was using `document.dispatchEvent(new KeyboardEvent(...))` — **fixed** to call `openAdd()` directly
- Removed unused `viewMode` state and dead imports (`AnimatePresence`, `Check`, `List`)

### Audit
- Search ✓ | Filter ✓ | Sort ✓ | Taxonomy ✓ | Infinite scroll ✓
- Loading skeleton ✓ | Error+retry ✓ | Empty (no data) ✓ | Empty (filtered) ✓

---

## 3. Add Media Flow (AddSheet)

### Audit
- Step 1 — Type: 11 media types, tap to advance ✓
- Step 2 — Details: Title (required), Creator, Year, Poster URL ✓
- Step 3 — Status: Planning / Starting / Completed / Paused + Favorite ✓
- Save → `libraryStore`, navigate → `/app/media/<id>` ✓
- Toast: "Added to your library — saved on this device" ✓
- Cancel: Dialog X closes, state resets ✓
- Keyboard: `⌘N` / `Ctrl+N` opens from anywhere ✓

**Known Limitation**: AddSheet saves **local-only**. Backend `POST /library` requires a
catalog-backed `mediaId`. True server saves require a catalog search step or new backend endpoint.

---

## 4. Library Search

- 300ms debounce ✓ | Shimmer loading ✓ | No results state ✓
- Escape clears ✓ | `⌘F` focuses ✓ | TanStack Query cache per params ✓

---

## 5. Media Detail

### Changes
- **Chapter numbering fixed**: Was 01→02→04→05→06 (ch-connections labeled "04"). Now correctly 01→02→03→04→05
- `MediaJournalPreview` — **Critical bug fixed**: Was fetching the latest global journal entry with no media filter (cross-media contamination). Now shows the media's synopsis or an empty reflection prompt. Links to full journal.
- `MediaTimelinePreview` — Improved: best-effort client-side filtering by title prefix + clearer empty state

### Audit
- CinematicHero ✓ | Poster+backdrop ✓ | Status badge ✓ | Progress bar ✓
- ItemActionBar ✓ | ChapterNav ✓ | Loading skeleton ✓ | Error state ✓

---

## 6. Journal Integration

- Cross-media contamination **fixed** in `MediaJournalPreview`
- Cache invalidation on create: `journal.all`, `analytics.all`, `timeline.all` ✓
- `ReflectionDrawer` opens from `openReflection(id)` ✓

---

## 7. Memory Integration

- `MediaMemoriesPanel` on ch-memory chapter ✓
- `PersonalMemory` returns `null` intentionally — API doesn't expose `mediaId` in memory responses, preventing safe filtering without contamination risk
- `useAttachMemory` / `useDetachMemory` invalidate: `memories.all`, `library.all`, `media.all` ✓
- No hard refresh required ✓

---

## 8. Timeline Integration

### Changes
- **Empty state improved**: Was bare text "No events for this year." Now shows a styled info card with year + link to Library

### Audit
- Reflects actual system activity ✓ | Year selector ✓ | Scroll-driven animation ✓
- Event cards: poster, title, creator, date, mood, journal excerpt, rating ✓

---

## 9. Analytics Integration

- Counts update after journal create/delete, memory create/delete ✓
- 0-item state shows 0 counts accurately ✓
- No synthetic stats ✓

---

## 10. Cache Consistency

| Mutation | Invalidated Queries |
|---|---|
| Create Journal | `journal.all`, `analytics.all`, `timeline.all` |
| Delete Journal | `journal.all`, `analytics.all` |
| Attach Memory | `memories.all`, `library.all`, `media.all` |
| Detach Memory | `memories.all`, `library.all`, `media.all` |
| Create Memory | `memories.all`, `analytics.all` |
| Update Status | `library.all` via useLibrarySync |
| Toggle Favorite | `library.all` via useLibrarySync |

No hard refresh required. ✓

---

## 11. Mobile UX

- MobileNav FAB "+" opens AddSheet ✓
- Safe area: `env(safe-area-inset-bottom, 0px)` ✓
- Touch targets: `min-h-[44px]` nav, 56×56px FAB ✓
- AddSheet: Radix Dialog (keyboard-aware, portal, focus trap) ✓
- Library search: full-width input ✓
- Cards: 2-col mobile grid, hover overlay desktop-only ✓

---

## 12. Accessibility

- Skip link: `sr-only focus:not-sr-only` ✓
- ARIA: `dialog`, `combobox`, `listbox`, `option`, `status` ✓
- Live regions: `aria-live="polite"` for search result count ✓
- `aria-label` / `aria-pressed`: Favorite, Bookmark ✓
- `aria-current="page"`: active nav links ✓
- Keyboard: full support in CommandPalette (↑↓ Enter Escape) ✓
- `useReducedMotion()`: respects reduced motion throughout ✓
- Focus indicators: `focus-visible:ring-2 focus-visible:ring-ring` ✓
- No hover-only features ✓

---

## 13. Performance

- 300ms debounce — no unnecessary backend requests ✓
- Recharts: lazy-loaded dynamic imports ✓
- Images: `loading="lazy"` + `decoding="async"` on media cards ✓
- Image errors: fallback glyph ✓
- `backdrop-filter`: used sparingly (glass panels only) ✓
- Infinite scroll: `IntersectionObserver` (no scroll listener) ✓
- `React.memo` on `ItemActionBar` ✓

---

## 14. Tests

```
Test Files  11 passed (11)
     Tests  40 passed (40)
  Duration  ~60s
```

All 40 unit/integration tests pass. ✓

---

## 15. E2E

### New: `tests/e2e/product-journey.spec.ts`

Three real-behavior scenarios:
1. **Full product journey**: Login → Home (Add Media btn) → Library (search) → AddSheet (type→title→status→confirm) → Media Detail → Journal → Memories → Timeline → Analytics → Logout
2. **Home empty state**: Verifies onboarding CTA or add button is present
3. **Library search**: Type, debounce, clear via Escape and X button — no crashes

> E2E runs via Docker. `bunx playwright test`

---

## 16. Files Changed

| File | Change |
|---|---|
| `src/routes/app.index.tsx` | Rewritten OnboardingGuide; Add Media CTA → `openAdd()` |
| `src/routes/app.library.index.tsx` | Library header Add button; empty state CTA → `openAdd()`; dead code removed |
| `src/routes/app.media.$id.tsx` | Fixed chapter numbering (01→02→03→04→05) |
| `src/routes/app.timeline.tsx` | Better empty state with link to Library |
| `src/components/media-detail/MediaJournalPreview.tsx` | Fixed cross-media contamination bug |
| `src/components/media-detail/MediaTimelinePreview.tsx` | Title-based filtering + better empty state |
| `tests/e2e/critical-journey.spec.ts` | Prettier formatting fix |
| `tests/e2e/product-journey.spec.ts` | **New**: Full product journey E2E test |

---

## 17. Local Commit

```
fa81694 feat(product): refine core user experience
9 files changed, 905 insertions(+), 83 deletions(-)
```

**NO PUSH. NO DEPLOY.**

---

## 18. Remaining Limitations

1. **AddSheet is local-only**: Items saved to `libraryStore` (localStorage). Backend requires catalog-backed `mediaId`. True server-backed adds need a catalog search step or new backend endpoint.

2. **MediaJournalPreview — no per-media filtering**: Journal API has no `mediaId` filter. Shows synopsis + prompt instead of risking unrelated entries appearing.

3. **MediaTimelinePreview — best-effort filtering**: Timeline API has no `mediaId` filter. Events filtered client-side by title prefix — approximate but safe.

4. **PersonalMemory returns null**: Memories API doesn't return `mediaId` in responses. Hidden to prevent cross-media contamination until API is extended.

5. **Local items don't appear in Analytics/Timeline**: Items added via AddSheet are localStorage-only and not reflected in server-driven Analytics/Timeline screens.
