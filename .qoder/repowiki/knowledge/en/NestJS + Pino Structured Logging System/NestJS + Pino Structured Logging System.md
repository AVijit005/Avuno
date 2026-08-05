---
kind: logging_system
name: NestJS + Pino Structured Logging System
category: logging_system
scope:
    - '**'
source_files:
    - apps/backend/src/logger/logger.module.ts
    - apps/backend/src/app.bootstrap.ts
    - apps/backend/src/observability/logging.service.ts
    - apps/backend/src/common/filters/all-exceptions.filter.ts
    - apps/backend/src/app.module.ts
---

The backend uses a structured logging system built on NestJS with `nestjs-pino` (Pino HTTP) as the core logger, complemented by an in-memory buffered `LoggingService` for application-level events.

**Framework and configuration**
- `LoggerModule` (`apps/backend/src/logger/logger.module.ts`) configures `nestjs-pino` via `PinoLoggerModule.forRoot`. In production the log level is set to `info`; in non-production it switches to `debug` and enables `pino-pretty` with single-line output and colorization. Request/response serializers attach only `id`, `method`, `url` for requests and `statusCode` for responses.
- The bootstrap (`apps/backend/src/app.bootstrap.ts`) injects the global NestJS logger via `app.useLogger(logger)` and registers `LoggerErrorInterceptor` globally through `app.useGlobalInterceptors(new LoggerErrorInterceptor())`. A request-id middleware attaches a UUID to each request (`req.id`) and echoes it back via the `x-request-id` header, which flows into all log entries.
- `AppModule` imports `LoggerModule` so every service can inject the shared logger.

**Structured log schema**
- `LoggingService` (`apps/backend/src/observability/logging.service.ts`) defines a `LogEntry` interface with fields: `timestamp`, `level`, `message`, `requestId`, `correlationId`, `userId`, `executionTimeMs`, `route`, `method`, `statusCode`, `queue`, `jobId`, `scheduler`, plus arbitrary extra keys. Each entry gets a generated `correlationId` (UUID) if not supplied, and the service buffers up to 500 entries in memory with `getRecentLogs()` and `clearLogs()` helpers. Entries are emitted by calling the appropriate NestJS `Logger` method with `JSON.stringify(entry)`.

**Exception handling and error logging**
- `AllExceptionsFilter` (`apps/backend/src/common/filters/all-exceptions.filter.ts`) catches all unhandled exceptions and logs them via `this.logger.error({...})` including `requestId`, `status`, `code`, `message`, `path`, `method`, and `stack`. It translates Prisma-specific errors into domain codes (`UNIQUE_VIOLATION`, `RECORD_NOT_FOUND`, `VALIDATION_ERROR`, etc.) and exposes only a safe subset of codes in client responses.

**Usage patterns across services**
- Services consistently instantiate a per-class logger via `private readonly logger = new Logger(ClassName.name)` and use `logger.debug()`, `logger.log()`, `logger.warn()`, and `logger.error()` with structured metadata objects (e.g., `{ requestId, userId, collectionId }`). Examples include `CollectionEventService`, `LocalStorageService`, `S3StorageService`, `ResendEmailTransportService`, and `InMemoryEventPublisher`.

**Conventions and constraints**
- Log levels: `debug` for development-only traces; `info` for normal operational events; `warn` for recoverable issues; `error` for failures and exceptions.
- Every log entry should include contextual metadata (at minimum `requestId`); correlation IDs are auto-generated when missing.
- Sensitive data is not serialized — request/response serializers explicitly limit fields to `id`, `method`, `url`, and `statusCode`.
- Production disables pretty-printing and sets the minimum level to `info`.