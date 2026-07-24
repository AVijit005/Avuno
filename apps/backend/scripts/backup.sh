#!/bin/bash
# Chronicle Automated Database Backup Script
# Run this via a daily cron job (e.g., 0 3 * * * /path/to/backup.sh)

set -e

# Load environment variables if .env exists
if [ -f "../.env" ]; then
  export $(cat ../.env | grep -v '#' | awk '/=/ {print $1}')
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set. Please set it in your environment or .env file."
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/chronicle_db_$TIMESTAMP.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $TIMESTAMP..."

# Use pg_dump to dump the database and gzip it
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

echo "Backup completed successfully: $BACKUP_FILE"

# Optional: Clean up backups older than 30 days
find "$BACKUP_DIR" -type f -name "chronicle_db_*.sql.gz" -mtime +30 -exec rm {} \;
echo "Cleaned up old backups."
