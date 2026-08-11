# Avuno 2.0 Testing Guide

## End-to-End Testing (Playwright)

To run the authenticated E2E tests, you must first start the local development environment and run the database seed script to provision the test user.

### Prerequisites

1. The local backend must be running.
   ```bash
   cd apps/backend
   bun run start:dev
   ```

2. The local database must be migrated to the latest schema.
   ```bash
   cd apps/backend
   bunx prisma migrate dev
   ```

3. You must run the E2E seed script to create the verified test user. This script uses the local `DATABASE_URL` to securely inject the test user into the local database (bypassing the email verification guard safely).
   ```bash
   cd apps/backend
   bun run src/prisma/e2e-seed.ts
   ```

### Running Tests

Once the test user is seeded, run the Playwright test suite from the root of the repository:
```bash
bunx playwright test
```

The E2E suite (`authenticated-journey.spec.ts`) covers the entire authenticated product journey (Login, Library, Journal, Memories, Timeline, Analytics, and Logout) in a single continuous session to avoid triggering local rate limiters on the authentication endpoints.

### Seed Script Security
The E2E seed script (`e2e-seed.ts`) contains an explicit environment guard and will refuse to execute if `NODE_ENV` is set to `production`. Do NOT modify this guard. The test user credentials are for local testing only.
