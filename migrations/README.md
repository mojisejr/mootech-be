# migrations/

Versioned, **idempotent, additive-only** schema SQL for this repo.

`DB_SYNCHRONIZE=false` on every environment (local + prod), and the app has no
schema-migration runner — so these files are the single source of schema change.
The `src/migration/` NestJS module is unrelated: it is a one-time **data-import**
endpoint, not DDL.

## The one rule that makes "lift to prod in one shot" safe

**The file you run on local is the exact file you run on prod.** No retyping in `psql`,
no ad-hoc `ALTER`. If it wasn't run from a file here, it doesn't go to prod.

Every statement must be:

- **additive** — `ADD COLUMN` / `CREATE TABLE` / `CREATE INDEX` only. Never DROP, ALTER an
  existing column, or RENAME. Existing rows are never touched.
- **idempotent** — `IF NOT EXISTS` on everything. Re-running is a no-op.

## Run

```bash
# local (testenv pg, from mootech-fe testenv stack): DATABASE_URL points at :5433
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/<file>.sql

# prod: same command, DATABASE_URL points at prod. Run by ฟีม only, in a separate ticket
# (#222), after the flow has passed ฟีม's local test. Never run by an agent.
```

## Files

| file | ticket | adds |
|---|---|---|
| `2026-08-09_onboarding-consent.sql` | mootech-fe#233 | `user.onboarded_at`, `user.onboarding_goal`, table `consent` |
