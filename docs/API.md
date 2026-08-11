# Chronicle - API Design

## Overview
Avuno relies on a NestJS REST API using custom DTOs and Controllers.

## API Response Format
All paginated endpoints return ItemsPage<T>:
`	s
export interface ItemsPage<T> {
  items: T[];
  hasMore: boolean;
  cursor: string | null;
}
`

## Key Modules
- **Auth**: /api/auth (Stateless JWT, Google OAuth, Refresh tokens via HTTP-Only Cookies).
- **Journal**: /api/journal (Entries).
- **Memories**: /api/memories (Vault).
- **Library**: /api/library (Media items).
- **Timeline**: /api/timeline (Timeline events).

## Authentication Flow
1. POST /api/auth/login -> Returns Access Token, Sets Refresh Token Cookie.
2. GET /api/auth/google -> Initiates OAuth.
3. GET /api/auth/google/callback -> Returns Token and redirects.
