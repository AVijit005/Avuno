# Deployment

## Architecture Overview

Avuno uses separate deployment pipelines for frontend and backend.

### Frontend (Cloudflare)

```
Git push (authorized) → Cloudflare Workers/Pages → Automatic deployment
```

- **Build target**: Nitro with Cloudflare preset (configured via `@lovable.dev/vite-tanstack-config`)
- **Build command**: `bun run build`
- **Output directory**: `.output/`
- **Production branch**: `main`
- **Wrangler config**: Auto-generated at build time (`.output/server/wrangler.json`)
- **No `wrangler.toml` is committed** — deployment trigger is the Git push itself

> **IMPORTANT**: Deployment only occurs when an authorized Git push is
> performed to the production branch. There is no manual Cloudflare
> deploy command in the repository.

### Backend (VPS + Docker)

```
SSH into VPS → git pull → Docker rebuild/restart → Health verification
```

- **Dockerfile**: `apps/backend/Dockerfile` (3-stage: Builder → Deps → Runner)
- **Production Compose**: `apps/backend/docker-compose.prod.yml`
- **Services**: PostgreSQL 16, Redis 7, MinIO (S3-compatible), API, Backup sidecar
- **Health endpoint**: `GET /api/health` (checks heap memory + database connectivity)
- **Container user**: Non-root `chronicle` (UID 1001)
- **Port**: 3000 (internal)

> **IMPORTANT**: The backend does NOT automatically update from a Git
> push. VPS deployment requires manual SSH access.

## VPS Deployment Procedure

Exact VPS deployment commands require runtime verification and are not
yet confirmed from repository configuration alone. The expected flow is:

1. SSH into VPS
2. Navigate to the repository directory
3. `git pull origin main` (pull latest approved commit)
4. `docker compose -f docker-compose.prod.yml build`
5. `docker compose -f docker-compose.prod.yml up -d`
6. `docker compose -f docker-compose.prod.yml ps` (verify `api` becomes healthy, `migrate` exited 0)
7. Verify `GET /api/health` returns healthy status

> **MIGRATION LIFECYCLE**: The `docker-compose.prod.yml` defines a dedicated `migrate` init-container. It waits for PostgreSQL to be healthy, executes `prisma migrate deploy`, and exits. The `api` container explicitly depends on `migrate` completing successfully. If a migration fails, the `api` container will never start, preventing silent data corruption or application crashes.

## Rollback

A safe local rollback helper is provided in the repository:

```bash
./scripts/rollback.sh
```

This script will:

1. Identify the previous known revision.
2. Warn about database migration limitations (Prisma migrations are forward-only; a destructive migration requires a manual database restore).
3. Request explicit confirmation before `git reset --hard`.
4. Rebuild and restart the Docker containers.
5. Wait for and verify the `GET /api/health` endpoint.

> Classification: **P0 OPERATIONAL HARDENING** — Rollback script implemented and available.

## Environment Variables

See `apps/backend/.env.example` for the complete list.

Critical production variables (all required):

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_PASSWORD` — Redis authentication
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — Token signing
- `OAUTH_ENCRYPTION_KEY` — Provider token encryption
- `CORS_ORIGIN` — Exact frontend origins (no wildcards allowed)
- `FRONTEND_URL` — OAuth redirect base URL
- `COOKIE_DOMAIN` — Cookie domain scope

## Backups

- **Script**: `apps/backend/scripts/backup.sh`
- **Restore**: `apps/backend/scripts/restore.sh`
- **Schedule**: Daily at 03:00 UTC via backup sidecar container
- **Encryption**: Required in production via `BACKUP_AGE_RECIPIENT` (fail-closed)
- **Offsite**: Optional S3 upload via `BACKUP_S3_URI`
- **Retention**: Configurable via `BACKUP_RETENTION_DAYS` (default: 7)

## CI/CD

- **GitHub Actions CI** (`.github/workflows/ci.yml`):
  Frontend typecheck, lint, test, build; Backend lint, build, test (with live Postgres/Redis); Docker image build + smoke test; Security audit (TruffleHog); Launch Gate (CORS, CSP, secrets verification)

- **GitHub Actions Release** (`.github/workflows/release.yml`):
  Triggered by `v*` tags. Waits for CI Launch Gate. Builds and pushes Docker image to GHCR (`ghcr.io`). Creates GitHub Release.

## Local Development

```bash
bun install
cd apps/backend && docker compose up -d postgres redis   # Start infra
cd apps/backend && bunx prisma migrate dev                # Apply migrations
cd apps/backend && bun run start:dev                      # Start backend
bun run dev                                               # Start frontend (root)
```
