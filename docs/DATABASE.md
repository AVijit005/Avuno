# Database

## Technologies
- **Engine**: PostgreSQL 16
- **ORM**: Prisma
- **Schema Location**: `apps/backend/prisma/schema.prisma`

## Core Models
- `User`: The core owner of data.
- `Memory`: Explicitly saved memory.
- `JournalEntry`: Chronological written record.
- `FavoriteQuote`: Saved textual quote.
- `MemoryMedia`: Join table between Memory and Media entities (Movie, TvShow, Book, Game, etc.).
- `TimelineEvent`: System recorded events.

## Important Constraints & Relationships
- **Ownership**: Almost all models have a strict relation to `User` and `userId` that must be validated in queries.
- **Memory Linking**: 
  - `journalId` is nullable.
  - `quoteId` is nullable.
  - **CRITICAL**: `journalId` and `quoteId` cannot both be present on the same Memory simultaneously. This is enforced to separate the source of evidence.
- **Cascade Rules**: Deleting a User cascades to their Memories, Journals, etc.

## Migrations Workflow
Migrations are managed via Prisma. 

### Local Development
To apply migrations and sync the Prisma Client:
\`\`\`bash
cd apps/backend
bunx prisma migrate dev
\`\`\`

### Safe Migration Workflow
- Never run `prisma migrate dev` against production databases.
- Always review the generated SQL in the `prisma/migrations` folder before committing.
- Do not run destructive database commands against production.
