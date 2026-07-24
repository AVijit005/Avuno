# Operations Guide — Chronicle Backend v1.0.0

## Daily Operations

### Health Monitoring

\`\`\`bash
# Basic health
curl http://localhost:3000/api/health

# Full health check
curl http://localhost:3000/api/metrics/health

# Prometheus metrics
curl http://localhost:3000/api/metrics

# System metrics
curl http://localhost:3000/api/metrics/system
\`\`\`

### Database Maintenance

\`\`\`bash
# Run Prisma migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database via Prisma Studio
npx prisma studio
\`\`\`

### Queue Management

BullMQ queues are managed automatically. To inspect:

\`\`\`bash
# Redis queue inspection
redis-cli keys 'chronicle:*'
redis-cli llen chronicle:notification:wait
\`\`\`

## Incident Response

1. Check health endpoints
2. Review logs: \`docker compose logs --tail=100 api\`
3. Check Redis connectivity
4. Check database connectivity
5. Review recent deployments
6. Escalate if needed

## Scaling

- **Vertical**: Increase container resources (CPU/RAM)
- **Horizontal**: Add API replicas, use read replicas
- **Redis**: Enable cluster mode
- **Storage**: Migrate from local to S3-compatible
