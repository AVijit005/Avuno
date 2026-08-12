#!/usr/bin/env bash
#
# Encrypted PostgreSQL backup for Chronicle/Avuno.
#
# Runs OUTSIDE the API process, deliberately. The previous approach was an
# in-app BackupService that: died with the application, blocked the event loop
# for the whole dump (execSync), competed with request traffic for memory, and
# would have run once per replica. It also had zero call sites and no
# scheduler, so no backup was ever actually taken.
#
# Usage:
#   ./backup.sh                 # take a backup
#   ./backup.sh --verify-only   # check config and dependencies, take nothing
#
# Required:
#   DATABASE_URL          postgres connection string
#
# Recommended (backups are written UNENCRYPTED without it):
#   BACKUP_AGE_RECIPIENT  age public key; encrypt with `age`
#   BACKUP_S3_URI         e.g. s3://avuno-backups/postgres  (needs awscli)
#
# Optional:
#   BACKUP_DIR            local staging dir (default ./backups)
#   BACKUP_RETENTION_DAYS local retention (default 7)
#   BACKUP_TAG            filename tag (default daily)

set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_TAG="${BACKUP_TAG:-daily}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
VERIFY_ONLY=0
[ "${1:-}" = "--verify-only" ] && VERIFY_ONLY=1

log()  { printf '[backup] %s\n' "$*"; }
fail() { printf '[backup] ERROR: %s\n' "$*" >&2; exit 1; }

# Never let a partially written dump look like a good backup.
WORKFILE=""
cleanup() { [ -n "$WORKFILE" ] && [ -f "$WORKFILE" ] && rm -f "$WORKFILE"; }
trap cleanup EXIT
trap 'fail "interrupted"' INT TERM

# ── Preflight ────────────────────────────────────────────────────────────────
command -v pg_dump >/dev/null 2>&1 || fail "pg_dump not found (install postgresql-client)"
[ -n "${DATABASE_URL:-}" ] || fail "DATABASE_URL is not set"

ENCRYPT=1
if [ -z "${BACKUP_AGE_RECIPIENT:-}" ]; then
  # Enforce encryption by default for production
  if [ "${NODE_ENV:-production}" = "production" ] && [ "${ALLOW_PLAINTEXT_BACKUP:-0}" != "1" ]; then
    fail "BACKUP_AGE_RECIPIENT is not set. Production backups MUST be encrypted. To explicitly allow plaintext backups, set ALLOW_PLAINTEXT_BACKUP=1."
  fi
  ENCRYPT=0
  log "WARNING: BACKUP_AGE_RECIPIENT not set — the dump will NOT be encrypted."
  log "         A plaintext dump contains every user record. Set a recipient:"
  log "           age-keygen -o backup-key.txt   # keep the private key OFFLINE"
elif ! command -v age >/dev/null 2>&1; then
  fail "BACKUP_AGE_RECIPIENT is set but 'age' is not installed"
fi

if [ -n "${BACKUP_S3_URI:-}" ] && ! command -v aws >/dev/null 2>&1; then
  fail "BACKUP_S3_URI is set but the aws CLI is not installed"
fi

if [ "$VERIFY_ONLY" = "1" ]; then
  log "preflight OK (encryption: $([ "$ENCRYPT" = 1 ] && echo on || echo OFF), \
offsite: $([ -n "${BACKUP_S3_URI:-}" ] && echo on || echo off))"
  exit 0
fi

# ── Dump ─────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
BASENAME="chronicle-${BACKUP_TAG}-${TIMESTAMP}.dump"
[ "$ENCRYPT" = 1 ] && BASENAME="${BASENAME}.age"
TARGET="${BACKUP_DIR}/${BASENAME}"
WORKFILE="${TARGET}.partial"

log "dumping to ${TARGET}"

# -Fc: custom format. Compressed, and restorable selectively with pg_restore —
# a plain .sql dump can only be replayed whole.
if [ "$ENCRYPT" = 1 ]; then
  pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" \
    | age --recipient "$BACKUP_AGE_RECIPIENT" --output "$WORKFILE"
else
  pg_dump --format=custom --no-owner --no-privileges --file "$WORKFILE" "$DATABASE_URL"
fi

# A dump that is suspiciously small usually means pg_dump failed mid-stream but
# the pipeline still exited 0.
SIZE=$(wc -c < "$WORKFILE" | tr -d ' ')
[ "$SIZE" -lt 1024 ] && fail "dump is only ${SIZE} bytes — treating as failed"

mv "$WORKFILE" "$TARGET"
WORKFILE=""
log "wrote ${TARGET} (${SIZE} bytes)"

# ── Offsite ──────────────────────────────────────────────────────────────────
# A backup that lives only on the machine it backs up is not a backup.
if [ -n "${BACKUP_S3_URI:-}" ]; then
  log "uploading to ${BACKUP_S3_URI}/${BASENAME}"
  aws s3 cp "$TARGET" "${BACKUP_S3_URI}/${BASENAME}" --only-show-errors
  log "upload complete"
else
  log "WARNING: BACKUP_S3_URI not set — this backup exists only on this host."
fi

# ── Retention ────────────────────────────────────────────────────────────────
find "$BACKUP_DIR" -name 'chronicle-*.dump*' -type f -mtime "+${BACKUP_RETENTION_DAYS}" -delete 2>/dev/null || true

log "done"
