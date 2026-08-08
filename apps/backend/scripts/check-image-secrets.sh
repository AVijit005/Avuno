#!/usr/bin/env bash
# Determine whether any locally built image has apps/backend/.env baked into a
# layer.
#
# Background: Dockerfile.dev used `COPY . .` with no .dockerignore, so any
# image built from it before that fix contains live JWT signing secrets, the
# OAuth encryption key and the database URL in an immutable layer. Deleting the
# file in a later layer does NOT remove it — it stays readable via
# `docker history` or by extracting the layer tarball.
#
# Usage:  ./scripts/check-image-secrets.sh
# Exit 0 = no affected image found. Exit 1 = rotate the secrets.

set -uo pipefail

echo "Scanning local images for a baked-in .env ..."

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker CLI not available."
  echo "On Windows, enable Docker Desktop -> Settings -> Resources -> WSL Integration."
  exit 2
fi

found=0

# Any image built from this repo's backend context.
images=$(docker images --format '{{.Repository}}:{{.Tag}}' 2>/dev/null \
  | grep -Ei 'chronicle|avuno|backend' || true)

if [ -z "$images" ]; then
  echo "No chronicle/avuno/backend images found locally."
else
  while IFS= read -r image; do
    [ -z "$image" ] && continue
    echo "  checking $image"
    if docker run --rm --entrypoint sh "$image" -c 'test -f /app/.env' 2>/dev/null; then
      echo "  !! $image contains /app/.env"
      found=1
    fi
    if docker history --no-trunc "$image" 2>/dev/null | grep -q 'COPY \. \.'; then
      echo "  !! $image has a 'COPY . .' layer (built before the .dockerignore fix)"
      found=1
    fi
  done <<< "$images"
fi

echo
if [ "$found" -eq 1 ]; then
  cat <<'EOF'
RESULT: AFFECTED IMAGE FOUND — treat these as compromised and rotate now:
  - JWT_ACCESS_SECRET      (invalidates all access tokens)
  - JWT_REFRESH_SECRET     (invalidates all refresh tokens; logs everyone out)
  - OAUTH_ENCRYPTION_KEY   (re-encrypt stored provider tokens)
  - GOOGLE_CLIENT_SECRET   (rotate in Google Cloud Console)
  - database password

Then remove the offending images:
  docker rmi <image>
  docker builder prune -af
EOF
  exit 1
fi

echo "RESULT: clean — no image with a baked-in .env was found."
echo "The production Dockerfile uses selective COPY and was never affected."
exit 0
