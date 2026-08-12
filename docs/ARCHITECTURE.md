# Chronicle - Architecture & Database

## System Architecture

Avuno is a monorepo separated into a React Frontend (/src) and a NestJS Backend (/apps/backend).

## Core Models (Prisma)

- **User**: Core identity.
- **JournalEntry**: User's written thoughts.
- **Memory**: Curated capsules. Enforced evidence constraint.
- **MemoryMedia**: Junction table linking Memory to Canonical Media (Movie, Book, etc).
- **TimelineEvent**: Chronological system events. Can link to Memory.

## The Memory Evidence CHECK Constraint

A raw SQL migration enforces that journalId and quoteId are mutually exclusive on a Memory record.

## Security

- API uses Stateless Custom JWT (Access/Refresh tokens).
- Google OAuth is implemented with a stateless redirect callback.
- Cookies are used for HTTP-only refresh tokens.
