---
kind: error_handling
name: Error Handling — NestJS Global Filter, Domain Exceptions, and Frontend Boundaries
category: error_handling
scope:
    - '**'
source_files:
    - apps/backend/src/common/filters/all-exceptions.filter.ts
    - apps/backend/src/common/exceptions/business.exception.ts
    - apps/backend/src/common/exceptions/not-found.exception.ts
    - apps/backend/src/common/exceptions/conflict.exception.ts
    - apps/backend/src/common/exceptions/forbidden.exception.ts
    - apps/backend/src/common/exceptions/validation.exception.ts
    - apps/backend/src/common/interceptors/response.interceptor.ts
    - apps/backend/src/app.module.ts
    - apps/backend/src/app.bootstrap.ts
    - apps/backend/src/main.ts
    - src/components/common/ErrorBoundary.tsx
    - src/components/common/PremiumErrorState.tsx
    - src/lib/error-capture.ts
    - src/lib/error-page.ts
    - src/lib/lovable-error-reporting.ts
    - src/server.ts
---

This repository implements error handling across two layers: a NestJS backend with a centralized exception filter and typed domain exceptions, and a React/TanStack frontend that uses React Error Boundaries plus server-side SSR error recovery.

### Backend (NestJS)
- **Global exception filter**: `apps/backend/src/common/filters/all-exceptions.filter.ts` extends `BaseExceptionFilter` and is registered globally via `APP_FILTER` in `app.module.ts`. It logs structured errors (requestId, status, code, message, path, method, stack) and returns a uniform JSON body `{ statusCode, message, requestId, timestamp, path }`, optionally including a `code` field only when the code is in a safe allowlist (`UNIQUE_VIOLATION`, `RECORD_NOT_FOUND`, `VALIDATION_ERROR`).
- **Domain exception hierarchy**: All business errors extend a base `BusinessException` (`apps/backend/src/common/exceptions/business.exception.ts`) which itself extends NestJS `HttpException` and carries a stable `code` string. Specialized subclasses are provided for common cases:
  - `NotFoundException` (404, default code `NOT_FOUND`)
  - `ConflictException` (409, default code `CONFLICT`)
  - `ForbiddenException` (403, default code `FORBIDDEN`)
  - `ValidationException` (400, default code `VALIDATION_ERROR`, optional per-field `errors` map)
- **Prisma error mapping**: The global filter translates Prisma client errors into HTTP-appropriate responses: unique constraint violations → 409 `UNIQUE_VIOLATION`, missing records → 404 `RECORD_NOT_FOUND`, foreign-key / required-relation issues → 400, table/column not found → 500, Rust panics → 500 `DB_ENGINE_ERROR`, initialization failures → 503 `DB_UNAVAILABLE`, and validation errors → 400 `VALIDATION_ERROR`.
- **Response envelope**: `apps/backend/src/common/interceptors/response.interceptor.ts` wraps every successful response in `{ data, requestId, timestamp }`, skipping wrapping for null/undefined (204 intent), binary buffers, and already-paginated payloads (`data` + `meta`).
- **Startup wiring**: `app.bootstrap.ts` registers the global `LoggerErrorInterceptor`, sets global prefix, helmet, CORS, cookie parser, request-id middleware, and enables shutdown hooks. `main.ts` boots the app and catches bootstrap-time errors.

### Frontend (React / TanStack Start)
- **React Error Boundary**: `src/components/common/ErrorBoundary.tsx` is a class-based boundary that renders `PremiumErrorState` on render-phase errors, offering a retry/reload action. It delegates to `PremiumErrorState.tsx` for a consistent UI shell.
- **SSR error capture**: `src/lib/error-capture.ts` installs global `error` and `unhandledrejection` listeners to record the last thrown error within a 5-second TTL so the server can recover it later.
- **Server-side fallback page**: `src/lib/error-page.ts` exports a minimal HTML page rendered when h3 swallows an SSR throw into a generic 500 JSON response. `src/server.ts` detects this pattern (`"unhandled":true,"message":"HTTPError"`) and returns the HTML page instead of leaking the JSON payload.
- **Error reporting hook**: `src/lib/lovable-error-reporting.ts` provides `reportLovableError(error, context)` which posts to a `window.__lovableEvents.captureException` channel with mechanism `react_error_boundary`, severity `error`, and route context.
- **API proxy error handling**: `src/server.ts` wraps the upstream fetch in try/catch and returns a 502 JSON `{ message: "Failed to connect to backend server." }` when the backend is unreachable.

### Conventions observed
- All user-facing API errors go through the global `AllExceptionsFilter`; services should throw one of the domain `BusinessException` subclasses rather than raw `Error` objects.
- Error codes are intentionally limited to a safe allowlist before being exposed in the response body; internal Prisma codes are never leaked to clients.
- Successful responses are uniformly wrapped by `ResponseInterceptor`, giving consumers a stable shape with `requestId` and `timestamp`.
- Frontend errors are surfaced via React Error Boundaries and optionally reported through the Lovable event channel; catastrophic SSR failures fall back to a static HTML page.