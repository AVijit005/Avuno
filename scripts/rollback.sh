#!/usr/bin/env bash
#
# Safe local rollback helper for the Avuno Backend.
# Identifies the current revision and the previous known revision, asks for
# confirmation, rolls back the code locally, and restarts the backend via docker compose.
#
# Usage:
#   ./scripts/rollback.sh

set -euo pipefail

log() { printf '\033[1;34m[rollback]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[rollback]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[rollback] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

# Preflight checks
command -v git >/dev/null 2>&1 || fail "git not found"
command -v docker >/dev/null 2>&1 || fail "docker not found"
command -v curl >/dev/null 2>&1 || fail "curl not found"

cd "$(dirname "$0")/.." || fail "Could not change to project root"

# Identify revisions
CURRENT_REV=$(git rev-parse --short HEAD)
PREVIOUS_REV=$(git log --skip=1 -n 1 --format="%h" || echo "")

[ -z "$PREVIOUS_REV" ] && fail "Could not identify a previous revision to roll back to."

echo "============================================================"
echo "                   SAFE ROLLBACK HELPER                     "
echo "============================================================"
echo "Current Revision : $CURRENT_REV"
echo "Target Revision  : $PREVIOUS_REV"
echo ""
echo "WARNING: Application rollback != database rollback."
echo "Prisma migrations are generally forward-only. If the bad deployment"
echo "included destructive database migrations, rolling back the code WILL NOT"
echo "undo the database changes. You must restore the database from a backup"
echo "manually if the schema has fundamentally diverged."
echo "============================================================"
echo ""

read -p "Are you sure you want to HARD RESET to $PREVIOUS_REV? Uncommitted changes will be lost! (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log "Rollback aborted."
  exit 0
fi

log "Rolling back working tree to $PREVIOUS_REV..."
git reset --hard "$PREVIOUS_REV"

log "Building and starting services..."
cd apps/backend
docker compose build
docker compose up -d

log "Waiting for backend health..."
RETRIES=15
HEALTH_URL="http://localhost:3000/api/health"

for i in $(seq 1 $RETRIES); do
  if curl -s -f "$HEALTH_URL" > /dev/null; then
    log "Backend is HEALTHY."
    exit 0
  fi
  warn "Waiting for backend... ($i/$RETRIES)"
  sleep 3
done

fail "Backend failed to become healthy at $HEALTH_URL after $(($RETRIES * 3)) seconds. Check docker logs."
