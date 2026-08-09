#!/usr/bin/env bash
#
# Restore a Chronicle/Avuno backup produced by backup.sh.
#
# Also the drill script: run it against a scratch database on a schedule. A
# backup that has never been restored is an assumption, not a backup.
#
# Usage:
#   ./restore.sh <backup-file> <target-database-url>
#   ./restore.sh --drill <backup-file>     # restore into a scratch DB and verify
#
# Required for encrypted backups (.age):
#   BACKUP_AGE_IDENTITY   path to the age private key file
#
# The target URL must be passed explicitly. It is deliberately NOT read from
# DATABASE_URL, so a mistyped command cannot overwrite production.

set -Eeuo pipefail

log()  { printf '[restore] %s\n' "$*"; }
fail() { printf '[restore] ERROR: %s\n' "$*" >&2; exit 1; }

DRILL=0
if [ "${1:-}" = "--drill" ]; then
  DRILL=1
  BACKUP_FILE="${2:-}"
  TARGET_URL="${DRILL_DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/chronicle_restore_drill}"
else
  BACKUP_FILE="${1:-}"
  TARGET_URL="${2:-}"
fi

[ -n "$BACKUP_FILE" ] || fail "usage: restore.sh <backup-file> <target-database-url>"
[ -f "$BACKUP_FILE" ] || fail "no such file: $BACKUP_FILE"
[ -n "$TARGET_URL" ]  || fail "target database url is required"

case "$TARGET_URL" in
  *prod*|*production*)
    if [ "${I_UNDERSTAND_THIS_OVERWRITES_PRODUCTION:-}" != "yes" ]; then
      fail "target looks like production. Re-run with I_UNDERSTAND_THIS_OVERWRITES_PRODUCTION=yes"
    fi
    ;;
esac

command -v pg_restore >/dev/null 2>&1 || fail "pg_restore not found (install postgresql-client)"
command -v psql       >/dev/null 2>&1 || fail "psql not found (install postgresql-client)"

PLAINTEXT="$BACKUP_FILE"
TEMP=""
cleanup() { [ -n "$TEMP" ] && [ -f "$TEMP" ] && rm -f "$TEMP"; }
trap cleanup EXIT

# ── Decrypt ──────────────────────────────────────────────────────────────────
case "$BACKUP_FILE" in
  *.age)
    command -v age >/dev/null 2>&1 || fail "backup is encrypted but 'age' is not installed"
    [ -n "${BACKUP_AGE_IDENTITY:-}" ] || fail "BACKUP_AGE_IDENTITY (private key path) is required"
    [ -f "$BACKUP_AGE_IDENTITY" ] || fail "no such key file: $BACKUP_AGE_IDENTITY"
    TEMP="$(mktemp)"
    log "decrypting"
    age --decrypt --identity "$BACKUP_AGE_IDENTITY" --output "$TEMP" "$BACKUP_FILE"
    PLAINTEXT="$TEMP"
    ;;
esac

# ── Restore ──────────────────────────────────────────────────────────────────
log "restoring into ${TARGET_URL%%\?*}"

# --clean --if-exists so the drill is repeatable against a dirty database.
# Exit code 1 means "completed with warnings" (typically missing roles), which
# is expected for a --no-owner dump.
set +e
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "$TARGET_URL" "$PLAINTEXT"
RC=$?
set -e
[ "$RC" -gt 1 ] && fail "pg_restore failed with exit code $RC"

# ── Verify ───────────────────────────────────────────────────────────────────
# A restore that "succeeded" but produced an empty schema is the failure mode
# that matters, and it is exactly what nobody checks.
TABLES=$(psql "$TARGET_URL" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
log "restored schema has ${TABLES} tables"
[ "${TABLES:-0}" -lt 10 ] && fail "expected a substantial schema, found ${TABLES} tables"

USERS=$(psql "$TARGET_URL" -tAc "SELECT count(*) FROM users" 2>/dev/null || echo "n/a")
log "users table row count: ${USERS}"

if [ "$DRILL" = "1" ]; then
  log "DRILL PASSED — backup is restorable"
fi

log "done"
