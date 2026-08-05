---
kind: configuration_system
name: NestJS Config Module with Environment Validation
category: configuration_system
scope:
    - '**'
source_files:
    - apps/backend/src/config/configuration.ts
    - apps/backend/src/config/env.validation.ts
    - apps/backend/src/config/config.module.ts
    - apps/backend/.env.example
    - apps/backend/.env
    - apps/backend/src/deployment/environment-validation.service.ts
    - apps/backend/src/deployment/production-configuration.service.ts
---

The Chronicle backend uses a NestJS-based configuration system centered on `@nestjs/config` with strict environment variable validation and layered defaults. Configuration is loaded at application bootstrap through a dedicated `ConfigModule` that registers a global configuration factory, validates all environment variables against a class-validator schema, and caches the result for reuse across modules.

**Configuration loading pipeline:**
- `configuration.ts` exports a factory function that reads values from `process.env` and returns a typed configuration object with sensible defaults (e.g., `NODE_ENV=development`, `PORT=3000`, Redis on localhost, local storage driver).
- `env.validation.ts` defines an `EnvironmentVariables` class using `class-validator` decorators (`@IsString`, `@IsNumber`, `@MinLength(32)`, `@IsBoolean`) to enforce types, ranges, and minimum lengths for every expected environment variable. The `validate()` function converts raw `process.env` into this class and throws on any mismatch.
- `config.module.ts` wires everything together via `NestConfigModule.forRoot({ isGlobal: true, load: [configuration], validate, cache: true })`, making config available everywhere through `ConfigService`.

**Environment variable categories and conventions:**
- Core runtime: `NODE_ENV`, `PORT`, `API_PREFIX`, `FRONTEND_URL`
- Database: `DATABASE_URL` (required, Prisma connection string)
- Redis/BullMQ: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `BULLMQ_PREFIX`
- JWT/Auth: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (both require ≥32 chars), `SESSION_TTL_SECONDS`, `COOKIE_DOMAIN`
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `OAUTH_ENCRYPTION_KEY`
- Storage: `STORAGE_DRIVER` (`local` or `s3`), S3 credentials under `S3_*` prefix
- Email verification: `EMAIL_VERIFICATION_REQUIRED`, `EMAIL_VERIFICATION_TTL_SECONDS`, `APP_BASE_URL`, success/failure URLs
- Feature flags: `SWAGGER_ENABLED` (disabled in production by default)

**Validation and enforcement:**
- Startup-time validation via `class-validator` throws immediately if required variables are missing or malformed.
- Runtime checks in `configuration.ts` throw an error if `OAUTH_ENCRYPTION_KEY` is absent in non-development/non-test environments.
- `environment-validation.service.ts` provides a diagnostic report listing required vs optional variables and whether they are present.
- `production-configuration.service.ts` generates a recommended configuration report comparing current settings against production best practices.

**Configuration files:**
- `.env.example` serves as the authoritative template documenting every supported variable with comments explaining purpose and generation commands (e.g., `openssl rand -hex 32`).
- `.env` contains development values and is committed only with placeholder/test values.
- Docker Compose files (`docker-compose.dev.yml`, `docker-compose.prod.yml`) inject environment variables per environment.

**Access pattern:**
Modules consume configuration exclusively through Nest's `ConfigService.get<T>()` rather than reading `process.env` directly, ensuring type safety and centralized validation.