-- Migration: onboarding + consent  (mootech-fe#233)
-- 2026-08-09 · goo
--
-- WHAT: adds the columns/table that the first-run onboarding flow writes to.
--   1. user.onboarded_at    — first-login gate. NULL = has not finished first-run.
--   2. user.onboarding_goal — the one goal (1-of-6) chosen on IntentCheckScreen.
--   3. consent (table)       — PDPA acceptance record (auditable history, not current state).
--
-- 🔴 PROD-SAFETY CONTRACT (this is the SAME file that will be run on prod later, by ฟีม):
--   • additive only         — no DROP, no ALTER-of-existing, no RENAME. Existing rows untouched.
--   • idempotent            — every statement is IF NOT EXISTS. Safe to run more than once
--                             (prod may need a re-run). Re-running is a no-op.
--   • DB_SYNCHRONIZE=false   on both local and prod → the app never creates these itself;
--                             this file is the ONLY thing that adds them.
--   • ADD COLUMN ... (no DEFAULT, no NOT NULL) is metadata-only on Postgres — it does NOT
--     rewrite the table and does NOT lock-scan existing rows. Safe on a populated table.
--
-- HOW TO RUN (identical local and prod — see migrations/README.md):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/2026-08-09_onboarding-consent.sql
--
-- Table/column names are the TypeORM default-strategy names (class/prop verbatim):
--   entity User  -> table "user"   · entity Consent -> table "consent".

BEGIN;

-- 1 + 2 · user: first-login gate + chosen goal (both nullable; existing users stay NULL = onboarded_at gate re-runs first-run for them, which is correct — they never completed v2 first-run)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboarded_at"    text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboarding_goal" text;

-- 3 · consent: one row per PDPA acceptance (history, not a flag). No PII beyond the FK user_id.
CREATE TABLE IF NOT EXISTS "consent" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        text NOT NULL,
  "accepted_at"    text NOT NULL,
  "policy_version" text NOT NULL
);

-- lookup by user (reset-user.sh deletes by user_id; app reads latest by user_id)
CREATE INDEX IF NOT EXISTS "idx_consent_user_id" ON "consent" ("user_id");

COMMIT;
