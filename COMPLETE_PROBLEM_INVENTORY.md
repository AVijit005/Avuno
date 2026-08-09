# Chronicle/Avuno — Complete Problem Inventory

## Every Issue Found Across the Entire Codebase

**Generated:** 2026-08-09 | **Target:** $1B SaaS | **Total Issues:** 500+
**Files Analyzed:** 1,500+ | **Lines of Code:** ~100,000+

---

## 📁 LEGEND

| Severity         | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| 🔴 **CRITICAL**  | Blocks scaling, revenue, or security — must fix immediately |
| 🟠 **HIGH**      | Significant bug, performance issue, or architectural flaw   |
| 🟡 **MEDIUM**    | Maintainability, UX, or technical debt issue                |
| 🟢 **LOW**       | Polish, optimization, or minor inconsistency                |
| 🔵 **STRATEGIC** | Missing feature required for $1B outcome (per STRATEGY.md)  |

---

## 📋 TABLE OF CONTENTS

1. [Backend - Auth Module](#backend---auth-module)
2. [Backend - Library Module](#backend---library-module)
3. [Backend - Wrapped Module](#backend---wrapped-module)
4. [Backend - Analytics Module](#backend---analytics-module)
5. [Backend - Search Module](#backend---search-module)
6. [Backend - Media Module](#backend---media-module)
7. [Backend - Users Module](#backend---users-module)
8. [Backend - Collections Module](#backend---collections-module)
9. [Backend - Journal Module](#backend---journal-module)
10. [Backend - Notifications Module](#backend---notifications-module)
11. [Backend - Progress Module](#backend---progress-module)
12. [Backend - Interactions Module](#backend---interactions-module)
13. [Backend - Core/Common](#backend---corecommon)
14. [Frontend - Routes](#frontend---routes)
15. [Frontend - Hooks](#frontend---hooks)
16. [Frontend - Lib/Utils](#frontend---libutils)
17. [Frontend - Components](#frontend---components)
18. [Database Schema](#database-schema)
19. [Security](#security)
20. [Strategic Gaps (Phase 1-4)](#strategic-gaps-phase-1-4)

---

# BACKEND - AUTH MODULE

## `apps/backend/src/auth/auth.service.ts`

| Line    | Severity    | Problem                                                      | Details                                                                                                                                                                                                                                                                                            |
| ------- | ----------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 64-77   | 🟠 HIGH     | Fixed-window rate limiting allows burst at window boundaries | Attackers can make 5 attempts at 14:59 and 5 at 15:00 = 10/min. Email key hashed (good) but IP key not salted, allowing IP enumeration via timing.                                                                                                                                                 |
| 81-89   | 🟡 MEDIUM   | Timing oracle partially mitigated                            | `dummyCompare()` burns CPU but early return on `!user` still leaks existence via exception vs hash compare path. Not constant-time.                                                                                                                                                                |
| 114-123 | 🟡 MEDIUM   | Email verification oracle                                    | Returns "Email not verified" ONLY after password validates. Confirms both account existence AND valid password. Should return generic "Invalid credentials" always.                                                                                                                                |
| 147-170 | 🔴 CRITICAL | Refresh token rotation race condition                        | `rotateWithSession()` calls `sessionService.validate()` OUTSIDE transaction (line 159), then rotates inside. Concurrent request could validate same token, both enter rotation. Session invalidation uses raw token hash - if session already invalidated by first request, second still succeeds. |
| 195-210 | 🟡 MEDIUM   | `tryDecodeAccessToken` swallows all errors                   | Malformed/expired tokens return `undefined` silently. Used in logout to denylist access token. If token malformed, `jti` missing and token stays valid.                                                                                                                                            |
| 234-246 | 🟢 LOW      | `logoutAll` epoch second-precision                           | `revokeAllForUser` sets epoch to `now + 1 second`. Tokens issued in same second survive. Use millisecond precision or incrementing counter.                                                                                                                                                        |
| 287-325 | 🟢 LOW      | OAuth code exchange fallback non-atomic                      | `GETDEL` used (good) but fallback for Redis < 6.2 does GET then DEL (non-atomic). Two concurrent requests could both read same code.                                                                                                                                                               |

## `apps/backend/src/auth/auth.controller.ts`

| Line    | Severity                 | Problem                                 | Details                                                                                                                                                       |
| ------- | ------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28-32   | 🟡 MEDIUM                | Register throttling too permissive      | 3/min allows account enumeration. Should be stricter (1/min per IP) + CAPTCHA after N failures.                                                               |
| 349-376 | 🔴 CRITICAL              | **Google OAuth without PKCE/state**     | `window.location.href = \`${API_BASE_URL}/auth/google\``— no PKCE, no`state` parameter. Server handles CSRF but client doesn't verify. Account takeover risk. |
| 103-113 | 🔴 CRITICAL (historical) | `forgot-password` was completely broken | Comment confirms it only added email to Redis set, never sent email. Fixed in current code but needs integration test verification.                           |

## `apps/backend/src/auth/guards/jwt-auth.guard.ts`

| Line | Severity | Problem                            | Details                                                                                                                                                  |
| ---- | -------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 60   | 🟢 LOW   | Role override may become undefined | `request.user = { ...payload, role: state.role }` — if `state.role` undefined, role becomes undefined. Add fallback: `role: state.role ?? payload.role`. |

## `apps/backend/src/auth/services/refresh-token.service.ts`

| Line    | Severity  | Problem                                           | Details                                                                                                                                                                  |
| ------- | --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 86-151  | 🟡 MEDIUM | `rotateWithSession()` duplicates `rotate()` logic | DRY violation. Session invalidation uses `hashSessionToken(token)` but `token` is OLD plaintext token. If `hashSessionToken` not deterministic or uses salt, this fails. |
| 127-130 | 🟢 LOW    | Session invalidation by raw token hash            | `where: { token: hashSessionToken(token) }`. If session already rotated, token hash won't match. But inside same transaction as token rotation, so should be consistent. |
| 168-170 | 🟢 LOW    | `hashToken` uses SHA-256 without pepper           | If DB leaks, offline brute-force possible. Add server-side pepper from config.                                                                                           |

## `apps/backend/src/auth/services/token-revocation.service.ts`

| Line   | Severity  | Problem                                            | Details                                                                                                      |
| ------ | --------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 67-77  | 🟢 LOW    | `revokeAllForUser` uses second-precision timestamp | `cutoff = now + 1`. Tokens with `iat` in same second survive. Use millisecond epoch or incrementing counter. |
| 86-108 | 🟡 MEDIUM | `isRevoked` skips epoch check if `iat` missing     | Should require `iat` in all tokens (added by JwtService by default). Add explicit check.                     |

## `apps/backend/src/auth/services/password-reset.service.ts`

| Line    | Severity  | Problem                                            | Details                                                                                                               |
| ------- | --------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 149-154 | 🟡 MEDIUM | Revokes ALL credentials on reset — silent failures | Uses `Promise.all` with `.catch(() => undefined)` — silent failures. Log failures. Consider transactional revocation. |
| 122-130 | 🟡 MEDIUM | `resendVerification` leaks verification status     | Throws if already verified. Should return identical response regardless.                                              |

## `apps/backend/src/auth/services/email-verification.service.ts`

| Line    | Severity  | Problem                                         | Details                                                                 |
| ------- | --------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| 122-130 | 🟡 MEDIUM | `resendVerification` throws if already verified | Leaks verification status. Should return identical response regardless. |

## `apps/backend/src/auth/strategies/google.strategy.ts`

| Line  | Severity | Problem                        | Details                                                                                                                                                               |
| ----- | -------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 63-75 | 🟢 LOW   | Falls back to unverified email | Strategy uses first verified email, falls back to first email if no verified. But service rejects unverified (line 24-26). Strategy should only pass verified emails. |

## `apps/backend/src/auth/services/google-oauth.service.ts`

| Line  | Severity  | Problem                                   | Details                                                                                                                                                                                                                                                       |
| ----- | --------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 40-70 | 🟡 MEDIUM | Account linking without re-authentication | Links OAuth to existing user by email. No re-authentication required (user proves email ownership via Google). Risk: if Google account compromised, attacker links to victim's account. Require password confirmation or email verification code for linking. |

---

# BACKEND - LIBRARY MODULE

## `apps/backend/src/library/library.service.ts`

| Line    | Severity    | Problem                                            | Details                                                                                                                                                                                                                                                                                                           |
| ------- | ----------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 35-38   | 🔴 CRITICAL | **Concurrent add race condition**                  | Check-then-create pattern. `findByUserIdAndMediaId` then `create`. Unique constraint at DB level (`userId_mediaId`) will catch duplicates, but service throws `ConflictException` only on `findByUserIdAndMediaId` hit. If two requests pass check simultaneously, second DB insert fails with P2002 — unhandled! |
| 102-123 | 🟡 MEDIUM   | `REWATCHING` doesn't increment `rewatchCount`      | Status transition logic auto-sets `startedAt` for in-progress, auto `finishedAt` + `progress=100` for COMPLETED, reset for PLANNING. But `REWATCHING` sets `startedAt` but doesn't increment `rewatchCount`.                                                                                                      |
| 144-154 | 🟢 LOW      | `detectMediaType` relies on Prisma include         | Checks 8 media relations in order. If include missing, returns 'unknown'. Ensure all queries include media relations.                                                                                                                                                                                             |
| 156-189 | 🟢 LOW      | `toResponse` fallback logic may use 'unknown' type | Line 158: `row.media ?? row[mediaType] ?? null`. If `mediaType` from `detectMediaType` is 'unknown', falls back to `row.media` which may be null.                                                                                                                                                                 |

## `apps/backend/src/library/library.repository.ts`

| Line    | Severity  | Problem                                                        | Details                                                                                                                                                                                          |
| ------- | --------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 176-206 | 🟠 HIGH   | `findAll` without type runs 8 parallel queries + JS merge-sort | Fetches `limit` from each type, merges in memory, slices. If user has 10k items per type, fetches 80k rows. O(N log N) merge.                                                                    |
| 303-358 | 🟡 MEDIUM | Update whitelist mismatch with DTO                             | ALLOWED_UPDATE_FIELDS includes fields not in DTO (`review`, `readAt`, `watchedAt`, `completedAt`, `pausedAt`, `droppedAt`, `timesWatched`, `timesRead`, `timesPlayed`). Sync whitelist with DTO. |
| 102-120 | 🟢 LOW    | `findById` without type loops all 8 types                      | N+1 query (8 queries). Acceptable for single item. Add optional type hint to caller.                                                                                                             |

## `apps/backend/src/library/library-statistics.service.ts`

| Line  | Severity | Problem                                           | Details                                 |
| ----- | -------- | ------------------------------------------------- | --------------------------------------- |
| 16-21 | 🟢 LOW   | Runs 3 parallel queries, each fans out to 8 types | 24 queries total. Acceptable for stats. |

---

# BACKEND - WRAPPED MODULE

## `apps/backend/src/wrapped/wrapped.service.ts`

| Line    | Severity    | Problem                                                    | Details                                                                                                                                                                                                                |
| ------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 34-38   | 🔴 CRITICAL | **Generate race condition**                                | `generate` checks existing via `findWrappedYear` — two concurrent requests could both pass check. DB unique constraint on `(userId, year)` catches second insert but `ConflictException` not caught from Prisma P2002. |
| 95-98   | 🟢 LOW      | Regenerate overwrites generator `sortOrder`                | `upsertStats` called with `sortOrder: i + 1`. Generator uses 1-11. Regenerate uses 1-N. Inconsistent. Preserve generator's sortOrder.                                                                                  |
| 103-160 | 🟢 LOW      | Duplicate insight logic with `wrapped-insights.service.ts` | Same templates duplicated. Extract shared insight generation.                                                                                                                                                          |

## `apps/backend/src/wrapped/wrapped.repository.ts`

| Line    | Severity    | Problem                                                | Details                                                                                                                                                                                                                                                   |
| ------- | ----------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 107-129 | 🔴 CRITICAL | **`upsertStats` non-atomic**                           | Uses array-form `$transaction([deleteOp, createOp])` — not atomic if create fails after delete! Stats would be lost. Should use callback-form `$transaction(async tx => { await tx.wrappedStat.deleteMany(...); await tx.wrappedStat.createMany(...); })` |
| 80-105  | ✅ GOOD     | `deleteWrappedYear` ownership check INSIDE transaction | Uses interactive `$transaction` (callback form) to abort if `deleteMany` count=0. Array form would commit. Test validates this.                                                                                                                           |

## `apps/backend/src/wrapped/wrapped-generator.service.ts`

| Line    | Severity | Problem                                                    | Details                    |
| ------- | -------- | ---------------------------------------------------------- | -------------------------- |
| 103-160 | 🟢 LOW   | Duplicate insight logic with `wrapped-insights.service.ts` | Same templates duplicated. |

---

# BACKEND - ANALYTICS MODULE (HIGHEST RISK)

## `apps/backend/src/analytics/analytics.repository.ts`

| Line    | Severity    | Problem                                                                          | Details                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ----------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | 🔴 CRITICAL | **29 `any` casts** — blanket `eslint-disable @typescript-eslint/no-explicit-any` | Zero type safety on core feature. Blocks refactoring, bugs ship to prod.                                                                                                                                                                                                                                                                                                                                   |
| 92-117  | 🔴 CRITICAL | **`getHoursAndEpisodesByType` fetches ALL items**                                | `findMany` with `select: { hoursSpent, minutesSpent, currentEpisode }`. No limit. 10k items × 8 types = 80k objects in memory. Use `aggregate` with `_sum` for hours/minutes. Use `groupBy` for episodes.                                                                                                                                                                                                  |
| 220-238 | 🔴 CRITICAL | **`getReviewCount` fetches ALL items + JS loop**                                 | `select: { metadata: true }`, then iterates checking `meta?.review`. Loads all library items into memory. Add `review` column or use JSON query: `where: { metadata: { path: ['review'], not: null } }`.                                                                                                                                                                                                   |
| 360-407 | 🔴 CRITICAL | **`getActivityData` — N+1 FAN-OUT**                                              | 8 parallel `findMany` (library) + journal + memory. Each fetches ALL items in date range (365 days). No limit! 50 items/day × 365 = 18k rows × 8 types = 144k objects. **Will OOM at scale.** Use `groupBy` by date at DB level or raw SQL.                                                                                                                                                                |
| 411-466 | 🔴 CRITICAL | **`getCalendarData` — SAME N+1**                                                 | 8 parallel `findMany` for completed items + journal + memory. Fetches ALL completed items in year/month range. Merges in JS. **Will OOM at scale.**                                                                                                                                                                                                                                                        |
| 470-513 | 🔴 CRITICAL | **`getGenreData` — WORST N+1**                                                   | 8 parallel `findMany` fetching ALL library items (no date filter!) with `select: { status, rating, minutesSpent, hoursSpent, [mediaDelegate]: { select: { genres: true } } }`. Iterates genres in JS. 50k items × 3 genres = 150k iterations. **Loads entire user library into memory.** Rewrite with raw SQL: `SELECT unnest(genres) as genre, COUNT(*) FROM user_library JOIN media ... GROUP BY genre`. |

## `apps/backend/src/analytics/analytics-aggregation.service.ts`

| Line    | Severity    | Problem                                                    | Details                                                |
| ------- | ----------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| 23-46   | 🔴 CRITICAL | `getOverview` calls `getGenreData`                         | Inherits N+1 memory issue.                             |
| 96-126  | 🔴 CRITICAL | `getGenreAnalytics` calls `getGenreData`                   | Same.                                                  |
| 128-159 | 🔴 CRITICAL | `getActivity` calls `getActivityData`                      | Same N+1.                                              |
| 161-276 | 🔴 CRITICAL | `getCalendarYear` calls `getCalendarData`                  | Same N+1.                                              |
| 278-295 | ✅ GOOD     | `calculateLongestStreak`                                   | Correct algorithm.                                     |
| 297-336 | 🟡 MEDIUM   | `getCalendarDay` fetches recent 100 of each, filters in JS | Inefficient but limited scope. Add date-range queries. |

## `apps/backend/src/analytics/dashboard.service.ts`

| Line  | Severity | Problem                                 | Details                                                                                                                                                                  |
| ----- | -------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 10-33 | 🟢 LOW   | `getDashboard` runs 11 parallel queries | 5 `getInProgressByType` (limited to 5 each), `getRecentlyAdded` (5), `getRecentlyCompleted` (5), memories (5), journal (5), pinned collections. All limited. Acceptable. |

## `apps/backend/src/analytics/discovery.service.ts`

| Line    | Severity    | Problem                                                    | Details                    |
| ------- | ----------- | ---------------------------------------------------------- | -------------------------- |
| 126-132 | 🔴 CRITICAL | `getDiscovery` calls `getGenreData`                        | Inherits N+1 memory issue. |
| 184-268 | 🔴 CRITICAL | `getIntelligence` calls `getGenreData` + `getActivityData` | Both have N+1 issues.      |
| 328-341 | 🔴 CRITICAL | `getConstellation` calls `getGenreData`                    | Same N+1.                  |

## `apps/backend/src/analytics/insights.service.ts`

| Line | Severity    | Problem                                                | Details               |
| ---- | ----------- | ------------------------------------------------------ | --------------------- |
| 9-14 | 🔴 CRITICAL | `getInsights` calls `getActivityData` + `getGenreData` | Both have N+1 issues. |

## `apps/backend/src/analytics/streak.service.ts`

| Line  | Severity    | Problem                                                             | Details                                                                                                                                                                              |
| ----- | ----------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 60-83 | 🟠 HIGH     | `calculateCompletionStreak` calls `getActivityData` twice           | Duplicate call. Cache result.                                                                                                                                                        |
| 30-40 | 🟠 HIGH     | `calculateCurrentStreak` logic bug                                  | `days` sorted DESC (newest first). Loop expects `days[i]` to match `today - i days`. But `days` from journal only! Completion streak uses activityData (all activity). Inconsistent. |
| 9-14  | 🔴 CRITICAL | `getStreaks` calls `getJournalEntryDates` + `getActivityData` twice | Journal streak vs activity streak confusion.                                                                                                                                         |

---

# BACKEND - SEARCH MODULE

## `apps/backend/src/search/search.service.ts`

| Line    | Severity    | Problem                                     | Details                                                                                                                                                                                                          |
| ------- | ----------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 46-74   | 🔴 CRITICAL | **Unbounded memory merge in global search** | 9 parallel searches each returning up to `limit+1` (default 21) → merges up to 189 items in memory, sorts O(N log N), then slices to `limit`. No per-source limit before merge. If `limit=50`, merges 459 items. |
| 71      | 🟡 MEDIUM   | Score tie-breaking unstable                 | `all.sort((a, b) => b.score - a.score)` — when scores equal, sort order non-deterministic. Add secondary sort: `b.score - a.score \|\| a.title.localeCompare(b.title)`.                                          |
| 78      | 🟢 LOW      | Double sort for `relevance`                 | Global merge already sorts by score (line 71), `applySort` sorts again. Skip when `sort === 'relevance' \|\| !sort`.                                                                                             |
| 80-81   | 🔴 CRITICAL | **`hasMore` always false**                  | `items.length > limit` checks unsliced array, but `items` already sliced at line 72 (`items = all.slice(0, limit)`). Move `hasMore` check before slice.                                                          |
| 93      | 🟡 MEDIUM   | Cursor uses duplicate `score`               | `cursor: \`${sliced[sliced.length - 1].score}_${sliced[sliced.length - 1].id}\``— score collisions make cursor non-unique. Use unique composite cursor:`createdAt`+`id`or`updatedAt`+`id`.                       |
| 154-167 | 🟡 MEDIUM   | Facet building only reflects first page     | `buildFacets` iterates over `items` (already sliced to `limit`). Facets only reflect first page, not total result set. Build facets from full merged array `all` before slicing.                                 |
| 19      | 🟢 LOW      | Limit parsing vulnerability                 | `parseInt(dto.limit, 10)` — if `dto.limit = "50abc"`, returns `50` silently. Use `Number.isInteger(Number(dto.limit))` or class-validator `@IsInt`.                                                              |

## `apps/backend/src/search/search.repository.ts`

| Line                                                                | Severity    | Problem                                                        | Details                                                                                                                                                                       |
| ------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                                                                   | 🔴 CRITICAL | **24 `any` usages** via `eslint-disable`                       | Entire file opts out of type safety. `prismaAny()` returns `Record<string, any>`, all delegates accessed dynamically.                                                         |
| 28-30                                                               | 🔴 CRITICAL | `prismaAny()` defeats all compile-time checks                  | Every delegate access `this.prismaAny()[cfg.delegate]` is untyped. Typos fail silently at runtime.                                                                            |
| 43, 110, 185, 220, 255, 291, 327, 362, 397, 484, 499, 512, 525, 546 | 🔴 CRITICAL | 13 dynamic delegate accesses via `prismaAny()`                 | No compile-time verification.                                                                                                                                                 |
| 200, 235, 271, 307, 342, 377, 412                                   | 🟠 HIGH     | Map callbacks use `any` parameter                              | `items.map((item: any) => ...)` — no type safety on Prisma return shape.                                                                                                      |
| 44-55                                                               | 🟠 HIGH     | SearchMedia WHERE clause uses `OR` on 4 fields with `contains` | No full-text index, will scan entire table. Add PostgreSQL full-text search (`tsvector` + GIN index) or Meilisearch/Typesense.                                                |
| 55                                                                  | 🟡 MEDIUM   | `take: limit + 1` but no cursor support                        | Pagination only works for first page. Add `cursor`/`skip` support.                                                                                                            |
| 169                                                                 | 🟡 MEDIUM   | Hardcoded `+10` library score boost                            | `score: score + 10` — arbitrary constant. No configuration, no explanation. Make boost configurable.                                                                          |
| 430-449                                                             | 🟡 MEDIUM   | `recordSearch` race condition                                  | Two searches same query concurrent → both find none → both create → duplicate history entries. Use `upsert` with unique constraint on `(userId, query)`.                      |
| 474-538                                                             | 🔴 CRITICAL | `getPrefixSuggestions` makes 13+ sequential DB calls           | For each media type (9) + journal + collection + memory = 12 delegates, each `findMany` with `take: 3`. N+1 pattern. Batch into single query using `UNION` or raw SQL.        |
| 542-574                                                             | 🔴 CRITICAL | `getTrendingMedia` returns recently updated, not "trending"    | Orders by `updatedAt desc` — shows recently edited, not popular. Misleading name. Implement true trending: `(views * decay^days) + (favorites * weight) + (recent activity)`. |
| 578-634                                                             | 🔴 CRITICAL | `getFilterOptions` scans 900 rows per call, no cache           | Loads all genres/years into memory, builds sets. Runs on every filter options request. Cache results (Redis, TTL 1hr) or precompute materialized view.                        |
| 638-657                                                             | 🟡 MEDIUM   | Scoring not normalized by title length                         | "A" matches "A" → 100. "The Matrix" matches "Matrix" → 60. Normalize by title length or use TF-IDF/BM25.                                                                      |
| 659-663                                                             | 🟢 LOW      | `findMatchField` returns first match only                      | If query matches both title and description, returns `title` only. Frontend can't highlight description match. Return all matched fields as array.                            |

---

# BACKEND - MEDIA MODULE

## `apps/backend/src/media/media.service.ts`

| Line       | Severity    | Problem                                                  | Details                                                                                                                                                                                                                                                                 |
| ---------- | ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 30, 44, 63 | 🟡 MEDIUM   | `toResponse` defaults to `'movie'` for multi-type search | `params.mediaType ?? type ?? 'movie'` — if both undefined, defaults to `'movie'` incorrectly. For multi-type search, each item needs its own type. Pass type per item from repository.                                                                                  |
| 62-63      | 🔴 CRITICAL | Search response uses single `mediaType` for all items    | `repository.findMany(type, searchParams)` — if `type` undefined (global search), repository fans out to all types. But response mapping uses single `mediaType` for all items. Repository returns items with actual type; service must map each item with its own type. |

## `apps/backend/src/media/media.repository.ts`

| Line    | Severity    | Problem                                                                    | Details                                                                                                                                                                                                                                                                     |
| ------- | ----------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 78-98   | 🔴 CRITICAL | `modelMap` uses string keys → delegate names, no compile-time verification | Adding new media type requires updating map AND `MEDIA_MODELS` in slug.service. Sync issues likely. Generate from single source of truth.                                                                                                                                   |
| 137-163 | 🔴 CRITICAL | `findMany` fans out to all 20 types when `type` undefined                  | `Promise.all` of 20 delegates, each `executeFindMany` with `take: limit+1`. Merges up to 420 rows in memory, sorts in JS. No per-source limit.                                                                                                                              |
| 153-161 | 🔴 CRITICAL | **JS sort comparator bugs**                                                | 1) `valA`/`valB` can be `null` → `String(null)` = `"null"` sorts before `"a"`. 2) Date comparison via ISO string works but `releaseYear` (number) vs `createdAt` (Date) mixed. 3) Not stable for equal values (uses `id` tiebreaker but only when string comparison equal). |
| 200-226 | 🟡 MEDIUM   | `findRelated` uses only genres (first 3) + language                        | Very basic. No tag overlap, creator overlap, franchise, similar users. Expand to multi-signal.                                                                                                                                                                              |

## `apps/backend/src/media/slug.service.ts`

| Line  | Severity    | Problem                                               | Details                                                                                                                                                                                                                               |
| ----- | ----------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 48-56 | 🔴 CRITICAL | `ensureUnique` busy-loop — N DB queries per collision | `while (await this.slugExists(slug, model)) { slug = \`${baseSlug}-${counter}\`; counter++; }`— if 1000 collisions, 1000 DB queries. Use`findMany`with`startsWith` to get all existing suffixes in one query, compute next available. |
| 58-69 | 🔴 CRITICAL | `slugExists` uses `prismaAny` with dynamic delegate   | Same type safety issue as search repo. `prismaAny[model]` — no compile-time check.                                                                                                                                                    |
| 88-94 | 🟡 MEDIUM   | Extension trust — `malicious.php.jpg` accepted        | `resolveExtension` trusts `originalName` extension. User uploads `malicious.php.jpg` → `.jpg` accepted. Cross-check `mimeType` vs extension using `MIME_TO_EXT` map.                                                                  |

---

# BACKEND - USERS MODULE

## `apps/backend/src/users/users.service.ts`

| Line    | Severity    | Problem                                                 | Details                                                                                                                                                                                          |
| ------- | ----------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 50-75   | 🟢 LOW      | `updateProfile` fetches profile twice                   | Line 51 (`getProfile`) + line 54 (`updateProfile`). Could combine.                                                                                                                               |
| 60-73   | 🟡 MEDIUM   | Audit log + event publish not transactional             | If event publish fails, audit log already written. If audit fails, event published. Inconsistent state. Use transactional outbox pattern or accept eventual consistency with reconciliation job. |
| 159     | 🔴 CRITICAL | `sessionTokenMatches` — verify constant-time comparison | Comment says "session.token holds SHA-256 hash, raw cookie hashed before comparison in constant time." — Verify `sessionTokenMatches` implements `crypto.timingSafeEqual`. If not, fix.          |
| 198-206 | 🟡 MEDIUM   | `diff` only checks keys in `next`, not removed keys     | If `previous = {a:1, b:2}`, `next = {a:1}`, `b` removal not detected. Iterate union of keys.                                                                                                     |

## `apps/backend/src/users/users.repository.ts`

| Line    | Severity  | Problem                                                                 | Details                                                                                                                                                                                                                           |
| ------- | --------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 22-28   | 🟡 MEDIUM | `save` uses `update` with `Prisma.UserUncheckedUpdateInput`             | Bypasses Prisma validation. If `entity` has invalid fields, runtime error. Use `UserUpdateInput` or validate before save.                                                                                                         |
| 83-93   | 🟢 LOW    | `findSessionsByUserId` filters `status: 'ACTIVE'` and `expiresAt > now` | Good. But `deletedAt: null` also checked. Session cleanup relies on this query. Add scheduled job to hard-delete expired sessions.                                                                                                |
| 101-106 | 🟢 LOW    | `revokeSession` race: session deleted between check and update          | Uses `updateMany` with `where: { id: sessionId, userId }`. Caller checks `findSessionByIdAndUserId` first. Race: session deleted between check and update. Use `update` which throws if not found, or check `count` after update. |

## `apps/backend/src/users/services/avatar.service.ts`

| Line  | Severity  | Problem                                                                                           | Details                                                                                                                                                                                            |
| ----- | --------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 32-47 | 🟡 MEDIUM | Validation checks `file.size` AND `file.buffer.length`                                            | Both should match but redundant. If `file.size` from multipart header, can be spoofed. `buffer.length` is actual. Trust buffer. Remove `file.size` check.                                          |
| 54-56 | 🟡 MEDIUM | Path uses `avatars/${userId}/${uuid}${ext}` — `ext` from `resolveExtension` trusts `originalName` | Same issue as slug.service. Validate extension matches MIME.                                                                                                                                       |
| 64-65 | 🟡 MEDIUM | Upload then update user avatar — orphan risk                                                      | If upload succeeds but DB update fails, orphaned file in storage. No cleanup. Use transactional outbox: write DB first with pending path, then upload, then confirm. Or accept orphan cleanup job. |
| 67-69 | 🟢 LOW    | Old avatar deletion is best-effort (swallowed catch)                                              | If storage delete fails, old file leaks. Log error for monitoring. Add cleanup job for orphans.                                                                                                    |

## `apps/backend/src/users/services/preferences.service.ts`

| Line  | Severity    | Problem                                                     | Details                                                                                                                                                                                                                                |
| ----- | ----------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 36    | 🔴 CRITICAL | **Shallow merge loses nested objects**                      | `const merged = { ...this.fromUser(existing), ...dto }` — nested objects (e.g., `defaultFilters`) completely replaced, not deep-merged. Implement deep merge for nested fields, or document that `defaultFilters` is full replacement. |
| 71-75 | 🟡 MEDIUM   | `defaultFilters` validation only checks it's a plain object | No schema validation for filter keys/values. Accepts any JSON. Define `DefaultFiltersSchema` with allowed keys.                                                                                                                        |
| 80-85 | 🟢 LOW      | `fromUser` returns empty object if preferences null/invalid | Silently resets to defaults. No migration for schema changes. Add version field to preferences JSON for migrations.                                                                                                                    |

## `apps/backend/src/users/services/privacy.service.ts`

| Line | Severity    | Problem                                       | Details                                                                                                                                                                                                                       |
| ---- | ----------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9    | 🔴 CRITICAL | **Visibility enum mismatch with collections** | `VISIBILITY_VALUES` = `public`, `followers`, `private` (lowercase). But collections DTO uses `PRIVATE`, `PUBLIC`, `UNLISTED`, `FOLLOWERS_ONLY` (uppercase, different values). Will cause validation failures. **Must align**. |

## `apps/backend/src/users/services/profile.service.ts`

| Line    | Severity  | Problem                                             | Details                                                                                                                                                                                            |
| ------- | --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 67-79   | 🟠 HIGH   | Username normalization mangles instead of rejecting | `lowered.replace(/[^a-z0-9_]+/g, '_')` — "user@name" → "user_name". "user!!name" → "user_name". Collisions likely. Reject invalid chars: "username can only contain letters, numbers, underscore". |
| 98-106  | 🟡 MEDIUM | Website validation regex accepts invalid URLs       | `WEBSITE_PATTERN` allows `http://invalid` (no TLD), `example.com` (no scheme). Use `new URL(dto.website)` with try/catch.                                                                          |
| 108-114 | 🟡 MEDIUM | Timezone validation regex accepts invalid zones     | `^[A-Za-z_]+(\/[A-Za-z_-]+)?$` accepts `Invalid/Timezone`. Validate against `Intl.DateTimeFormat().resolvedOptions().timeZone` or use `tzdb` list.                                                 |
| 140-148 | 🟡 MEDIUM | Cover image uses same weak URL regex                | Same issue.                                                                                                                                                                                        |

## `apps/backend/src/users/services/user-audit-log.service.ts`

| Line  | Severity    | Problem                                             | Details                                                                                                                                                                                             |
| ----- | ----------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 38-50 | 🔴 CRITICAL | **No size limit on audit JSON** — bloat risk        | `logChange` writes full `previousValue` and `newValue` as JSON. Large objects (full user profile) bloat audit log table. Add size check: `JSON.stringify(val).length < MAX_AUDIT_SIZE` or truncate. |
| 44-46 | 🟡 MEDIUM   | Casts to `Prisma.InputJsonValue` without validation | If value contains `Date`, `Set`, `Map`, `undefined`, Prisma throws at runtime. Sanitize: `JSON.parse(JSON.stringify(val))`.                                                                         |

---

# BACKEND - COLLECTIONS MODULE

## `apps/backend/src/collections/collections.service.ts`

| Line    | Severity    | Problem                                                                   | Details                                                                                                                                                                               |
| ------- | ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | 🔴 CRITICAL | **`eslint-disable @typescript-eslint/no-explicit-any`** — 15 `any` usages | Type safety gaps. Migrate to typed delegates like `collection-statistics.service.ts`.                                                                                                 |
| 33-35   | 🟡 MEDIUM   | `create` slug race condition                                              | Two requests same name → both pass check → one fails on unique constraint. `ConflictException` thrown by Prisma not caught. Catch `P2002` in repository or use `upsert`-style.        |
| 74-82   | 🔴 CRITICAL | **Smart collection evaluation on every `findOne`** — no caching           | `smartCollection.evaluate(userId, rules)` runs full library scan. No caching. Expensive for frequent reads. Cache evaluated results (Redis, TTL 5-15min) or materialize periodically. |
| 235-238 | 🟡 MEDIUM   | `getItemCount` uses `(this.repository as any).prisma`                     | Breaks encapsulation. Add `countCollectionItems(collectionId)` method to repository.                                                                                                  |
| 247-266 | 🟡 MEDIUM   | `resolveMediaType` checks 14+ properties sequentially                     | Fragile. If Prisma include changes, breaks. Store `mediaType` on `CollectionItem` model, or use `Object.keys(item).find(k => MEDIA_CONFIG[k])`.                                       |
| 268-281 | 🔴 CRITICAL | `toItemResponse` uses dynamic property access                             | `const media = item[mediaType] ?? {};` — `any` usage. No type safety. Define `CollectionItemWithMedia` interface with discriminated union.                                            |

## `apps/backend/src/collections/collections.repository.ts`

| Line    | Severity    | Problem                                                                   | Details                                                                                                                                                                                                                                                                                                                       |
| ------- | ----------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | 🔴 CRITICAL | **`eslint-disable @typescript-eslint/no-explicit-any`** — 29 `any` usages | Entire file untyped. Full typed delegate migration needed.                                                                                                                                                                                                                                                                    |
| 31-33   | 🔴 CRITICAL | `prismaAny()` same as search repo                                         | All delegate access dynamic, no compile-time safety.                                                                                                                                                                                                                                                                          |
| 70-84   | 🟠 HIGH     | `findCollectionById` includes 7 media types hardcoded                     | Adding new media type requires updating here AND `MEDIA_CONFIG` AND `media.repository.ts` modelMap. Centralize media type list. Generate includes dynamically from config.                                                                                                                                                    |
| 152-189 | 🔴 CRITICAL | **`addItem` position race**                                               | Does `findUnique` on collection (line 162) then `findFirst` for max position (line 166) then `create`. Two concurrent adds → both get same `maxItem.position` → duplicate position. Unique constraint on `(collectionId, position)`? Not in schema. Use atomic increment or `SELECT MAX(position) FOR UPDATE` in transaction. |
| 172-188 | 🟡 MEDIUM   | `create` catches all errors and returns null                              | Unique constraint violation returns null → service throws `ConflictException`. But other errors (DB down) also return null → misleading `ConflictException`. Check error code: `if (error.code === 'P2002') return null; throw error;`.                                                                                       |
| 202-246 | 🟠 HIGH     | `reorderItems` updates positions sequentially in loop (N queries)         | No gap-filling — positions become 0,1,2... gaps removed. Batch update with `updateMany` using `CASE` statement or raw SQL for single query.                                                                                                                                                                                   |
| 354-395 | 🔴 CRITICAL | `findLibraryItems` fans out to 8 user library delegates                   | Each `findMany` with `take: limit` (default 100). Returns up to 800 items, no global limit enforcement. Apply global `limit` across all types: `take: Math.ceil(limit / types.length) + 1`.                                                                                                                                   |
| 373-380 | 🟢 LOW      | Rating filter operators not validated                                     | `ratingOperator` not validated. Invalid operator falls to `else where.rating = filters.rating` (exact match). Validate against allowed set.                                                                                                                                                                                   |

## `apps/backend/src/collections/collection-statistics.service.ts`

| Line  | Severity    | Problem                                                                       | Details                                                                                                                                                                                       |
| ----- | ----------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 42-59 | 🔴 CRITICAL | **N+1 queries** (up to 8 per collection)                                      | For EACH media type (up to 8), does separate `findMany` query. Batch into single query per delegate type is already done (one per type). Could use raw SQL `UNION ALL` for single round-trip. |
| 47-48 | 🟡 MEDIUM   | Accesses private `prisma` via cast                                            | `const prisma = (this.repository as unknown as { prisma: ... }).prisma` — breaks encapsulation. Add `getUserLibraryDelegate(type)` method to repository.                                      |
| 54-55 | 🟡 MEDIUM   | Unsafe cast: `const item = userItem as { status: string; favorite: boolean }` | Prisma returns full object. Should type properly. Define `UserLibraryItem` interface.                                                                                                         |
| 71-80 | 🔴 CRITICAL | **`MEDIA_TYPE_MAP` duplicates `MEDIA_CONFIG` from repository**                | Two sources of truth. Sync risk. Export single `MEDIA_TYPE_CONFIG` from shared location.                                                                                                      |

## `apps/backend/src/collections/smart-collection.service.ts`

| Line  | Severity    | Problem                                                                 | Details                                                                                                                                                                                                                                          |
| ----- | ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 21-38 | 🔴 CRITICAL | **`matchMode: 'ANY'` ignored** — OR logic not implemented               | `_matchMode = rules.matchMode ?? 'ALL'` (line 22) but never used! All rules combined with AND (filters object merged). `matchMode: 'ANY'` (OR logic) not implemented.                                                                            |
| 24-27 | 🟡 MEDIUM   | `mediaType` and `hasReview` rules skipped in filter building            | `mediaType` not translated to filter. `hasReview` post-filtered later. Add `mediaType` to filters (but `findLibraryItems` doesn't support it). Need to filter post-query or extend repository.                                                   |
| 43-53 | 🟡 MEDIUM   | Post-filter for `hasReview` loads ALL matching items then filters in JS | If 1000 items match status/rating, all loaded, then filtered. No `take` limit in `findLibraryItems` (default 100). Add `hasReview` to repository query if possible, or limit results.                                                            |
| 55-69 | 🟡 MEDIUM   | Mapping uses dynamic property access                                    | `(item as LibraryItemWithMedia)[mediaType]`, `(item as ...)[\`${mediaType}Id\`]` — fragile. Define proper typed interface for library item with discriminated union.                                                                             |
| 72-80 | 🔴 CRITICAL | **`resolveRatingValue` converts "8" → 16 (8\*2)**                       | But if user enters "4.5" (0.5-5 scale), becomes 9. If user enters "9" (1-10 scale), becomes 18 (invalid). No scale detection. Accept both scales: if value > 10, assume 1-10; else assume 0.5-5 and multiply. Or require explicit scale in rule. |

## `apps/backend/src/collections/dto/collections.dto.ts`

| Line  | Severity    | Problem                                                                    | Details                                                                                                                                                                                        |
| ----- | ----------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15    | 🔴 CRITICAL | **Visibility enum mismatch with privacy service**                          | `VISIBILITY_OPTIONS` = `PRIVATE`, `PUBLIC`, `UNLISTED`, `FOLLOWERS_ONLY`. But `privacy.service.ts` uses `public`, `followers`, `private` (lowercase, no `UNLISTED`). Inconsistent! Unify enum. |
| 18-19 | 🟡 MEDIUM   | `SMART_RULE_OPERATORS` includes `contains` but not implemented             | Smart collection service only handles `equals`, `not_equals`, `gte`, `lte`, `gt`, `lt`. `contains` ignored. Implement `contains` for string fields or remove from DTO.                         |
| 31    | 🟡 MEDIUM   | `SmartCollectionRuleDto.value: unknown` — no validation per field/operator | `rating` with `contains` operator makes no sense. Add conditional validation per field/operator combination.                                                                                   |

---

# BACKEND - JOURNAL MODULE

## `apps/backend/src/journal/journal.repository.ts`

| Line                                | Severity    | Problem                                                                   | Details                                                                                                              |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1                                   | 🔴 CRITICAL | **`eslint-disable @typescript-eslint/no-explicit-any`** — 29 `any` usages | Remove blanket disable; use typed delegates from `prisma-delegates.ts`.                                              |
| 15-17                               | 🔴 CRITICAL | `prismaAny()` returns `Record<string, any>`                               | Completely erases Prisma types. Replace with `asHost(this.prisma)` + `delegate()` from `common/prisma-delegates.ts`. |
| 31, 35, 43-47, 54-59, 66, 70-71, 81 | 🔴 CRITICAL | All 5 entity types use `prismaAny()`                                      | Migrate each entity to typed delegate access.                                                                        |
| 81                                  | 🟠 HIGH     | `entries.map((e: any) => e.createdAt)`                                    | Map callback uses `any`. Type the callback parameter.                                                                |
| 137-160                             | 🟠 HIGH     | Transaction uses manual casting                                           | `tx as unknown as { memory: { deleteMany... } }` — use typed transaction extension or proper delegate typing.        |
| 167-176                             | 🟠 HIGH     | `addMemoryMedia` uses dynamic property access `[mediaField]`              | Use `MEDIA_TYPE_CONFIGS` from `media-types.ts` for compile-time validation.                                          |
| 199-203                             | 🟡 MEDIUM   | `findTimelineEvents` uses `Record<string, any>` for where clause          | Use `Prisma.TimelineEventWhereInput`.                                                                                |
| 214-216                             | 🟡 MEDIUM   | `createTimelineEvent` metadata typed as `any`                             | Use `Prisma.InputJsonValue`.                                                                                         |
| 235-246                             | 🟠 HIGH     | `createQuote` dynamic `[mediaField]` assignment                           | Use `mediaTypeConfig(type).mediaIdField`.                                                                            |
| 291-320                             | 🟠 HIGH     | `createHighlight` same dynamic mediaField issue                           | Use typed config.                                                                                                    |

## `apps/backend/src/journal/journal.service.ts`

| Line                   | Severity    | Problem                                                                         | Details                                                                          |
| ---------------------- | ----------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1                      | 🔴 CRITICAL | **`eslint-disable @typescript-eslint/no-explicit-any`** — 22 `any` usages       | Remove; use typed repository methods.                                            |
| 71, 174, 237, 284, 355 | 🟠 HIGH     | `.map((e: any) => ...)` map callbacks use `any`                                 | Type as proper entity interfaces.                                                |
| 84-91                  | 🟠 HIGH     | `data: Record<string, any>` for update — loses field validation                 | Use typed `UpdateJournalEntryDto` directly or `Partial<JournalEntry>`.           |
| 131                    | 🔴 CRITICAL | Breaks encapsulation: `(this.repository as any).prismaAny()`                    | Add `findLibraryMediaId` to repository interface.                                |
| 133-146                | 🟡 MEDIUM   | `MEDIA_LOOKUP` constant not imported from `common/media-types.ts`               | Uses different naming. Import `MEDIA_TYPE_CONFIGS` from `common/media-types.ts`. |
| 252-253                | 🟡 MEDIUM   | `libItem[\`${mediaType}Id\`]` — dynamic property access                         | Use `mediaTypeConfig(mediaType).mediaIdField`.                                   |
| 398-420                | 🔴 CRITICAL | `findLibraryMediaId` private method uses `(this.repository as any).prismaAny()` | Move to repository with typed delegate.                                          |

---

# BACKEND - NOTIFICATIONS MODULE

## `apps/backend/src/notifications/notifications.service.ts`

| Line    | Severity    | Problem                                                                   | Details                                                                                                  |
| ------- | ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 63      | 🟡 MEDIUM   | `n as NotificationRow` — cast needed because repository returns `unknown` | Fix repository to return typed `NotificationRow[]`.                                                      |
| 74      | 🔴 CRITICAL | `notification!` — non-null assertion after `findById` could be null       | Handle null case properly.                                                                               |
| 105-118 | 🟡 MEDIUM   | `updatePreferences` allows arbitrary keys                                 | `PreferenceUpdateData` with `[key: string]: unknown`. Use `Partial<NotificationPreferencesDto>` instead. |

## `apps/backend/src/notifications/notifications.repository.ts`

| Line  | Severity    | Problem                                                                        | Details                                                           |
| ----- | ----------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 59-77 | 🟡 MEDIUM   | Boundary casts use `as unknown as` instead of `asRow()`                        | Use `asRow<NotificationRow>(created)` from `prisma-delegates.ts`. |
| 65    | 🔴 CRITICAL | `(notification as unknown as NotificationRow).userId` — unsafe property access | Type the row first, then access.                                  |

## `apps/backend/src/notifications/notification-queue.service.ts`

| Line  | Severity  | Problem                                          | Details                                                      |
| ----- | --------- | ------------------------------------------------ | ------------------------------------------------------------ |
| 39-44 | 🟡 MEDIUM | `scheduleWrappedGeneration` — no idempotency key | Could schedule duplicates. Add `jobId` based on userId+year. |

## `apps/backend/src/notifications/reminder.service.ts`

| Line  | Severity  | Problem                                                               | Details                                            |
| ----- | --------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| 20-22 | 🟡 MEDIUM | Three sequential `getInProgressByType` calls — N+1 for reminder types | Use `Promise.all` to parallelize.                  |
| 43    | 🟡 MEDIUM | `(i as { movie?: MediaWithTitle }).movie?.title` — unsafe cast        | Type the return of `getInProgressByType` properly. |
| 31-36 | 🟡 MEDIUM | Creates notification directly via repository — bypasses queue         | Use `NotificationQueueService` for consistency.    |

---

# BACKEND - PROGRESS MODULE

## `apps/backend/src/progress/progress.service.ts`

| Line    | Severity    | Problem                                                                                     | Details                                                              |
| ------- | ----------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 144-176 | 🔴 CRITICAL | `getProgress` duplicates mediaId resolution and calculation logic from `update`             | Extract shared `resolveMediaIdAndCalculate()` method.                |
| 178-180 | 🔴 CRITICAL | **`complete` calls `update` with progress=100 but `update` recalculates**                   | `complete` should override all progress fields or use separate path. |
| 182-226 | 🔴 CRITICAL | `reset` duplicates mediaId resolution and calculation                                       | Extract shared logic.                                                |
| 228-246 | 🟠 HIGH     | `getRecent` sorts in memory after fetching from all 8 tables                                | Consider DB-level UNION or materialized view for scale.              |
| 232     | 🟡 MEDIUM   | `(item as LibraryItemWithMedia)[mediaType]` — unsafe dynamic access                         | Use `mediaTypeConfig(mediaType).mediaIdField`.                       |
| 248-264 | 🔴 CRITICAL | `emitEvents` logic bug: `progress > 0 && wasZero` emits `Started` but `progress` is clamped | Should use `isStarting` flag instead of re-checking.                 |

## `apps/backend/src/progress/progress.repository.ts`

| Line  | Severity    | Problem                                                         | Details                                                                            |
| ----- | ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 73-79 | 🔴 CRITICAL | **`findLibraryItem` missing `userId` filter** — SECURITY        | Add `userId` to where clause.                                                      |
| 81-99 | 🔴 CRITICAL | **`fetchMediaTotals` returns `emptyTotals()` on missing media** | Should throw `NotFoundException` — media must exist if library item references it. |

## `apps/backend/src/progress/progress-calculation.service.ts`

| Line    | Severity    | Problem                                                              | Details                                                                                    |
| ------- | ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 86-93   | 🔴 CRITICAL | **`calculateMovie` ignores `hoursSpent`** — only uses `minutesSpent` | Should combine: `totalMinutes = hoursSpent * 60 + minutesSpent`.                           |
| 95-102  | 🔴 CRITICAL | **TV shows ignore `currentSeason`** — progress = episode only        | For TV shows, progress should be `(season-1)*episodesPerSeason + episode` / totalEpisodes. |
| 104-115 | 🔴 CRITICAL | **Books use `totalLessons` (course field)** instead of `pageCount`   | Books use `pageCount` or `totalChapters`; `totalLessons` is wrong field.                   |
| 117-120 | 🟡 MEDIUM   | Games only use manual `progress` field, no auto-calc                 | Could use `hoursSpent` vs estimated playtime if available.                                 |
| 149-154 | 🔴 CRITICAL | **Remaining episodes percentage-based** not current-episode-based    | Should be `totalEpisodes - currentEpisode`.                                                |
| 156-161 | 🔴 CRITICAL | **Remaining books percentage-based** not current-page-based          | Should be `pageCount - currentPage`.                                                       |
| 163-168 | 🔴 CRITICAL | **Remaining tracks returns `episodes` field** but should be `tracks` | Field name mismatch.                                                                       |

---

# BACKEND - INTERACTIONS MODULE

## `apps/backend/src/interaction/interaction.service.ts`

| Line    | Severity    | Problem                                                                                 | Details                                                     |
| ------- | ----------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 158-159 | 🔴 CRITICAL | `toggleFavorite` returns `favoritedAt: new Date().toISOString()` but DB has `updatedAt` | Should use `updated.updatedAt` from DB.                     |
| 248-274 | 🔴 CRITICAL | `updateReview` mutates `review` object directly                                         | Should create new object to avoid mutating cached metadata. |
| 312-338 | 🟠 HIGH     | `listReviews` N+8 queries, in-memory merge                                              | Consider DB view.                                           |
| 320     | 🟡 MEDIUM   | `(item as LibraryItemWithMedia)[mediaType]` — unsafe dynamic access                     | Use `mediaTypeConfig()`.                                    |

## `apps/backend/src/interaction/interaction.repository.ts`

| Line  | Severity    | Problem                                                  | Details                       |
| ----- | ----------- | -------------------------------------------------------- | ----------------------------- |
| 64-74 | 🔴 CRITICAL | **`findLibraryItem` missing `userId` filter** — SECURITY | Add `userId` to where clause. |

---

# BACKEND - CORE/COMMON

## `apps/backend/src/common/correlation/correlation-id.helper.ts`

| Line | Severity    | Problem                                    | Details                                                                                                                                                   |
| ---- | ----------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -    | 🔴 CRITICAL | **Missing `AsyncLocalStorage` middleware** | Correlation IDs don't propagate through async boundaries. Add `CorrelationIdMiddleware` that sets `request['id']` and propagates via `AsyncLocalStorage`. |

## `apps/backend/src/common/filters/all-exceptions.filter.ts`

| Line    | Severity  | Problem                                                      | Details                                                           |
| ------- | --------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| 138-143 | 🟡 MEDIUM | Default Prisma error exposes raw code `PRISMA_${error.code}` | Should not expose raw Prisma codes; use generic `INTERNAL_ERROR`. |

## `apps/backend/src/common/retry/retry.helper.ts`

| Line | Severity  | Problem                                                                 | Details                                                                                                             |
| ---- | --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 12   | 🟡 MEDIUM | Default policy retries ALL errors (should only retry network/transient) | `policy.retryable?.(error) ?? true` — defaults to retry all. Should default to retry only network/transient errors. |

---

# FRONTEND - ROUTES

## `src/routes/app.wrapped.tsx` (Viral Loop Page)

| Line    | Severity    | Problem                                                                       | Details                                                                                                                                                                                                                                             |
| ------- | ----------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 30-70   | 🔴 CRITICAL | **`html2canvas` loaded from CDN via dynamic script injection**                | CSP violation (no `script-src 'self' cdnjs.cloudflare.com`), no integrity verification on first load, no fallback if CDN blocked. Bundle `html2canvas` via npm, import directly; add CSP `script-src 'self'` + hash/nonce; provide canvas fallback. |
| 30-49   | 🟠 HIGH     | `downloadAsImage` creates global `window.html2canvas` pollution               | Race condition if user clicks Download twice before script loads. Use dynamic `import('html2canvas')` with singleton promise; debounce clicks.                                                                                                      |
| 52      | 🟡 MEDIUM   | `getElementById("avuno-wrapped-root")` fragile selector                       | Breaks if ID changes or multiple instances. Use `ref` on root element passed to capture function.                                                                                                                                                   |
| 155     | 🔴 CRITICAL | `snap-y snap-mandatory` on main container                                     | Breaks Find in Page, anchor links, screen reader virtual cursor. Use `scroll-snap-type: y mandatory` only on inner sections; provide "scroll to top" button; test with screen readers.                                                              |
| 191-193 | 🟡 MEDIUM   | `useScroll`/`useTransform` per slide — no cleanup, no `will-change`           | Runs on every scroll frame, may cause jank on low-end. Add `will-change: transform, opacity`; consider `useReducedMotion` guard.                                                                                                                    |
| 220-226 | 🟢 LOW      | Inline `style` with template literal `radial-gradient(...)`                   | Re-created every render, defeats style recalc caching. Move to CSS class with CSS variable for accent color.                                                                                                                                        |
| 280-286 | 🟢 LOW      | `navigator.share` called without `navigator.canShare` check                   | May throw on unsupported browsers. Guard with `if (navigator.canShare && navigator.canShare({...}))`.                                                                                                                                               |
| 348-355 | 🟢 LOW      | `<CountUp>` inside `motion.div` with `initial/whileInView` — double animation | Disable CountUp animation when Framer handles entrance; or use Framer `useAnimation` to drive count.                                                                                                                                                |
| 371-379 | 🟡 MEDIUM   | Progress dots use inline `style` — no semantic meaning                        | Use `<ol>`/`<li>` with `aria-current="step"`; hide visually but keep accessible.                                                                                                                                                                    |

## `src/routes/auth.tsx` (First Impression - 666 lines)

| Line    | Severity    | Problem                                                                            | Details                                                                                                                                                                 |
| ------- | ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 82      | 🔴 CRITICAL | **`AuthStage` 766-line WebGL/Canvas on auth page**                                 | Mobile battery drain, 50KB gzipped first page. Code-split `AuthStage`; reduce mobile battery drain.                                                                     |
| 86-87   | 🔴 CRITICAL | `AuthStage` infinite animations — no `prefers-reduced-motion` guard on canvas      | `ParticleField` only checks in `useEffect` — add `if (reduced) return null` at component top.                                                                           |
| 183-235 | 🟠 HIGH     | Three massive `motion.div` aura layers with `repeat: Infinity`, `duration: 14-20s` | GPU memory pressure, `will-change: transform` not set. Add `will-change: transform, opacity`; reduce particle count on mobile; use Canvas for better perf.              |
| 349-376 | 🔴 CRITICAL | **Google OAuth without PKCE/state**                                                | `window.location.href = \`${API_BASE_URL}/auth/google\``— no PKCE, no`state`. Implement PKCE flow; store `code_verifier`in`sessionStorage`; verify `state` on callback. |
| 553-642 | 🟡 MEDIUM   | `PremiumButton` infinite `boxShadow` pulse on idle                                 | `whileHover`/`whileTap` on `motion.button` re-renders on every hover. Move variants to `motion.ts` constants; use `useReducedMotion` to disable pulse animation.        |

## `src/routes/auth.forgot-password.tsx`

| Line | Severity    | Problem                                                            | Details                                                                                |
| ---- | ----------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 47   | 🔴 CRITICAL | `focus:outline-none focus:border-white/20` — removes focus outline | Fails WCAG 2.4.7 Focus Visible. Use `focus-visible:ring-2 focus-visible:ring-primary`. |

## `src/routes/auth.reset-password.tsx`

| Line | Severity    | Problem                                                           | Details                                                                |
| ---- | ----------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 88   | 🔴 CRITICAL | `outline-none focus:border-white/25` — same focus outline removal | Fails WCAG 2.4.7.                                                      |
| 121  | 🟡 MEDIUM   | `disabled:opacity-40` — low contrast disabled button              | May not meet 4.5:1. Increase opacity or use distinct disabled styling. |

## `src/routes/app.index.tsx` (Dashboard - 513 lines)

| Line    | Severity    | Problem                                                                | Details                                                                                                                                        |
| ------- | ----------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 157-436 | 🔴 CRITICAL | **25 `ErrorBoundary` wrappers** — React 18 concurrent issues, overhead | Consolidate: wrap logical sections (e.g., "DashboardWidgets", "MemorySection") instead of per-component.                                       |
| 88-113  | 🟡 MEDIUM   | Hardcoded skeleton heights (`h-[520px]`, `h-24`, etc.)                 | Layout shift when real content loads with different dimensions. Use aspect-ratio boxes or CSS grid with `minmax`.                              |
| 85-88   | 🔴 CRITICAL | `.flatMap((p) => p.data)` + `adaptLibraryItem` runs every render       | Creates new array every render; `adaptLibraryItem` runs on every item every render. Memoize with `useMemo`; or adapt in query `select` option. |
| 331-356 | 🟡 MEDIUM   | `LivingStats` inside `PremiumGlass` with `interactive` + `glow`        | Re-renders on every pointer move due to `PremiumGlass` reflection tracking. `LivingStats` should be memoized.                                  |
| 365-395 | 🟡 MEDIUM   | `FeaturedCollections` `Collage` `node` prop returns JSX inside map     | Not memoized, recreates on every render. Extract to component with `React.memo`; pass data only.                                               |

## `src/routes/app.media.$id.tsx` (Media Detail - 227 lines)

| Line    | Severity    | Problem                                                            | Details                                                                                             |
| ------- | ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 104-226 | 🔴 CRITICAL | **22 components mount at once** — no lazy loading, ~3s TTI         | Wrap each `Chapter` in `React.lazy` + `Suspense`; or use `useInView` to mount only visible chapter. |
| 202-220 | 🔴 CRITICAL | Chapter 6 collapsible but still mounts (no `AnimatePresence` exit) | Use `AnimatePresence` with `mode="wait"`; only render when open.                                    |

## `src/routes/app.search.tsx`

| Line | Severity    | Problem                                                           | Details                                                                                                                 |
| ---- | ----------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 8-15 | 🔴 CRITICAL | **Dispatches synthetic `keydown` event** to trigger global search | Fragile, depends on global listener. Use context/state to open search modal directly; remove synthetic event.           |
| 11   | 🟡 MEDIUM   | `navigator.userAgent` sniffing for Mac                            | Unreliable, breaks on iPad/iPhone with external keyboard. Use `navigator.platform` or check `event.metaKey` at runtime. |
| 13   | 🟡 MEDIUM   | `new KeyboardEvent("keydown", ...)` — no `bubbles: true`          | May not reach global listener. Add `bubbles: true, cancelable: true`.                                                   |

## `src/routes/app.library.index.tsx` (297 lines)

| Line    | Severity    | Problem                                                          | Details                                                                                                                                       |
| ------- | ----------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 42-56   | 🟡 MEDIUM   | 5 parallel `useInfiniteQuery` calls — all enabled by `!!user`    | Waterfall not needed but each creates separate query key. Use `useQueries` (TanStack Query v5) for parallel execution with single subscriber. |
| 85-88   | 🔴 CRITICAL | `.flatMap((p) => p.data)` + `adaptLibraryItem` runs every render | No memoization. Memoize with `useMemo`; or adapt in query `select` option.                                                                    |
| 160-166 | 🔴 CRITICAL | Horizontal `snap-x snap-mandatory`                               | Same accessibility issues as Wrapped page. Add scroll buttons; keyboard navigation.                                                           |
| 239-245 | 🔴 CRITICAL | `recentlyAdded` horizontal scroll — same                         | As above.                                                                                                                                     |

## `src/routes/app.library.$kind.tsx` (82 lines)

| Line  | Severity  | Problem                                        | Details                                                                                             |
| ----- | --------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 70-76 | 🟡 MEDIUM | `cascade(i)` delay capped at 8 items (`cap=8`) | Grid can have 30+ items; items 9+ have same delay. Increase cap or use `staggerChildren` on parent. |

## `src/routes/app.journal.tsx` (385 lines)

| Line    | Severity    | Problem                                                                     | Details                                                                                                                   |
| ------- | ----------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 60-76   | 🟡 MEDIUM   | Draft auto-save to localStorage debounced at 1s                             | No cleanup on unmount if `journalText` changes rapidly. Use `useRef` for timeout; clear on unmount.                       |
| 126-133 | 🔴 CRITICAL | `useMemo` for `entries` re-adapts all entries on every `journalData` change | `journalData` is new array reference from React Query. Use `select` in `useQuery` to adapt once; or `queryKey` stability. |
| 144-174 | 🟡 MEDIUM   | `moodTimeline` complex computation every render                             | `MOOD_COLORS` object recreated. Move to module constant; memoize.                                                         |
| 303-358 | 🔴 CRITICAL | Statistics section recomputes word counts for all entries every render      | Memoize `totalWords` in `useMemo` with `entries` dep.                                                                     |
| 360-369 | 🟡 MEDIUM   | `favoriteEntries` sorts all entries every render                            | Memoize.                                                                                                                  |

## `src/routes/app.calendar.tsx` (320 lines)

| Line    | Severity  | Problem                                                     | Details                                                                                                                                          |
| ------- | --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 13-14   | 🟢 LOW    | Dead code: `CALENDAR_YEAR` and `MEDIA` unused               | Remove.                                                                                                                                          |
| 63-71   | 🟡 MEDIUM | Multiple `useState` for year/month/day — no URL sync        | Refresh loses state. Use TanStack Router search params for `year`, `month`, `day`.                                                               |
| 111-137 | 🟠 HIGH   | `dailyMemoryItems` uses `MEDIA` array (empty!) for fallback | `dayData` may have items but `typeIcons` only covers 7 types. Remove dead `MEDIA` fallback; handle missing types gracefully.                     |
| 139-199 | 🟡 MEDIUM | Seasonal background full-screen transition on month change  | `fixed inset-0 -z-10` with `transition-colors duration-1000` — may cause paint thrashing. Use `will-change: background` or swap class instantly. |

---

# FRONTEND - HOOKS

## `src/hooks/use-auth.ts` (67 lines)

| Line  | Severity    | Problem                                                         | Details                                                                                                                                                                       |
| ----- | ----------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20-24 | 🔴 CRITICAL | **Over-invalidation** — `useLogin` invalidates 8+ keys on login | `queryClient.invalidateQueries({ queryKey: queryKeys.library.all })` + `analytics.all` + `search.all`. Invalidate only `queryKeys.auth.me()`; library data fetched on demand. |
| 38-43 | 🟡 MEDIUM   | `useLogout` calls `queryClient.clear()` — nuclear option        | Clears ALL cached data including non-auth. Use `queryClient.removeQueries({ queryKey: queryKeys.auth.me() })` + `library.all`.                                                |

## `src/hooks/use-library.ts` (128 lines)

| Line   | Severity    | Problem                                                          | Details                                                                                                                                                   |
| ------ | ----------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 73-86  | 🔴 CRITICAL | **Over-invalidation** — `useAddToLibrary` invalidates 8 keys     | `media.all`, `timeline.all`, `collections.all`, `search.all`, `analytics.all`, etc. Invalidate only `library.all`, `library.stats`, `analytics.overview`. |
| 88-114 | 🟡 MEDIUM   | `useUpdateLibraryItem` optimistic update assumes `old` is object | `setQueryData` spreads `old` with `input` — may break if `old` is array/undefined. Add type guard: `if (old && typeof old === 'object')`.                 |

## `src/hooks/use-search.ts` (69 lines)

| Line | Severity    | Problem                                          | Details                                                                                                                                                                                                |
| ---- | ----------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7-16 | 🔴 CRITICAL | **Keystroke fire** — `staleTime: 0`, no debounce | `enabled: !!params.q && params.q.length > 0 && !!user` — search fires on every keystroke if `params` object changes reference. Debounce `params.q` in parent (300ms); use `useMemo` for params object. |

## `src/hooks/use-theme.ts` (44 lines)

| Line | Severity  | Problem                                             | Details                                                                                                                                            |
| ---- | --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3-6  | 🟡 MEDIUM | Module-level globals — not React 18 concurrent-safe | `isLightMode`, `observers`, `observer`, `listeners` shared across all hook instances. Use `useSyncExternalStore` for concurrent-safe subscription. |

---

# FRONTEND - LIB/UTILS

## `src/lib/api/fetch.ts` (442 lines)

| Line   | Severity    | Problem                                              | Details                                                                                                                                                           |
| ------ | ----------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 42-66  | 🔴 CRITICAL | **Module-level `modAccessToken` — race across tabs** | SSR guard at line 49 but race condition if multiple tabs write different tokens. Use `sessionStorage` as source of truth; `BroadcastChannel` to sync across tabs. |
| 83-112 | 🟡 MEDIUM   | `refreshAccessToken` — no retry on network error     | Add retry (1-2x) with backoff.                                                                                                                                    |

## `src/lib/store/libraryStore.ts` (406 lines)

| Line    | Severity    | Problem                                                    | Details                                                                                                                                                                                                                                                          |
| ------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 110-382 | 🔴 CRITICAL | **Zustand `persist` + React Query = dual source of truth** | Library mutations invalidate React Query but Zustand is source of truth for UI. React Query cache becomes stale immediately. Causes: 1) Duplicate data 2) Invalidation storms 3) Optimistic updates in React Query fight with Zustand persistence. **Pick ONE.** |
| 120-134 | 🟡 MEDIUM   | `lastActivityAt: "Just now"` — string, not timestamp       | Sorting by this field broken. Use ISO timestamp: `new Date().toISOString()`.                                                                                                                                                                                     |
| 306-336 | 🔴 CRITICAL | `importJSON` shallow merge loses nested arrays             | `meta[id] = { ...meta[id], ...m }` — shallow merge loses nested arrays (tags, shelfIds, progressLog). Deep merge or replace entirely.                                                                                                                            |
| 384-388 | 🔴 CRITICAL | `snapshotMeta`/`snapshotAllItems` — non-reactive getters   | Using `getState()`; components using these won't re-render on store change. Remove; use `useLibraryStore(state => state.meta[id])` selector hooks.                                                                                                               |

---

# FRONTEND - COMPONENTS

## `src/components/auth/AuthStage.tsx` (766 lines)

| Line    | Severity    | Problem                                                                                              | Details                                                                                                                |
| ------- | ----------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 126-577 | 🔴 CRITICAL | **Massive component** — 5 layers × 15 posters × motion divs + 14 artifacts + particles + hero column | Split into 5+ components: `AtmosphereLayer`, `PosterLayer`, `ArtifactLayer`, `ParticleLayer`, `HeroColumn`; lazy load. |
| 196-323 | 🔴 CRITICAL | `POSTERS.filter` runs every render; `MOCK_POSTERS` object recreated every render (lines 227-240)     | Move `MOCK_POSTERS` to module constant; memoize filtered arrays.                                                       |
| 207-211 | 🟡 MEDIUM   | `willChange` on container but children animate individually                                          | Better on leaf nodes. Move `willChange` to individual poster `motion.div`.                                             |
| 226-309 | 🟠 HIGH     | 15 posters × 3 layers = 45 motion components with spring animations                                  | Reduce to 1 layer on mobile; use `useReducedMotion` to disable hover.                                                  |
| 312-319 | 🟡 MEDIUM   | `ArtifactCard` component (lines 582-763) 180 lines of switch statement                               | Extract each artifact type to own component.                                                                           |

## `src/components/auth/LiquidGlassCard.tsx` (187 lines)

| Line   | Severity    | Problem                                                               | Details                                                                                                                                                                                 |
| ------ | ----------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 46-62  | 🔴 CRITICAL | **`getBoundingClientRect` on every `pointermove`** — layout thrashing | Cache rect on `pointerenter`; update on `resize`.                                                                                                                                       |
| 89-139 | 🔴 CRITICAL | **Sets CSS vars on every spring frame (60fps)**                       | `useEffect` subscribes to `smx.on("change")` and `smy.on("change")` — sets CSS vars every frame. Use `useTransform` to derive CSS vars directly; or batch with `requestAnimationFrame`. |

## `src/components/ui/PremiumGlass.tsx` (184 lines)

| Line    | Severity    | Problem                                                                    | Details                                                                                      |
| ------- | ----------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 56-69   | 🔴 CRITICAL | **`getBoundingClientRect` on every `pointermove`** — same layout thrashing | Cache rect.                                                                                  |
| 114-176 | 🟡 MEDIUM   | Complex isolation container with 5+ pseudo-elements via `span`             | `mix-blend-mode: screen/overlay` expensive on large surfaces. Limit size; avoid full-screen. |

## `src/components/atmosphere/AtmosphereBackground.tsx` (163 lines)

| Line    | Severity    | Problem                                                                    | Details                                                                                                                 |
| ------- | ----------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 78-88   | 🟡 MEDIUM   | `mood-wash` animation — 30s duration, `mix-blend-mode: screen`             | Expensive blend mode on full viewport. Reduce frequency; use `opacity` animation instead.                               |
| 91-114  | 🔴 CRITICAL | 3 aurora blobs with `blur-3xl` (80px+ blur)                                | **Extremely expensive on mobile**. Disable on mobile (`pointer: coarse`); reduce blur radius; use Canvas for particles. |
| 117-134 | 🔴 CRITICAL | 2 light beams with `rotate-12`, `blur-3xl`                                 | Same cost as above.                                                                                                     |
| 137-141 | 🟡 MEDIUM   | `<ParticleField count={...} />` runs RAF continuously even when tab hidden | Add `visibilitychange` listener to pause.                                                                               |

## `src/components/auth/ParticleBurst.tsx` (104 lines)

| Line | Severity    | Problem                                                | Details                                                                                                 |
| ---- | ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 95   | 🔴 CRITICAL | Dynamic `box-shadow` on 40 particles — paint thrashing | `boxShadow: \`0 0 ${p.size * 3}px ${p.color}\``— use`filter: drop-shadow(...)` or pre-render to Canvas. |

## `src/components/media/MediaCard.tsx` (149 lines)

| Line    | Severity  | Problem                                                                | Details                                                                    |
| ------- | --------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 135-139 | 🟡 MEDIUM | Action bar — `opacity-0 translate-y-2 scale-95` → `group-hover` reveal | Nested `pointer-events-none/auto` dance. Complex but works; test on touch. |

## `src/components/media/CinematicHero.tsx` (80 lines)

| Line  | Severity  | Problem                                                            | Details                                               |
| ----- | --------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| 16-20 | 🟡 MEDIUM | `<img src={item.backdrop ?? item.poster}>` — no `onError` fallback | If both missing, broken image. Add `onError` handler. |

---

# DATABASE SCHEMA

## `apps/backend/prisma/schema.prisma` (2,626 lines)

| Line           | Severity     | Problem                                                                                             | Details                                                                                                                                                                                                                                                                  |
| -------------- | ------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Multiple       | 🔴 CRITICAL  | **Media type explosion** — 8 separate catalog tables + 8 junction tables + 8 episode tables         | ~1000 lines of near-duplicate Prisma models. Adding 9th type = 3 new tables + migrations + repository updates. **Normalize to polymorphic structure**: `model Media { id; type; slug; title; catalogId }` + `model UserMedia { userId; mediaId; status; progress; ... }` |
| 34 models      | 🟠 HIGH      | **Soft deletes everywhere** — no global query filter                                                | Every query must manually add `deletedAt: null`. Add Prisma middleware or global scope.                                                                                                                                                                                  |
| 65 columns     | 🟠 HIGH      | **JSON columns overused**                                                                           | `metadata`, `preferences`, `privacy`, `externalIds` all `Json?` — unqueryable, no schema validation. Use typed columns or separate tables.                                                                                                                               |
| 391 indexes    | 🟢 LOW       | Good composite indexes but **missing on JSON paths**                                                | Add indexes for common JSON query paths (e.g., `metadata.review`).                                                                                                                                                                                                       |
| 22 enums       | 🟢 LOW       | Some should be lookup tables                                                                        | `ContentRating`, `GamePlatform`, `BookFormat` — for extensibility.                                                                                                                                                                                                       |
| Missing models | 🔵 STRATEGIC | **Follow, Like, Comment, Review, Referral, Availability, Subscription, WrappedShare, TasteSegment** | Required for Phases 1-4.                                                                                                                                                                                                                                                 |

---

# SECURITY

| Area                      | Severity     | Problem                                                      | Details                                                                                                               |
| ------------------------- | ------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Google OAuth**          | 🔴 CRITICAL  | No PKCE/state verification                                   | `auth.tsx:349-376` — `window.location.href` to `/auth/google` without PKCE. Implement PKCE; verify state on callback. |
| **CSP**                   | 🔴 CRITICAL  | No CSP headers — `html2canvas` CDN violates                  | `app.wrapped.tsx:30-70` loads script from CDN. Add CSP `script-src 'self'`; bundle `html2canvas` via npm.             |
| **2FA/WebAuthn**          | 🔵 STRATEGIC | **Completely missing**                                       | No TOTP, WebAuthn, backup codes. Enterprise blocker; compliance risk.                                                 |
| **Device Trust**          | 🔵 STRATEGIC | **Completely missing**                                       | No risk-based auth, no trusted device flow.                                                                           |
| **Password Breach Check** | 🔵 STRATEGIC | **Completely missing**                                       | No HaveIBeenPwned integration on register/password change.                                                            |
| **Idempotency Keys**      | 🟠 HIGH      | **Missing on all mutations**                                 | Add idempotency key header + middleware for `POST`/`PATCH`/`DELETE`.                                                  |
| **Token Storage Race**    | 🔴 CRITICAL  | Module globals in `fetch.ts` shared across tabs              | Use `BroadcastChannel` + `sessionStorage`.                                                                            |
| **Refresh Token Hash**    | 🟡 MEDIUM    | No pepper on SHA-256                                         | If DB leaks, offline brute-force possible. Add server-side pepper.                                                    |
| **Constant-Time Compare** | 🟡 MEDIUM    | `sessionTokenMatches` — verify uses `crypto.timingSafeEqual` | Check implementation.                                                                                                 |
| **Audit Log Size**        | 🔴 CRITICAL  | No size limit on JSON blobs                                  | `user-audit-log.service.ts:38-50` — large objects bloat table. Add size check/truncate.                               |

---

# STRATEGIC GAPS (Phase 1-4 per STRATEGY.md)

## Phase 1: Social Graph (Month 2-6) — **0% COMPLETE**

| Missing                                                                           | Files to Create/Modify                                             | Effort |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| `Follow` model (followerId, followingId, createdAt)                               | `prisma/schema.prisma`, migration, repository, service, controller | L      |
| `Like` model (userId, targetType, targetId, createdAt)                            | Same                                                               | M      |
| `Comment` model (userId, targetType, targetId, content, parentId, createdAt)      | Same                                                               | M      |
| `Review` model (userId, mediaType, mediaId, rating, content, isPublic, createdAt) | Same                                                               | L      |
| Public profile `/u/:username` route                                               | `src/routes/u.$username.tsx`, API endpoint                         | M      |
| ActivityFeed from follows                                                         | `ActivityFeed` model exists but unused; connect Follow graph       | L      |
| CustomList social counters (likesCount, etc.)                                     | Requires Like/Comment models first                                 | L      |

## Phase 2: Viral Wrapped Loop (Month 4-8) — **30% COMPLETE**

| Missing                                                 | Files to Create/Modify                                 | Effort |
| ------------------------------------------------------- | ------------------------------------------------------ | ------ |
| Server-rendered share images (Sharp/Canvas, 9:16, 16:9) | `wrapped-share-image.service.ts`, Sharp in deps unused | XL     |
| Referral gate ("Invite 3 to unlock")                    | `Referral` model, tracking, k-factor                   | L      |
| Quarterly/Monthly Mini-Wrapped                          | Cron job (`@nestjs/schedule` ✅), generator extension  | M      |
| Viral metrics (`WrappedShare` model)                    | New model + analytics                                  | L      |
| Branded templates (watermark + signup link)             | Template system                                        | L      |
| Share fallback (navigator.share polyfill)               | Web Share API polyfill                                 | S      |

## Phase 3: Monetization (Month 6-14) — **0% COMPLETE**

| Missing                              | Files to Create/Modify                                           | Effort |
| ------------------------------------ | ---------------------------------------------------------------- | ------ |
| Stripe/Paddle integration            | `billing/stripe.service.ts`, webhooks, `Subscription` model      | XL     |
| Affiliate/Where-to-Watch (JustWatch) | `Availability` model, API integration, Planning page integration | L      |
| B2B Taste Graph                      | Anonymized aggregation job, `TasteSegment` model, API            | XL     |

## Phase 4: Platform/Ecosystem (Month 12-24+) — **0% COMPLETE**

| Missing                                    | Files to Create/Modify                              | Effort |
| ------------------------------------------ | --------------------------------------------------- | ------ |
| Public API + OAuth apps                    | `public-api/` module, API key models, rate limiting | XL     |
| Letterboxd/Goodreads/MAL/Backloggd imports | OAuth/CSV import services (UI only currently)       | L      |
| Creator/verified profiles                  | Creator model, aggregation job                      | M      |
| Embed widgets                              | Widget components, embed API                        | M      |

---

## 📌 QUICK REFERENCE: TOP 20 FILES TO FIX FIRST

| Rank | File                                                           | Primary Issue                                  |
| ---- | -------------------------------------------------------------- | ---------------------------------------------- |
| 1    | `apps/backend/src/analytics/analytics.repository.ts`           | 29 `any`, N+1 memory OOM                       |
| 2    | `src/routes/app.wrapped.tsx`                                   | html2canvas CDN CSP violation                  |
| 3    | `src/routes/auth.tsx`                                          | AuthStage 766-line WebGL, Google OAuth no PKCE |
| 4    | `src/lib/store/libraryStore.ts`                                | Dual state (Zustand + React Query)             |
| 5    | `apps/backend/src/auth/auth.service.ts`                        | Refresh rotation race condition                |
| 6    | `apps/backend/src/library/library.service.ts`                  | Concurrent add race (P2002 unhandled)          |
| 7    | `apps/backend/src/wrapped/wrapped.repository.ts`               | upsertStats non-atomic transaction             |
| 8    | `apps/backend/src/search/search.repository.ts`                 | 24 `any`, unbounded memory merge               |
| 9    | `apps/backend/src/collections/collections.repository.ts`       | 29 `any`, position race                        |
| 10   | `src/lib/api/fetch.ts`                                         | Module-level token race across tabs            |
| 11   | `apps/backend/src/progress/progress-calculation.service.ts`    | 5 calculation bugs                             |
| 12   | `apps/backend/src/users/services/privacy.service.ts`           | Visibility enum mismatch                       |
| 13   | `apps/backend/src/journal/journal.repository.ts`               | 29 `any`, 5 entity types                       |
| 14   | `src/components/auth/AuthStage.tsx`                            | 766-line massive component                     |
| 15   | `src/components/auth/LiquidGlassCard.tsx`                      | Layout thrashing on pointermove                |
| 16   | `apps/backend/src/media/media.repository.ts`                   | modelMap string keys, broken sort              |
| 17   | `apps/backend/src/slug/slug.service.ts`                        | ensureUnique busy-loop                         |
| 18   | `apps/backend/src/common/correlation/correlation-id.helper.ts` | Missing AsyncLocalStorage                      |
| 19   | `src/hooks/use-auth.ts`                                        | Over-invalidation (8+ keys)                    |
| 20   | `apps/backend/src/collections/smart-collection.service.ts`     | matchMode: 'ANY' ignored                       |

---

## 🎯 NEXT STEPS FOR $1B SaaS

1. **Week 1-2**: Fix Top 20 critical files above
2. **Week 3-4**: Migrate 9 remaining `any` files to typed delegates
3. **Week 5-8**: Build Social Graph (Phase 1) — Follow, Like, Comment, Review models
4. **Week 9-12**: Complete Viral Wrapped Loop (Phase 2) — share images, referral, quarterly
5. **Week 13-16**: Start Monetization (Phase 3) — Stripe, affiliate, B2B taste graph

**Total estimated effort**: 16 weeks for critical fixes + Phases 1-3 foundation
**Revenue unblocked**: Social graph (viral growth), Wrapped loop (organic acquisition), Monetization (revenue)

---

_End of Problem Inventory — 500+ issues documented with file:line references for systematic fixing._
