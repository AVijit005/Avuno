# Production Readiness — Chronicle Backend v1.0.0

## Architecture Overview

```
┌─────────────┐     ┌──────────┐     ┌────────────┐
│   Client    │────▶│   API    │────▶│ PostgreSQL │
└─────────────┘     │ (NestJS) │     ├────────────┤
                    │          │────▶│   Redis    │
                    │   Port   │     ├────────────┤
                    │   3000   │────▶│  MinIO/S3  │
                    └──────────┘     └────────────┘
                           │
                    ┌──────┴──────┐
                    │   BullMQ    │
                    │  (Workers)  │
                    └─────────────┘
```

## Scaling

- **Horizontal**: Add API replicas behind a load balancer
- **Database**: Add PostgreSQL read replicas for analytics queries
- **Redis**: Cluster mode for high availability
- **Workers**: Scale BullMQ consumers independently

## Monitoring Stack

- **Prometheus**: Scrapes \`GET /api/metrics\` every 15s
- **Grafana**: Visualize metrics with pre-built dashboards
- **Loki**: Aggregate structured JSON logs
- **Tempo**: Trace distributed requests

## Security

- Helmet middleware for HTTP headers
- CORS restricted to frontend origin
- JWT with configurable expiry and rotation
- Refresh tokens in httpOnly cookies
- Argon2id password hashing
- Input validation on all endpoints
- Rate limiting recommended (see \`RateLimitAuditService\`)
- File upload validation (MIME, size)

## Backup Strategy

- **Database**: Daily \`pg_dump\` via \`BackupService\`
- **Media**: Daily \`tar\` archive of upload directory
- **Retention**: 7 daily, 4 weekly, 3 monthly backups
- **Restore**: Verified weekly via \`RestoreService\`
