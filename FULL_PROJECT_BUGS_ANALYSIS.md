# 🔍 FULL PROJECT BUG ANALYSIS — Chronicle / Avuno

> **Date:** 2026-08-06  
> **Scope:** Complete codebase audit (Frontend + Backend)  
> **Total Issues Found:** 103  
> **Methodology:** Line-by-line review of every source file  

---

## 📊 Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 15 | Security vulnerabilities, data loss risks, broken auth |
| 🟠 High | 25 | Broken features, crashes, major logic errors |
| 🟡 Medium | 38 | Incomplete features, type mismatches, performance |
| 🟢 Low | 25 | Code quality, unused imports, minor inconsistencies |

| Category | Count |
|----------|-------|
| Security Vulnerabilities | 12 |
| Incomplete/Broken Features | 9 |
| Hardcoded/Mock Data | 14 |
| Performance Issues | 6 |
| Type Mismatches | 8 |
| Error Handling Gaps | 11 |

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### SEC-CRIT-001: Real JWT Secrets Committed in .env
- **File:** `apps/backend/.env` (lines 4-5)
- **Problem:** Production JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are committed to git
- **Impact:** Anyone with repo access can forge JWT tokens for all users
- **Fix:** Rotate secrets immediately, add `.env` to `.gitignore`, use proper secret management

### SEC-CRIT-002: Database Credentials in Plain Text
- **File:** `apps/backend/.env` (line 1)
- **Problem:** `DATABASE_URL=postgresql://chronicle:chronicle@127.0.0.1:5432/chronicle`
- **Impact:** Database compromise if repo is exposed
- **Fix:** Use environment variables or secret manager, never commit credentials

### SEC-CRIT-003: Hardcoded OAuth Encryption Key
- **File:** `apps/backend/.env` (line 28)
- **Problem:** `OAUTH_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef` is trivially guessable
- **Impact:** Google OAuth tokens in database can be decrypted by attackers
- **Fix:** Generate cryptographically secure 32-byte key, use env var in production

### SEC-CRIT-004: Access Tokens Stored in sessionStorage
- **File:** `src/lib/api/fetch.ts` (lines 30-49)
- **Problem:** JWT access tokens stored in sessionStorage accessible to all JavaScript
- **Impact:** XSS attack can steal user tokens
- **Fix:** Use httpOnly cookies (requires backend coordination)

### SEC-CRIT-005: OAuth Token Passed via URL Query Parameter
- **File:** `src/routes/auth.callback.tsx` (lines 40-42)
- **Problem:** Token accepted from URL query param and stored: `setAccessToken(token.trim())`
- **Impact:** Token leaked in browser history, server logs, Referer header
- **Fix:** Use POST-based token exchange or cookies

### SEC-CRIT-006: Hardcoded HTTP Backend URL
- **File:** `src/server.ts` (lines 40-43)
- **Problem:** `BACKEND_URL` defaults to `http://api.avuno.xyz:4000` (non-HTTPS)
- **Impact:** API traffic intercepted in transit; hardcoded URL in frontend bundle
- **Fix:** Use HTTPS, make URL configurable via env var only

### SEC-CRIT-007: Auth Failure Silently Allows Access
- **File:** `src/routes/app.tsx` (lines 24-29)
- **Problem:** When auth check fails, error is caught silently and app still renders
- **Impact:** Users with expired/invalid tokens access the full app
- **Fix:** Redirect to `/auth` on authentication failure

### SEC-CRIT-008: Mass Assignment Vulnerability
- **File:** `apps/backend/src/library/library.repository.ts` (lines 278-307)
- **Problem:** `update` method spreads user data directly: `data: Record<string, unknown>`
- **Impact:** Users can modify `id`, `userId`, `createdAt` and other protected fields
- **Fix:** Strip protected fields before update, use explicit DTO whitelists

### SEC-CRIT-009: File Upload Missing File Validation
- **File:** `apps/backend/src/storage/storage.controller.ts` (lines 39-49)
- **Problem:** No check if `file` is undefined before accessing `file.buffer`
- **Impact:** Unhandled TypeError returns 500 instead of 400 Bad Request
- **Fix:** Add `if (!file) throw new BadRequestException('No file provided')`

### SEC-CRIT-010: Admin Metrics Return Hardcoded Mock Data
- **File:** `apps/backend/src/users/users.controller.ts` (lines 101-105)
- **Problem:** Returns `{ usersCount: 42, activeUsers: 10 }` regardless of actual data
- **Impact:** Administrators see fake metrics, making the endpoint useless
- **Fix:** Query actual database counts

### SEC-CRIT-011: Forgot Password Completely Mocked
- **File:** `src/routes/auth.forgot-password.tsx` (lines 16-27)
- **Problem:** Uses `setTimeout` to simulate request, no API call made
- **Impact:** Users never receive password reset emails
- **Fix:** Implement actual API integration with backend endpoint

### SEC-CRIT-012: Creator/Franchise Pages Always 404
- **File:** `src/routes/app.creators.$id.tsx` (lines 12-15), `src/routes/app.franchises.$id.tsx` (lines 12-15)
- **Problem:** `buildCreatorProfile` and `buildFranchiseProfile` always return `undefined`
- **Impact:** All creator and franchise detail pages throw `notFound()`
- **Fix:** Implement data fetching from backend API

### SEC-CRIT-013: Import Mismatch Causes Runtime Error
- **File:** `src/routes/app.media.$id.tsx` (line 46)
- **Problem:** Imports `MediaReflectionPanel` from file that exports `YourReflectionsRail`
- **Impact:** Runtime error when rendering media detail page
- **Fix:** Change import to: `import { YourReflectionsRail }`

### SEC-CRIT-014: Email Verification Disabled
- **File:** `apps/backend/.env` (line 24)
- **Problem:** `EMAIL_VERIFICATION_REQUIRED=false` bypasses email verification
- **Impact:** Unverified users can access the platform
- **Fix:** Set to `true` in production, ensure email service is configured

### SEC-CRIT-015: All Production URLs Point to Localhost
- **File:** Multiple files (`apps/backend/.env`, `apps/backend/src/config/configuration.ts`)
- **Problem:** All callback URLs, CORS origins, and frontend URLs default to localhost
- **Impact:** OAuth, email links, and API calls fail in production
- **Fix:** Configure environment-specific env files

---

## 🟠 HIGH SEVERITY ISSUES

### HIGH-001: Duplicate Keyboard Shortcut Listeners
- **File:** `src/components/search/CommandPalette.tsx` (lines 68-78) + `src/components/common/GlobalShortcuts.tsx`
- **Problem:** Both components register `⌘K`/`Ctrl+K` listener on window
- **Impact:** Command palette may toggle twice (open then close immediately)
- **Fix:** Centralize keyboard shortcut handling in one location

### HIGH-002: Analytics Disabled in Production
- **File:** `src/lib/analytics.ts` (lines 4-40)
- **Problem:** Only logs to console in DEV; no PostHog/Plausible integration loaded
- **Impact:** Zero analytics data captured in production
- **Fix:** Integrate a proper analytics provider or implement backend tracking

### HIGH-003: Token Expiration Edge Cases
- **File:** `src/lib/api/fetch.ts` (lines 78-86)
- **Problem:** `isTokenExpired` returns true on parse error (forces refresh), but 30-sec buffer uses `<=` which could race
- **Impact:** Expired tokens may be sent or valid tokens unnecessarily refreshed
- **Fix:** Increase buffer to 60 seconds, handle parse errors explicitly

### HIGH-004: Hardcoded User Initials in TopBar
- **File:** `src/components/layout/TopBar.tsx` (line 121)
- **Problem:** Avatar always shows "AY" regardless of actual user
- **Impact:** Broken personalization for all users
- **Fix:** Use `user?.name` or `user?.email` to compute initials

### HIGH-005: Unvalidated Sort Fields (SQL Injection-like)
- **File:** `apps/backend/src/media/media.repository.ts` (line 72)
- **Problem:** `sortBy` from user input used directly in Prisma orderBy without allowlist
- **Impact:** Can sort by non-existent fields causing errors or information disclosure
- **Fix:** Validate sortBy against allowed field list

### HIGH-006: Session Tokens Stored in Plaintext
- **File:** `apps/backend/src/auth/services/session.service.ts` (line 23)
- **Problem:** Session token stored raw in database (not hashed like refresh tokens)
- **Impact:** Database compromise directly exposes all active sessions
- **Fix:** Hash session tokens with SHA-256 before storing

### HIGH-007: Missing Rate Limiting on Analytics Endpoint
- **File:** `apps/backend/src/analytics/analytics.controller.ts` (lines 112-116)
- **Problem:** `POST /analytics/pageview` has no rate limiting or authentication
- **Impact:** Can be abused to spam analytics or perform DoS
- **Fix:** Add `@Throttle` decorator and require authentication

### HIGH-008: No Authentication on Analytics Pageview
- **File:** `apps/backend/src/analytics/analytics.controller.ts` (lines 112-122)
- **Problem:** Endpoint has no `@UseGuards(JwtAuthGuard)` decorator
- **Impact:** Anyone can submit fake pageview data
- **Fix:** Require authentication or at minimum validate origin

### HIGH-009: Same Missing File Validation (Avatar/Cover)
- **File:** `apps/backend/src/storage/storage.controller.ts` (lines 130-149)
- **Problem:** `uploadAvatar` and `uploadCover` also don't check for undefined file
- **Impact:** 500 errors instead of 400 for missing files
- **Fix:** Add null check before accessing file properties

### HIGH-010: Email Template XSS Risk
- **File:** `apps/backend/src/auth/services/resend-email-transport.service.ts` (line 25)
- **Problem:** `${userDisplayName}` and `${link}` interpolated without sanitization
- **Impact:** HTML injection in email clients if name contains HTML
- **Fix:** Sanitize user-provided values before interpolation

### HIGH-011: Missing NaN Check on parseInt for Limit
- **File:** `apps/backend/src/journal/journal.controller.ts` (lines 44-50)
- **Problem:** `parseInt(limit, 10)` doesn't check for NaN result
- **Impact:** NaN passed to database query causes unexpected behavior
- **Fix:** Add `if (isNaN(limit)) throw new BadRequestException()`

### HIGH-012: Insecure Default Email API Key
- **File:** `apps/backend/src/auth/services/resend-email-transport.service.ts` (line 12)
- **Problem:** Default key is `'dummy-key-for-tests'`
- **Impact:** Emails silently fail if `EMAIL_API_KEY` not set in production
- **Fix:** Fail fast on startup if email key is not configured

### HIGH-013: Goals Route is "Coming Soon" Placeholder
- **File:** `src/routes/app.goals.tsx`
- **Problem:** Entire goals feature is a non-functional placeholder
- **Impact:** Users clicking Goals see empty feature
- **Fix:** Either implement or hide the route

### HIGH-014: Achievements Route is "Coming Soon" Placeholder
- **File:** `src/routes/app.achievements.tsx`
- **Problem:** Entire achievements feature is a non-functional placeholder
- **Impact:** Users clicking Achievements see empty feature
- **Fix:** Either implement or hide the route

### HIGH-015: Tags Route is Minimal Placeholder
- **File:** `src/routes/app.tags.$tag.tsx`
- **Problem:** Shows "Tag #{tag} content coming soon."
- **Impact:** Broken feature accessible from navigation
- **Fix:** Either implement or hide the route

### HIGH-016: Calendar Route References Undefined Variables
- **File:** `src/routes/app.calendar.tsx` (lines 13-14)
- **Problem:** `MEDIA` is empty array; `CALENDAR_YEAR` imported but unused
- **Impact:** Fallback code path is dead code, calendar may not function
- **Fix:** Implement proper data fetching for calendar

### HIGH-017: Library Sort References Non-Existent Properties
- **File:** `src/routes/app.library.all.tsx` (line 53)
- **Problem:** Sorts by `avgRating` and `hoursSpent` which don't exist on `UIMediaItem`
- **Impact:** Sort produces NaN results, items appear in wrong order
- **Fix:** Use correct property names (`rating` not `avgRating`)

### HIGH-018: Timeline Route Renders Empty Array
- **File:** `src/routes/app.timeline.tsx` (line 241)
- **Problem:** `{[].map(...)}` renders nothing - editorial highlights section empty
- **Impact:** Broken timeline feature
- **Fix:** Implement data source for editorial highlights

### HIGH-019: adaptInsights Type Mismatch
- **File:** `src/lib/adapters/analytics.ts` (lines 83-85)
- **Problem:** Returns input directly with type cast but `InsightsResponse` ≠ `UIInsights`
- **Impact:** Missing fields like `favoriteDecade`, `longestBinge` always undefined
- **Fix:** Implement proper field mapping in adapter

### HIGH-020: Inconsistent Journal Data Shape
- **File:** `src/lib/api/journal.ts` (lines 186, 207)
- **Problem:** `listJournalEntries` returns `{items, hasMore, nextCursor}`, `listMemories` returns `{data, hasMore, nextCursor}`
- **Impact:** Infinite query hooks may use wrong property name
- **Fix:** Normalize both to same response shape

### HIGH-021: Duplicate Escape Key Listeners
- **File:** `src/components/search/CommandPalette.tsx` + `src/components/common/GlobalShortcuts.tsx`
- **Problem:** Both listen for Escape key to close/dismiss
- **Impact:** May interfere with each other
- **Fix:** Coordinate single source of truth for keyboard shortcuts

### HIGH-022: Missing Pagination on Collection Items
- **File:** `apps/backend/src/collections/collections.service.ts` (lines 70-86)
- **Problem:** All items loaded with no pagination
- **Impact:** Collections with many items will be slow/memory-heavy
- **Fix:** Implement cursor-based pagination

### HIGH-023: Swagger Exposed Without Restriction
- **File:** `apps/backend/src/app.bootstrap.ts` (lines 75-86)
- **Problem:** Enabled when `NODE_ENV !== 'production'` but defaults to development
- **Impact:** API docs publicly accessible if deployed without env vars
- **Fix:** Disable by default, require explicit opt-in

### HIGH-024: Google OAuth Credentials Set to "test"
- **File:** `apps/backend/.env` (lines 6-7)
- **Problem:** `GOOGLE_CLIENT_ID=test` / `GOOGLE_CLIENT_SECRET=test`
- **Impact:** Google OAuth login completely non-functional
- **Fix:** Use real credentials from Google Cloud Console

### HIGH-025: Missing CORS Origin in Production
- **File:** `apps/backend/src/app.bootstrap.ts` (lines 48-71)
- **Problem:** When `CORS_ORIGIN` empty, all origins allowed with credentials
- **Impact:** Any website can make authenticated requests to your API
- **Fix:** Require explicit CORS_ORIGIN in production, fail startup if missing

---

## 🟡 MEDIUM SEVERITY ISSUES

### MED-001: Duplicate KIND_LABEL Definitions
- **File:** `src/lib/types.ts` (lines 13-24) + `src/lib/store/libraryStore.ts` (lines 393-405)
- **Fix:** Single source of truth for shared constants

### MED-002: Library Items Fallback to localStorage
- **File:** `src/routes/app.library.all.tsx` (lines 32-33)
- **Problem:** Falls back to Zustand persist store when API empty, dual source of truth
- **Fix:** Use API as single source, show empty state if no items

### MED-003: Search Route Synthetic Keyboard Event
- **File:** `src/routes/app.search.tsx` (lines 12-15)
- **Problem:** Programmatically dispatches KeyboardEvent to open command palette
- **Fix:** Use shared command palette context/store

### MED-004: ConstellationEntry Duplicate Export
- **File:** `src/lib/api/analytics.ts` (lines 152-157, 317-322)
- **Fix:** Remove duplicate interface definition

### MED-005: getMediaItems Reads from Undefined Window Property
- **File:** `src/lib/types.ts` (lines 97-101)
- **Problem:** `(window as any).__CHRONICLE_MEDIA__` never set by any code
- **Fix:** Remove dead code or implement proper data injection

### MED-006: Date.now() in IDs (Collision Risk)
- **Files:** `libraryStore.ts`, `notesEngine.ts`, `saveForLater.ts`, `bookmarks.ts`
- **Problem:** `Date.now().toString(36)` can collide if same millisecond
- **Fix:** Use crypto.randomUUID() or proper UUID library

### MED-007: Race Condition in Slug Generation
- **File:** `apps/backend/src/media/slug.service.ts` (lines 48-56)
- **Fix:** Use database unique constraint + retry logic

### MED-008: Missing deletedAt Filter in Search
- **File:** `apps/backend/src/search/search.repository.ts` (lines 236-267)
- **Fix:** Add `deletedAt: null` to all search queries

### MED-009: No Maximum Limit on Search Results Memory
- **File:** `apps/backend/src/search/search.service.ts` (line 20)
- **Fix:** Limit total results held in memory after merge

### MED-010: parseInt Without NaN Check (Multiple Controllers)
- **Files:** `journal.controller.ts`, `progress.controller.ts`, `search.controller.ts`, `analytics.controller.ts`
- **Fix:** Validate all parseInt results

### MED-011: No List Virtualization for Large Lists
- **Files:** `app.library.all.tsx`, `app.timeline.tsx`, `app.journal.tsx`
- **Fix:** Implement virtualization (react-virtuoso or @tanstack/react-virtual)

### MED-012: Analytics Page References Non-Existent Properties
- **File:** `src/routes/__app.analytics-page.tsx` (line 165)
- **Problem:** `completedItemsDelta`, `moviesCompletedDelta` don't exist on type
- **Fix:** Add properties to backend response or remove from UI

### MED-013: Missing Error Handling in Calendar Day Query
- **File:** `src/routes/app.calendar.tsx` (lines 84-89)
- **Fix:** Add error state and retry UI

### MED-014: Unvalidated Redirect in OAuth Callback
- **File:** `apps/backend/src/auth/controllers/google-oauth.controller.ts` (line 92)
- **Problem:** `returnTo` URL from Redis state used directly
- **Fix:** Validate redirect URL against allowlist

### MED-015: Potential DoS via Large Request Body
- **File:** `apps/backend/src/app.bootstrap.ts` (line 17)
- **Fix:** Configure explicit body size limits

### MED-016: Missing CORS Origin Validation
- **File:** `apps/backend/src/app.bootstrap.ts` (lines 48-71)
- **Fix:** Strict origin validation in production

### MED-017: Event Publishing Can Fail Main Operation
- **Files:** `journal.service.ts`, `collections.service.ts`, `interaction.service.ts`
- **Problem:** Events awaited - if event system down, main operation fails
- **Fix:** Make events fire-and-forget with separate error handling

### MED-018: Notification Test Endpoint No Rate Limit
- **File:** `apps/backend/src/notifications/notifications.controller.ts` (lines 63-71)
- **Fix:** Add rate limiting and input length limits

### MED-019: Media Type Not Validated in DTO
- **File:** `apps/backend/src/library/library.controller.ts` (lines 26-36)
- **Fix:** Add `@IsEnum` decorator for mediaType field

### MED-020: useOnline Hook Initial State Wrong
- **File:** `src/hooks/use-online.ts` (line 4)
- **Problem:** Initial state is `true` (online), may flash incorrectly
- **Fix:** Use `navigator.onLine` as initial value

### MED-021: Potential Memory Leak in MediaActionsProvider
- **File:** `src/lib/store/MediaActionsContext.tsx`
- **Problem:** Keyboard listener may register multiple times
- **Fix:** Ensure proper cleanup in useEffect return

### MED-022: Race Condition in Auth Callback
- **File:** `src/routes/auth.callback.tsx` (line 12)
- **Problem:** `exposed` ref persists across remounts with different params
- **Fix:** Use proper effect cleanup or key-based mounting

### MED-023: CSS Custom Property String Hack
- **File:** `src/routes/app.wrapped.tsx` (line 184)
- **Problem:** `.replace("/25", " / 0.25")` is fragile
- **Fix:** Use proper CSS opacity notation

### MED-024: Empty/Stub Data Arrays
- **Files:** `achievements.ts`, `challenges.ts`, `characters.ts`, `franchiseEngine.ts`, `goals.ts`, `lifeChapters.ts`
- **Fix:** Either implement or remove routes using these arrays

### MED-025: Library Route References Non-Existent Properties
- **File:** `src/routes/app.library.all.tsx`
- **Problem:** Uses `a.avgRating` and `a.hoursSpent` that don't exist
- **Fix:** Map backend fields correctly in adapter

### MED-026: Missing Index on deletedAt Fields
- **File:** `apps/backend/prisma/schema.prisma`
- **Fix:** Add indexes for soft-delete filter performance

### MED-027: No Timeout Configuration on Prisma Queries
- **File:** `apps/backend/src/prisma/prisma.service.ts`
- **Fix:** Configure statement timeout

### MED-028: Console Email Transport Logs Sensitive Token
- **File:** `apps/backend/src/auth/services/console-email-transport.service.ts` (line 18)
- **Fix:** Mask token in development logs

### MED-029: Missing deletedAt Filter in Journal Queries
- **File:** `apps/backend/src/journal/journal.repository.ts` (lines 87-94)
- **Fix:** Add `deletedAt: null` filter to all journal queries

### MED-030: Review ID Generation Not Unique
- **File:** `apps/backend/src/interaction/interaction.service.ts` (line 360)
- **Problem:** `'review-' + (review.createdAt ?? Date.now())` can collide
- **Fix:** Use UUID for review IDs

### MED-031: Library Sort Comparator NaN
- **File:** `src/routes/app.library.all.tsx` (line 53)
- **Problem:** Sorting by undefined properties produces inconsistent order
- **Fix:** Use correct property names with fallback

### MED-032: Missing Error Boundary on Search Route
- **File:** `src/routes/app.search.tsx`
- **Problem:** No error boundary around search component
- **Fix:** Wrap with ErrorBoundary component

### MED-033: CSV Import ID Collision
- **File:** `src/routes/app.import.tsx` (lines 83-86)
- **Problem:** `Date.now().toString(36)` can produce duplicate IDs on rapid import
- **Fix:** Use crypto.randomUUID() for import IDs

### MED-034: Missing Validation on mediaId in AddToLibraryDto
- **File:** `apps/backend/src/library/dto/library.dto.ts`
- **Problem:** mediaId not validated as UUID format
- **Fix:** Add `@IsUUID()` decorator

### MED-035: Notification Preferences Not Supported
- **File:** `src/routes/app.notifications.tsx`
- **Problem:** Shows "not currently supported by the backend API"
- **Fix:** Implement backend support or hide preference options

### MED-036: Inconsistent NODE_ENV Checks
- **Files:** Multiple files use `NODE_ENV` vs `nodeEnv` vs `NODE_ENV_TEST`
- **Fix:** Standardize environment variable access

### MED-037: Missing Error Handling in Event Emissions
- **Files:** `journal/journal.service.ts`, `collections/collections.service.ts`
- **Problem:** await on events that should be fire-and-forget
- **Fix:** Wrap event emissions in try-catch or use unhandled promise

### MED-038: Empty All_LIBRARY Export
- **File:** `src/lib/library.ts` (line 43)
- **Problem:** `ALL_LIBRARY: MediaItem[] = []` never populated
- **Fix:** Remove dead export or implement data source

---

## 🟢 LOW SEVERITY ISSUES

### LOW-001: Unused Imports Throughout
- **Files:** Multiple files (`app.media.$id.tsx`, `app.calendar.tsx`, `app.profile.tsx`, etc.)
- **Fix:** Clean up unused imports (ESLint rule: `no-unused-vars`)

### LOW-002: console.log/console.debug in Production Code
- **Files:** `src/lib/analytics.ts`, `src/lib/bookmarks.ts`, `src/server.ts`, `apps/backend/src/main.ts`
- **Fix:** Remove or guard with `if (import.meta.env.DEV)`

### LOW-003: Inconsistent Naming (chronicle vs avuno)
- **Files:** `apps/backend/src/config/configuration.ts` (line 23 vs .env line 16)
- **Fix:** Use single brand name throughout

### LOW-004: Hardcoded Domain in Google Strategy
- **File:** `apps/backend/src/auth/strategies/google.strategy.ts` (line 25)
- **Fix:** Make fully configurable via env var

### LOW-005: Inconsistent Return Types in Search
- **File:** `apps/backend/src/search/search.service.ts` (line 94)
- **Problem:** Cursor format `${score}_${id}` fragile if IDs contain underscores
- **Fix:** Use structured cursor (JSON/base64)

### LOW-006: Empty current-user.interface.ts
- **File:** `apps/backend/src/core/context/current-user.interface.ts`
- **Fix:** Add proper interface definition

### LOW-007: Missing CSP Report URI
- **File:** `apps/backend/src/app.bootstrap.ts` (lines 29-39)
- **Fix:** Add report-uri directive for CSP violations

### LOW-008: Inconsistent NODE_ENV Checks
- **Files:** Multiple files use different patterns
- **Fix:** Standardize with single config access pattern

### LOW-009: Commented-Out Compression
- **File:** `apps/backend/src/app.bootstrap.ts` (line 6)
- **Problem:** `// import compression from 'compression'` disabled due to test failures
- **Fix:** Fix tests and re-enable, or remove comment

### LOW-010: TODO/FIXME Comments Left In
- **Files:** `apps/backend/src/storage/media-cleanup.service.ts` (line 23), `slackTriggers.ts` (line 60)
- **Fix:** Track in issue tracker, remove from code

### LOW-011: Analytics Tracker No Batching
- **Problem:** fetch call on every page navigation without batching
- **Fix:** Batch analytics events and send periodically

### LOW-012: Zustand Selectors Missing Shallow Equality
- **Problem:** Re-renders on any store change
- **Fix:** Use `useShallow` from `zustand/react/shallow`

### LOW-013: Unused _mediaIds Variable
- **File:** `apps/backend/src/journal/journal.service.ts` (line 121)
- **Problem:** Underscore prefix misleading - variable IS used
- **Fix:** Remove underscore prefix

### LOW-014: Inconsistent Logger Verbose Mode
- **File:** `apps/backend/src/logger/logger.module.ts` (line 10)
- **Problem:** Verbose mode when `NODE_ENV !== 'production'` but defaults to development
- **Fix:** Explicit configuration

### LOW-015: ngrok-skip-browser-warning Header
- **File:** `src/lib/api/fetch.ts` (lines 135-137)
- **Problem:** Development-only header in production bundle
- **Fix:** Guard with `import.meta.env.DEV`

### LOW-016: "Enterprise Grade Security" Ironic Comment
- **File:** `apps/backend/src/auth/controllers/google-oauth.controller.ts` (line 24)
- **Fix:** Remove unprofessional comment

### LOW-017: Missing Error Handling in getFileInfo
- **File:** `apps/backend/src/storage/storage.service.ts` (lines 77-97)
- **Problem:** Empty catch block silently swallows errors
- **Fix:** Log errors for debugging

### LOW-018: No API Versioning Strategy
- **Problem:** API prefix configurable but no versioning
- **Fix:** Implement `/api/v1/` prefix strategy

### LOW-019: Missing Database Transaction Wrapping
- **Problem:** User creation + email not atomic
- **Fix:** Wrap related operations in Prisma transactions

### LOW-020: Hardcoded BullMQ Prefix Inconsistency
- **Problem:** Config defaults to `'avuno'`, `.env` has `'chronicle'`
- **Fix:** Standardize on one prefix

### LOW-021: Test Password in E2E Tests
- **File:** `tests/e2e.test.ts` (lines 30-31)
- **Problem:** `password1234` weak test password
- **Fix:** Use stronger test passwords

### LOW-022: Seed Demo Data References Test User
- **File:** `apps/backend/seed-demo-data.ts` (lines 7, 11, 298)
- **Problem:** References `chronicle-tester@example.com`
- **Fix:** Make seed user configurable

### LOW-023: Missing Pagination on Shelf Items
- **File:** `apps/backend/src/collections/collections.service.ts` (lines 192-198)
- **Problem:** All shelf items loaded without pagination
- **Fix:** Implement pagination for consistency

### LOW-024: Empty catch Block in Storage Service
- **File:** `apps/backend/src/storage/storage.service.ts`
- **Problem:** Errors silently swallowed
- **Fix:** Add logging to all catch blocks

### LOW-025: Unused ThrottlerGuard Import
- **Files:** Multiple controllers import but don't use ThrottlerGuard
- **Fix:** Remove unused imports or implement rate limiting

---

## 🔓 SECURITY VULNERABILITIES SUMMARY

| ID | Vulnerability | Location | Severity |
|----|---------------|----------|----------|
| SV-01 | Token in sessionStorage | `fetch.ts:30-49` | Critical |
| SV-02 | OAuth token in URL | `auth.callback.tsx:40-42` | Critical |
| SV-03 | Hardcoded HTTP URL | `server.ts:40-43` | Critical |
| SV-04 | Silent auth failure | `app.tsx:24-29` | Critical |
| SV-05 | Mass assignment | `library.repository.ts:278-307` | Critical |
| SV-06 | Plaintext session tokens | `session.service.ts:23` | High |
| SV-07 | No CSRF protection | All mutating endpoints | Medium |
| SV-08 | CORS wildcard with credentials | `app.bootstrap.ts:48-71` | Medium |
| SV-09 | Unvalidated sort fields | `media.repository.ts:72` | High |
| SV-10 | Email template XSS | `resend-email-transport.service.ts:25` | High |
| SV-11 | Unvalidated OAuth redirect | `google-oauth.controller.ts:92` | Critical |
| SV-12 | Swagger exposed | `app.bootstrap.ts:75-86` | Medium |

---

## 🚧 INCOMPLETE/ BROKEN FEATURES

| Feature | Status | Files |
|---------|--------|-------|
| Forgot Password | Mocked | `auth.forgot-password.tsx` |
| Goals | Placeholder | `app.goals.tsx` |
| Achievements | Placeholder | `app.achievements.tsx` |
| Tags | Placeholder | `app.tags.$tag.tsx` |
| Characters | Empty array | `characters.ts`, `app.characters.*.tsx` |
| Creators | Returns undefined | `creatorEngine.ts`, `app.creators.*.tsx` |
| Franchises | Empty array | `franchiseEngine.ts`, `app.franchises.*.tsx` |
| Analytics | Disabled prod | `analytics.ts` |
| Media Cleanup | Not implemented | `media-cleanup.service.ts` |

---

## 🎭 HARDCODED/ MOCK DATA

| Data | Location | Should Be |
|------|----------|-----------|
| "AY" initials | `TopBar.tsx:121` | Computed from user name |
| MOCK_POSTERS | `AuthStage.tsx:231-243` | Real media posters |
| DEMO_STATS (124h, 12 streak, 34 done) | `AnalyticsPreview.tsx:16-20` | Real user stats |
| DEMO_COLLECTIONS | `CollectionsPreview.tsx:3-8` | Real collections |
| `{ usersCount: 42, activeUsers: 10 }` | `users.controller.ts:101-105` | DB query |
| `ACHIEVEMENTS_FULL = []` | `achievements.ts` | Real achievement definitions |
| `CHALLENGES = []` | `challenges.ts` | Real challenge definitions |
| `CHARACTERS = []` | `characters.ts` | Real character data |
| `FRANCHISES = []` | `franchiseEngine.ts` | Real franchise data |
| `GOALS_FULL = []` | `goals.ts` | Real goal definitions |
| `MEDIA: any[] = []` | `types.ts:96` | Real media data |
| `ALL_LIBRARY = []` | `library.ts:43` | Real library items |

---

## ⚡ PERFORMANCE ISSUES

| Issue | Location | Fix |
|-------|----------|-----|
| No list virtualization | Library, Timeline, Journal | Implement react-virtuoso |
| Full tree re-render on page change | AnimatePresence mode="wait" | Use layout animations |
| Analytics fetch per navigation | `analytics-tracker.ts` | Batch events |
| No Prisma query timeout | `prisma.service.ts` | Set statement_timeout |
| No indexes on deletedAt | Prisma schema | Add composite indexes |
| Global search merges 450 results | `search.service.ts:20` | Limit total memory |

---

## 📋 PRIORITIZED FIX ROADMAP

### Phase 1: Security Emergency (Week 1)
1. Rotate all committed secrets
2. Fix token storage (sessionStorage → httpOnly cookies)
3. Remove token from OAuth URL callback
4. Fix mass assignment vulnerability
5. Add file upload validation
6. Enable email verification

### Phase 2: Critical Fixes (Week 2)
1. Fix forgot password flow
2. Fix creator/franchise pages
3. Fix MediaReflectionPanel import
4. Replace hardcoded admin metrics
5. Configure production URLs
6. Fix HTTPS backend URL

### Phase 3: High Priority (Week 3-4)
1. Implement analytics provider
2. Add rate limiting to analytics endpoint
3. Fix duplicate keyboard listeners
4. Add input validation (parseInt, sort fields)
5. Hash session tokens
6. Remove placeholder features

### Phase 4: Polish (Week 5-6)
1. Add list virtualization
2. Fix type mismatches in adapters
3. Implement proper error handling
4. Add pagination to collections
5. Clean up unused imports
6. Standardize naming conventions

### Phase 5: Production Readiness (Week 7-8)
1. Configure production env vars
2. Set up proper CI/CD secrets
3. Add CSP report URI
4. Configure Prisma timeouts
5. Add database indexes
6. Load test and optimize

---

## 🛠️ HELPER COMMANDS

```bash
# Find all TODO/FIXME comments
grep -rn "TODO\|FIXME\|HACK\|XXX\|MOCK\|FAKE\|DUMMY" src/ apps/backend/src/

# Find console.log statements
grep -rn "console\.log\|console\.debug" src/ apps/backend/src/

# Find hardcoded localhost URLs
grep -rn "localhost\|127\.0\.0\.1" src/ apps/backend/src/

# Find hardcoded secrets patterns
grep -rn "secret\|password\|token\|key" apps/backend/.env

# Find all empty array exports
grep -rn "\[\]" src/lib/ apps/backend/src/

# Find Date.now() used in IDs
grep -rn "Date\.now\(\)" src/ apps/backend/src/
```

---

## 📁 FILES AUDITED

### Frontend (242+ files)
- `src/components/` — All component directories (achievements, analytics, atmosphere, auth, calendar, capture, challenges, character, collections, common, creator, dashboard, discovery, editorial, franchise, goals, intelligence, journal, landing, layout, library, media, media-detail, memory, profile, search, share, ui)
- `src/routes/` — All route files (38 route files)
- `src/hooks/` — All custom hooks (11 files)
- `src/lib/` — All lib files (adapters, api, store, utils + 30+ feature modules)

### Backend (200+ files)
- `apps/backend/src/` — All source modules (analytics, auth, bullmq, collections, common, config, core, deployment, hardening, health, interaction, journal, library, logger, media, notifications, observability, prisma, progress, redis, search, shared, storage, users, wrapped)
- `apps/backend/prisma/` — Schema and migrations

---

> **⚠️ IMPORTANT NOTE:** This analysis was conducted on 2026-08-06. The codebase contains **103 identified issues** across 442+ source files. For a billion-dollar SaaS, addressing the **Critical and High issues** (40 items) should be the immediate priority before any public launch.
>
> **The Critical security issues alone could lead to complete account takeover if exploited.**
