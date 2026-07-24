# Runbook — Chronicle Backend v1.0.0

## Alerts

### High Error Rate (>5%)

1. Check \`GET /api/metrics\` for error count
2. Review recent logs: \`docker compose logs --tail=500 api\`
3. Check database connectivity
4. Check Redis connectivity
5. Review if a recent deployment caused the issue

### API Latency > 1s (p95)

1. Check \`GET /api/metrics/system\` for CPU/memory
2. Review database query performance
3. Check for N+1 queries in recent changes
4. Scale horizontally if needed

### Queue Backlog > 1000

1. Inspect queue: \`redis-cli llen chronicle:{queue}:wait\`
2. Check worker logs
3. Increase worker concurrency if needed
4. Restart workers: \`docker compose restart api\`

### Disk Space < 20%

1. Clean old backups: \`find ./backups -mtime +7 -delete\`
2. Clean old uploads via cleanup cron
3. Increase volume size
4. Set up log rotation

## Scheduled Maintenance

### Weekly (Sunday 04:00 UTC)

1. Rotate logs
2. Clean expired uploads
3. Run database vacuum
4. Verify backup integrity

### Monthly (1st of month 04:00 UTC)

1. Full security audit
2. Dependency audit: \`npm audit\`
3. Performance audit
4. Review error trends
5. Update runbook if needed

## Rollback Procedure

\`\`\`bash
# Revert to previous Docker image
docker compose stop api
docker compose -f docker-compose.prod.yml up -d api
# If using orchestration:
kubectl rollout undo deployment/chronicle-api
\`\`\`
