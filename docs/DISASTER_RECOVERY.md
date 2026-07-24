# Disaster Recovery — Chronicle Backend v1.0.0

## Recovery Scenarios

### 1. Database Corruption

1. Stop API: \`docker compose stop api\`
2. Restore from latest backup: \`psql -U chronicle chronicle < latest.sql\`
3. Verify data integrity: \`docker compose exec api node dist/main\`
4. Resume API: \`docker compose start api\`
5. **RTO**: < 30 minutes \| **RPO**: < 24 hours

### 2. Complete Service Failure

1. Re-provision infrastructure via Terraform/Pulumi
2. Restore PostgreSQL from S3/offsite backup
3. Restore media from S3/offsite backup
4. Deploy latest API image
5. Run database migrations: \`npx prisma db push\`
6. Verify health: \`curl http://localhost:3000/api/health\`
7. **RTO**: < 2 hours \| **RPO**: < 24 hours

### 3. Redis Data Loss

Redis is a cache — no permanent data loss. BullMQ jobs may retry.
1. Restart Redis: \`docker compose restart redis\`
2. Verify connectivity via health endpoint

### 4. Security Breach

1. Rotate all secrets (JWT, DB, Redis)
2. Revoke all refresh tokens
3. Force re-authentication for all users
4. Audit logs for suspicious activity
5. Patch vulnerability
6. Deploy patched version

## Recovery Playbook

1. Assess damage scope
2. Isolate affected systems
3. Restore from clean backup
4. Verify data integrity
5. Run security audit
6. Resume service
7. Post-mortem analysis
