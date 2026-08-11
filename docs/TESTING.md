# Testing

## Tools
- **Unit/Integration (Frontend)**: Vitest
- **E2E / Browser (Frontend)**: Playwright
- **Unit/Integration (Backend)**: Bun Test

## Test Runner Separation
The frontend utilizes a strict separation of test runners:
- **Vitest** is configured to execute unit and integration tests only (`*.test.ts`, `*.spec.ts`), explicitly excluding the E2E directory to prevent runner collisions.
- **Playwright** is exclusively configured to discover and execute tests within the `tests/e2e` directory. 

## Scripts

### Frontend
- **Type Checking**: `bun run typecheck`
- **Linting**: `bun run lint`
- **Unit Tests**: `bun run test` (Vitest)
- **E2E Tests**: `bunx playwright test` (Playwright)
- **Visual Tests**: `bun run test:visual`

### Backend
- **Unit/Integration Tests**: `cd apps/backend && bun test`
- **Linting**: `cd apps/backend && bun run lint`

## Coverage
Test suites exist to verify Memory relationships, Memory creation, and migration configurations. Only tests that actually exist in the `test/` or `tests/` directories should be claimed to run.
