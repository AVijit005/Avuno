# Security

## Authentication
Authentication is managed via Custom Auth and Google OAuth 2.0. State is persisted using HttpOnly cookies or `localStorage` depending on the client flow, with backend validation via JWT.

## Authorization
- **Backend Ownership**: Backend ownership checks are authoritative. The backend always verifies `userId` against the requested resource's `userId`.
- **Frontend Hiding**: Hiding UI elements on the frontend is NOT authorization. The backend guards the data.

## Privacy
- **Memory & Journal Privacy**: Content like Memories and Journal entries are inherently private to the creator.
- **IDOR Protection**: All endpoints interacting with user-specific data require strict ownership validation to prevent Insecure Direct Object Reference (IDOR) attacks.

## Database Constraints
- Cascading deletes are enforced to ensure that wiping a user safely wipes all their private data (Memories, Journals, etc.).
- Strict constraints exist preventing conflicting evidence on a single Memory (e.g., both `journalId` and `quoteId`).

## Secrets Handling
Secrets (e.g., `DATABASE_URL`, `JWT_SECRET`, OAuth credentials) are loaded via `.env` files and validated heavily on application bootstrap using `Joi` or `Zod`. Never commit secrets to the repository.
