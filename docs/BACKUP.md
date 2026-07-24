# Backup & Restore — Chronicle Backend

## Database Backup

\`\`\`bash
# Manual backup
docker compose exec postgres pg_dump -U chronicle chronicle > backup.sql

# Via BackupService (automated)
curl -X POST http://localhost:3000/api/deployment/backup/database
\`\`\`

## Media Backup

\`\`\`bash
# Manual backup
tar -czf media-backup.tar.gz ./uploads

# Via BackupService
curl -X POST http://localhost:3000/api/deployment/backup/media
\`\`\`

## Restore

\`\`\`bash
# Database restore
cat backup.sql | docker compose exec -T postgres psql -U chronicle chronicle

# Media restore
tar -xzf media-backup.tar.gz -C ./uploads
\`\`\`

## Schedule

| Frequency | Type | Tool |
|---|---|---|
| Daily (00:00 UTC) | Database | \`BackupService.backupDatabase('daily')\` |
| Daily (01:00 UTC) | Media | \`BackupService.backupMedia()\` |
| Weekly (Sunday) | Full | Full application backup |
