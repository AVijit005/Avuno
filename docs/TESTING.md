# Testing

## Tools
- **Frontend**: Vitest (Unit/Component), Playwright (Visual Regression / E2E).
- **Backend**: Bun Test (Unit/Integration).

## Scripts

### Frontend
- **Type Checking**: `bun run typecheck`
- **Linting**: `bun run lint`
- **Unit Tests**: `bun run test` (Vitest)
- **Visual Tests**: `bun run test:visual`

### Backend
- **Unit/Integration Tests**: `cd apps/backend && bun test`
- **Linting**: `cd apps/backend && bun run lint`

## Coverage
Test suites exist to verify Memory relationships, Memory creation, and migration configurations. Only tests that actually exist in the `test/` or `tests/` directories should be claimed to run.
