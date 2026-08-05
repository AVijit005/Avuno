---
kind: build_system
name: Monorepo Build & CI/CD Pipeline
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - .github/workflows/ci.yml
    - .github/workflows/release.yml
    - apps/backend/package.json
    - apps/backend/Dockerfile
    - apps/backend/nest-cli.json
    - bunfig.toml
    - docs/DEPLOYMENT.md
---

## What system/approach is used

The project uses a Node.js monorepo with two primary build targets:
- **Frontend**: TanStack Start + Vite (React SPA) built via `vite build`, configured through `@lovable.dev/vite-tanstack-config` with PWA support via `vite-plugin-pwa`
- **Backend**: NestJS application built via `nest build` with Prisma ORM, Docker containerization, and Bun for testing

Build orchestration is handled through npm scripts at both root (`package.json`) and backend (`apps/backend/package.json`) levels, with GitHub Actions CI/CD pipelines for automated testing, security scanning, and release management.

## Key files and packages

**Root-level build configuration:**
- `package.json` - Frontend build scripts (dev, build, test, preview)
- `vite.config.ts` - Vite/TanStack Start configuration with PWA setup
- `bunfig.toml` - Supply chain protection with 24-hour minimum release age
- `.github/workflows/ci.yml` - Comprehensive CI pipeline
- `.github/workflows/release.yml` - Tag-based release automation

**Backend build configuration:**
- `apps/backend/package.json` - NestJS build scripts and dependencies
- `apps/backend/Dockerfile` - Multi-stage production Docker build
- `apps/backend/nest-cli.json` - NestJS compiler configuration
- `apps/backend/tsconfig.build.json` - TypeScript build configuration
- `apps/backend/docker-compose*.yml` - Development and production orchestration

**Testing infrastructure:**
- `tests/visual/run.py` - Visual regression testing harness
- Backend test suite using Bun's built-in test runner
- Playwright E2E tests in root `tests/` directory

## Architecture and conventions

**Multi-stage Docker builds**: The backend uses a two-stage Docker process where the builder stage compiles TypeScript and generates Prisma client, while the runner stage contains only production artifacts with a non-root user for security.

**Environment-specific builds**: Separate build modes for development (`build:dev`) and production with distinct configurations. The frontend proxies API calls to localhost:3000 during development.

**Supply chain security**: Enforced through `minimumReleaseAge = 86400` in bunfig.toml, preventing installation of packages published less than 24 hours ago, with explicit exceptions for Lovable development tools.

**Prisma-first database management**: Database schema migrations are managed through Prisma with automated generation and deployment in CI/CD pipelines.

## Conventions and constraints

**Node.js version enforcement**: Both frontend and backend require Node.js 22+ as specified in workflow configurations and package engines.

**Security gates in CI**: The pipeline enforces several production safety checks:
- No CASCADE foreign keys on media tables (verified via SQL query)
- No hardcoded secrets or localStorage usage in analytics routes
- CORS must not allow wildcard origins (`CORS_ORIGIN === 'true'`)
- CSP must not include unsafe directives (`unsafe-eval|unsafe-inline`)
- Secret scanning via TruffleHog
- Dependency vulnerability auditing via `npm audit --audit-level=high`

**Docker health checks**: Production containers include health check endpoints that verify service availability via `/api/health`.

**Tag-based releases**: Releases are triggered by pushing tags matching `v*` pattern, automatically building Docker images and creating GitHub releases with generated notes.

**Development vs production separation**: Clear separation between development workflows (hot reload, debugging) and production builds (optimized, minimal artifacts, security hardening).

**Containerized dependency management**: All services run in Docker containers with consistent environments across development, testing, and production.