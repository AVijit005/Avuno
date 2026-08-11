# Chronicle - Database Schema & Rules

## The PostgreSQL Schema

Avuno uses PostgreSQL 16. The schema is managed by Prisma ORM (pps/backend/prisma/schema.prisma).

### Core Tables
- User: Identity (email, hashed password, google ID, role).
- JournalEntry: Core raw timeline log.
- TimelineEvent: Event stream tracking everything.
- Memory: Curated highlights.
- MemoryMedia: Junction linking Memories to canonical media (Movie, TV Show, Book, etc).
- Media tables (Movie, TvShow, Book, Game, etc.): Mirrored metadata from external APIs.

### The Truth-First Constraint (CRITICAL)
Located in migration: pps/backend/prisma/migrations/20260811105001_add_memory_evidence_check/migration.sql

`sql
ALTER TABLE "Memory"
ADD CONSTRAINT memory_evidence_check
CHECK (
  ("journalId" IS NOT NULL AND "quoteId" IS NULL) OR
  ("quoteId" IS NOT NULL AND "journalId" IS NULL) OR
  ("journalId" IS NULL AND "quoteId" IS NULL)
);
`
**Why:** A Memory must come from exactly zero or one piece of source evidence. It cannot be both a Quote and a Journal.

## Prisma Best Practices
- **No cascade deletes across domain boundaries:** Media should not be deleted just because a Memory is deleted.
- **Relational Integrity:** journalId on Memory enforces that the memory was intentionally derived from that journal entry.
