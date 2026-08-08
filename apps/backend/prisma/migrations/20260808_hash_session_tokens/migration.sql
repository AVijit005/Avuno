-- Sessions previously stored the raw refresh token in `sessions.token`.
-- RefreshToken already stored only a SHA-256 hash, so keeping the plaintext
-- here negated that entirely: any read of this table yielded directly
-- replayable credentials for every active user.
--
-- Existing rows cannot be migrated in place: hashing requires the plaintext,
-- and the whole point is that we must stop holding it. Rather than rewrite
-- them, revoke them. Affected users are simply asked to sign in again, which
-- is the correct trade for removing live credentials from the database.
--
-- The application now writes sha256(token) to the same column; no schema
-- change is required, so this migration is data-only.

UPDATE "sessions"
SET "status" = 'REVOKED',
    "deleted_at" = NOW()
WHERE "status" = 'ACTIVE';

-- Refresh tokens are hashed already, but they are paired with the sessions
-- revoked above. Revoke them together so a rotation cannot resurrect a
-- session that no longer exists.
UPDATE "refresh_tokens"
SET "revoked_at" = NOW()
WHERE "revoked_at" IS NULL;
