# Troubleshooting

## Database Unavailable
**SYMPTOM**: Backend throws `PrismaClientInitializationError` or connection refused.
**CHECK**: Ensure Docker container is running.
**COMMAND**: `cd apps/backend && docker compose ps`
**EXPECTED RESULT**: `chronicle-postgres` should be `Up`.
**RECOVERY**: Run `docker compose up -d postgres`.

## Migration Problems
**SYMPTOM**: Errors indicating database is out of sync or missing relations.
**CHECK**: Check migration history.
**COMMAND**: `bunx prisma migrate status`
**EXPECTED RESULT**: All migrations applied.
**RECOVERY**: Run `bunx prisma migrate dev` (only on local!).

## Cloudflare / DNS / SSL
**SYMPTOM**: Production or staging domains failing to resolve.
**RECOVERY**: Not verified from repository. Check external Cloudflare dashboard.

## CORS Errors
**SYMPTOM**: Browser console shows CORS preflight failure.
**CHECK**: Verify backend `.env` has correct `CORS_ORIGIN`.
**EXPECTED RESULT**: `CORS_ORIGIN` matches frontend URL (no wildcards allowed with credentials).
**RECOVERY**: Update `.env` and restart backend server.
