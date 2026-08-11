============================================================
AVUNO — AI DEVELOPER HANDOFF
============================================================

If you are a new AI/developer opening this repository, read this file FIRST.

CURRENT PRODUCT:
Avuno 2.0

CURRENT COMPLETED PHASE:
4C-5

CURRENT STATE:
Timeline ↔ Memory integration complete (attach/detach via TimelineEvent.memoryId, audited)

AI:
DEFERRED

CURRENT GIT COMMIT:
fe1b3d1

NEXT RECOMMENDED PHASE:
Phase 4C-6 Final UI/UX polish (or Next feature phase as approved)

## 1. What Avuno is

Avuno is a premium personal media, experience, and memory SaaS. It is designed to act as a chronological and intentional record of a user's life and media experiences.

## 2. Product philosophy

Avuno relies on a Truth-First model, which mandates that the system must never fabricate, synthesize, or invent user memories, relationships, or insights.

## 3. Truth-First model

LEVEL 1: USER EXPLICIT (e.g., Journal, Memory, Bookmark, Collection) - Explicit user creation is required.
LEVEL 2: SYSTEM RECORDED (e.g., Timeline events) - Factual milestones recorded by the system.
LEVEL 3: SYSTEM DERIVED (e.g., Analytics, Insights) - Calculated from factual data.
LEVEL 4: AI - CURRENTLY DEFERRED.

Never present system-derived information as user-authored memory.
Never fabricate memories, relationships, insights, personalization, or emotional interpretations.

## 4. Current architecture

Avuno is a monorepo containing a modern web application:

- **Frontend**: React (Vite/TanStack), using Tailwind CSS and an OKLCH-based Design System (PremiumGlass).
- **Backend**: NestJS, providing robust REST APIs.
- **Database**: PostgreSQL with Prisma ORM.

## 5. Current product state

Memory creation from Journal is real backend functionality using `POST /memories`.
Memory Detail and Memory Vault are implemented. Memory Graph, Universe, and AI are NOT implemented.

## 6. Completed phases

- Phase 0: Truth-First cleanup
- Phase 0.1: Truth/data integrity cleanup
- Phase 1: Design System 2.0
- Phase 2: Navigation / structural corrections
- Phase 3: Home Truth-First correction
- Phase 4B-0: Media Detail Memory safety mitigation
- Phase 4B-1: Memory relationship architecture
- Phase 4B-2: Memory backend foundation
- Phase 4C-0: Journal + Memory UX discovery
- Phase 4C-1: Journal experience polish
- Phase 4C-2: Memory Capsule creation
- Phase 4C-3: Memory Detail + Memory Vault foundation
- Phase 4C-4: Media ↔ Memory integration (attach/detach via MemoryMedia)
- Phase 4C-5: Timeline ↔ Memory integration (attach/detach via TimelineEvent.memoryId)

## 7. Current phase

Phase 4C-5 is complete and audited.
Next phase is Phase 4C-6 (or future roadmap items).

## 8. Current git commit

The baseline commit for Phase 4C-5 audit completion is `fe1b3d1`.

## 9. Frontend

Vite, React, Tailwind CSS, TanStack Query, TanStack Router.

## 10. Backend

NestJS, TypeScript, REST API, BullMQ (Redis).

## 11. Database

PostgreSQL 16, Prisma. See `apps/backend/prisma/schema.prisma` for the authoritative schema.
Constraints to note: `journalId` and `quoteId` in Memory cannot both be present.

## 12. API

REST endpoints hosted by NestJS. Base path: `/api`.
Key modules: auth, media, journal, memories, timeline.

## 13. Docker

Docker Compose is used for local development and production.

- `docker-compose.yml`: Local DB (postgres) and Redis.

## 14. Local development

Run `bun install`.
Frontend: `bun run dev`
Backend: `cd apps/backend && bun run start:dev`

## 15. Environment variables

See `.env.example` in `apps/backend`.
Variables include `DATABASE_URL`, `REDIS_PASSWORD`, `JWT_SECRET`, etc.

## 16. VPS

NOT VERIFIED FROM REPOSITORY

## 17. Cloudflare

NOT VERIFIED FROM REPOSITORY (Cloudflare CDN/Proxy mentioned in bootstrap notes, but full config not verified).

## 18. Production architecture

NOT VERIFIED FROM REPOSITORY

## 19. Deployment

NOT VERIFIED FROM REPOSITORY

## 20. Security

- Backend ownership checks are authoritative. Frontend hiding is NOT authorization.
- Memory and Journal privacy is enforced via user ID matching.
- CORS is configured safely without wildcards in production.

## 21. Testing

Testing uses Vitest and Playwright.
Run: `bun run test`

## 22. Design system

Design System 2.0. Uses OKLCH tokens, Hyper-Glass, PremiumGlass, PremiumButton. Premium does not mean excessive effects.

## 23. Known limitations

- Memory Edit UI disabled
- Memory Delete UI disabled
- Quote frontend integration incomplete

## 24. Future roadmap

- 4C-6: UI/UX polish
  Future: Quote experience, Memory search, Memory Graph, Memory Universe.

## 25. AI status

AI: NOT IMPLEMENTED. AI is intentionally deferred. Future AI must never fabricate memories.

## 26. What NOT to do

- Do not fabricate data.
- Do not invent relationships.
- Do not add AI without approval.
- Do not modify production blindly.
- Do not run destructive production DB commands.
- Do not expose secrets.
- Do not skip authorization.

## 27. Exact recommended next phase

Phase 4C-6: Final UI/UX polish (or next approved roadmap step).
