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
  - QUERY PARAMS: `?mediaId=<uuid>` (filter by related media), `?journalId=<uuid>` (filter by linked journal)
- `GET /memories/:id`
  - PURPOSE: Retrieve a single Memory Detail.
  - AUTH: Required (Ownership checked)
- `POST /memories`
  - PURPOSE: Create a new Memory.
  - AUTH: Required
  - IMPORTANT VALIDATION: Optionally accepts `journalId` or `quoteId`, but not both. MemoryMedia can be linked.

## Memory ↔ Media Relationship (Phase 4C-4)
- `POST /library/:id/memories/:memoryId?type=<mediaType>`
  - PURPOSE: Attach an existing Memory to a library item (creates MemoryMedia relationship).
  - AUTH: Required. Both Memory and library item must belong to the authenticated user.
  - MEDIA TYPE: Must be one of: movie, tvShow, anime, book, game, musicAlbum, podcast, course.
  - DUPLICATE: Silently ignored (P2002).
- `DELETE /library/:id/memories/:memoryId?type=<mediaType>`
  - PURPOSE: Detach a Memory from a library item (removes MemoryMedia relationship).
  - AUTH: Required. Both Memory and library item must belong to the authenticated user.
  - IMPORTANT: Only the MemoryMedia join row is removed. Neither the Memory nor the Media is deleted.

## Journal
- Endpoints exist to manage Journal entries (Creation, Retrieval, Update, Deletion).
- Required AUTH on all paths.

## Media
- Endpoints exist for retrieving media metadata (Movies, TV Shows, Anime, Books, Games, Podcasts, Courses, Music).

## Timeline
- Endpoints exist for retrieving timeline milestones.

## Analytics & Insights
- Endpoints exist for retrieving system-derived analytics data.
