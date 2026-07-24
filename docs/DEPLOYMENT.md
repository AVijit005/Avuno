# Deployment Guide — Chronicle Backend v1.0.0

## Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- PostgreSQL 16+
- Redis 7+
- MinIO or S3-compatible storage (optional)

## Quick Start (Development)

\`\`\`bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Start development server
npm run start:dev
\`\`\`

## Production Deployment

\`\`\`bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d

# Apply database migrations
docker compose exec api npx prisma db push

# Check health
curl http://localhost:3000/api/health
\`\`\`

## Environment Variables

See `.env.example` for all required and optional variables.

### Required
- \`DATABASE_URL\` — PostgreSQL connection string
- \`JWT_ACCESS_SECRET\` — 256-bit random secret
- \`JWT_REFRESH_SECRET\` — 256-bit random secret (different from above)

### Optional but recommended
- \`REDIS_HOST\`, \`REDIS_PORT\`, \`REDIS_PASSWORD\`
- \`CORS_ORIGIN\` — Frontend URL
- \`UPLOAD_ROOT\` — File storage path
- \`GOOGLE_CLIENT_ID\`, \`GOOGLE_CLIENT_SECRET\` — Google OAuth

## Health Endpoints

| Endpoint | Description |
|---|---|
| \`GET /api/health\` | Basic health check (DB, memory) |
| \`GET /api/metrics/health\` | Full health (DB, Redis, BullMQ, Storage) |
| \`GET /api/metrics\` | Prometheus metrics |
| \`GET /api/metrics/system\` | CPU, memory, event loop |

## Queue Workers

BullMQ workers start automatically with the application:

- \`notification\` — Push notifications
- \`email\` — Email delivery
- \`wrapped\` — Year-in-review generation
- \`analytics\` — Analytics computation
- \`cleanup\` — Expired file cleanup

## Cron Jobs

| Schedule | Job | Description |
|---|---|---|
| Daily 00:00 | \`scheduler.handleCron()\` | Maintenance tasks |
| Daily 02:00 | \`digest.service.generateDigest()\` | Daily digest |
| Weekly 03:00 | \`cleanup.process()\` | Expired file purge |
