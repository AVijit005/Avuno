# Backup & Restore

Backups run as a **sidecar container**, not inside the API process.

An earlier version of this document described a `BackupService` with a daily
schedule and a `POST /api/deployment/backup/database` endpoint. Neither
existed: the service had zero call sites, there was no scheduler, and no
controller exposed it. No backup was ever taken. The service has been removed
in favour of the scripts below, which are exercised in CI.

## Taking a backup

```bash
cd apps/backend
./scripts/backup.sh                 # take a backup
./scripts/backup.sh --verify-only   # check configuration only
```

In production this runs automatically: the `backup` service in
`docker-compose.prod.yml` takes a daily dump at 03:00 UTC.

### Configuration

| Variable                | Required             | Purpose                                                        |
| ----------------------- | -------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`          | yes                  | Source database                                                |
| `BACKUP_AGE_RECIPIENT`  | strongly recommended | age **public** key. Without it dumps are written in plaintext. |
| `BACKUP_S3_URI`         | strongly recommended | Offsite destination, e.g. `s3://avuno-backups/postgres`        |
| `BACKUP_DIR`            | no                   | Local staging directory (default `./backups`)                  |
| `BACKUP_RETENTION_DAYS` | no                   | Local retention (default 7)                                    |

Generate an encryption keypair:

```bash
age-keygen -o backup-key.txt
```

Put the **public** key in `BACKUP_AGE_RECIPIENT`. Keep the private key offline
and out of this repository — a key stored beside the backups protects against
nothing.

Dumps use `pg_dump --format=custom`, so `pg_restore` can restore selectively
rather than only replaying the whole file.

## Restoring

```bash
cd apps/backend
BACKUP_AGE_IDENTITY=/secure/backup-key.txt \
  ./scripts/restore.sh ./backups/chronicle-daily-20260808T030000Z.dump.age \
  postgresql://user:pass@host:5432/target_db
```

The target URL must be passed explicitly; it is deliberately not read from
`DATABASE_URL` so a mistyped command cannot overwrite production. A URL
containing `prod` requires `I_UNDERSTAND_THIS_OVERWRITES_PRODUCTION=yes`.

## Restore drills

**A backup that has never been restored is an assumption, not a backup.**

```bash
DRILL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chronicle_restore_drill \
  ./scripts/restore.sh --drill ./backups/<latest>.dump.age
```

The drill restores into a scratch database and then verifies the result: it
fails if fewer than 10 tables were created, which is the failure mode nobody
checks — a restore that "succeeds" but produces an empty schema.

Run this **quarterly at minimum**, and after any change to the schema, the
Postgres version, or the backup scripts.

## What is not covered yet

- **Point-in-time recovery.** These are daily snapshots, so the worst-case data
  loss is 24 hours. If that RPO is too high, enable managed PITR at the
  database provider; the sidecar is a provider-independent second line, not a
  replacement.
- **Uploaded media.** `BACKUP_S3_URI` covers the database only. Object storage
  should be replicated at the bucket level.
