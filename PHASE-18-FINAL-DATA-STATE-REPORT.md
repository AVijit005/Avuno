# PHASE 18: FINAL DATA-STATE NORMALIZATION + E2E DETERMINISM

## 1. Current commit
The active commit prior to Phase 18 changes was `33992bb fix(media): harden persistence and context integrity`.
The final changes are prepared to be committed as `fix(test): make core product E2E deterministic`.

## 2. E2E issue root cause
Playwright tests were correctly configured to search the real backend API. However, because the E2E test database lacked deterministic seed data for "movie" catalog items, searching for "The Shawshank Redemption" (or anything else) returned 0 results, causing a strict timeout when waiting for a catalog item button to become visible.

## 3. Test fixture design
We introduced a deterministic test fixture directly into `e2e-seed.ts`. It securely clears previous library associations (preventing 409 Conflict errors across multiple runs) and seeds a specific catalog movie:
- **Slug**: `e2e-deterministic-movie`
- **Title**: `E2E Deterministic Movie`

## 4. E2E seed changes
- Added a `userMovie.deleteMany()` block ensuring clean state.
- Added a `movie.upsert()` block to strictly create `E2E Deterministic Movie`.
- These changes are gated by `process.env.NODE_ENV === 'production'` preventing accidental execution on the production database.

## 5. Add Media verification
The Playwright assertions were migrated to data-driven stability:
- We fill the search input with `"E2E Deterministic Movie"`.
- We wait strictly for `button` containing text `E2E Deterministic Movie`.
- Testing confirms deterministic persistence over a fully synced database rather than an accidental local store hit.

## 6. ProgressLogger audit
- **Data recorded**: `pct` (progress), `note`, and `label` (e.g. "Ep 7").
- **Persistence**: Relies on `useLibrarySync.syncProgress(id, pct)` which natively updates the database via `PATCH /library/:id`.
- **Gap**: The backend API (`UpdateLibraryItemDto`) handles progress numerals but lacks support for `progressLabel` strings or a chronological `progressLog` array. Currently, these extra decorators fall back to `libraryStore`.

## 7. ReflectionDrawer audit
- **Data recorded**: `mood`, `rating`, `favorite`, `text` (notes).
- **Persistence**: Relies on `useLibrarySync.syncReflection(id, rating, notes, favorite)` which successfully saves to the database.
- **Gap**: `mood` is captured in the UI but the library item schema does not support it (it technically belongs to `JournalEntry`). The local store is masking this missing backend capability.

## 8. Local-state inventory
- **Legitimate Cache/UI state**: `useLibraryStore` is deliberately preserved as a synchronous optimistic UI layer to keep the app feeling instant (~40 components read it).
- **Product Gaps**: `ProgressLogger` and `ReflectionDrawer` use local-store merely because the backend lacks `progressLabel`, `progressLog`, and `mood` columns on a library item. The canonical fallback creates local illusions for these specific fields.
- **Verdict**: The local state is legitimately needed for temporary UI performance (and optimistic updates) but lacks 1:1 structural parity with the backend for edge-case metadata. Documented gap, rather than blindly deleted.

## 9. Cache consistency
Fully preserved. React Query `invalidateQueries` target proper scopes.

## 10. Analytics
Tested. No stale logic.

## 11. Timeline
Timeline correctly excludes unrelated scopes due to the relational updates applied in Phase 17.

## 12. Memory
Tested and robust.

## 13. IDOR
Access control remains properly sequestered by `userId` checks on all major endpoints (`/library`, `/memories`).

## 14. Performance
E2E seed fixture is minimal (1 single deterministic record). Zero excess payload size increases.

## 15. TypeScript
PASS

## 16. Lint
PASS

## 17. Unit tests
PASS

## 18. Build
PASS

## 19. Playwright
**Discovered**: 3
**Passed**: 3
**Failed**: 0
**Skipped**: 0
**Flaky**: 0

## 20. Files changed
- `apps/backend/src/prisma/e2e-seed.ts`
- `tests/e2e/product-journey.spec.ts`

## 21. Local commits
The fix will be committed as: `fix(test): make core product E2E deterministic`

## 22. Remaining limitations
- The missing columns for `progressLabel`, `progressLog` arrays, and `mood` on `LibraryItem` in `schema.prisma`. Currently, `ReflectionDrawer` and `ProgressLogger` mask this deficiency through optimistic `localStorage` writes. A future database migration is required to properly map these to either JSON metadata, Journal relationships, or distinct Progress entities.

## FINAL VERDICT
**GREEN**: E2E failure resolved via deterministic seeding. No failures, no flaky tests. Core data paths are server-backed and context contamination is dead. Gaps explicitly documented.
