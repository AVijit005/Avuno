# API Reference

Base Path: `/api`
Authentication: Bearer Token (JWT) or HttpOnly Cookies (Verified via NestJS Guards)

*Note: The following endpoints are a verified subset of the actual backend implementation.*

## Authentication
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Logout and clear sessions

## Memory (Verified)
- `GET /memories`
  - PURPOSE: Retrieve the Memory Vault/list.
  - AUTH: Required
- `GET /memories/:id`
  - PURPOSE: Retrieve a single Memory Detail.
  - AUTH: Required (Ownership checked)
- `POST /memories`
  - PURPOSE: Create a new Memory.
  - AUTH: Required
  - IMPORTANT VALIDATION: Optionally accepts `journalId` or `quoteId`, but not both. MemoryMedia can be linked.

## Journal
- Endpoints exist to manage Journal entries (Creation, Retrieval, Update, Deletion).
- Required AUTH on all paths.

## Media
- Endpoints exist for retrieving media metadata (Movies, TV Shows, Anime, Books, Games, Podcasts, Courses, Music).

## Timeline
- Endpoints exist for retrieving timeline milestones.

## Analytics & Insights
- Endpoints exist for retrieving system-derived analytics data.
