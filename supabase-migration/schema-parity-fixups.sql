-- Schema Parity Audit corrective migration (#mootech-supabase-schema-parity-audit)
-- 2026-06-13. Restores boolean DEFAULTs that pgloader dropped during tinyint(1)->boolean
-- conversion. MySQL had `tinyint(4) NOT NULL DEFAULT '0'` (or '1'); pgloader migrated the
-- type to boolean NOT NULL but did not translate the DEFAULT, so INSERTs that rely on the
-- default (e.g. new-user register omitting is_refresh) hit a NOT NULL violation -> 500.
--
-- Audit scope: full diff of mootech_table.sql DDL (87 tables, 582 cols) vs live Supabase
-- introspection. ONLY discrepancy class found = these 18 dropped boolean defaults.
-- Verified parity (no action needed): column names/casing, types (22 tinyint->boolean all
-- correct), nullability, column presence, secondary indexes (all 9 present), FK (source had
-- 0), unique (source had 0), row counts.
--
-- SET DEFAULT is metadata-only: it does NOT rewrite the table and does NOT change existing
-- rows. Idempotent (re-running sets the same default). Safe to apply on a populated table.

ALTER TABLE "chinese_calendar"   ALTER COLUMN "is_thai_buddhist_day"    SET DEFAULT false;
ALTER TABLE "chinese_calendar"   ALTER COLUMN "is_chinese_buddhist_day" SET DEFAULT false;
ALTER TABLE "chinese_calendar"   ALTER COLUMN "is_doctor_day"           SET DEFAULT false;
ALTER TABLE "chinese_calendar"   ALTER COLUMN "is_good_day"             SET DEFAULT false;
ALTER TABLE "chinese_calendar"   ALTER COLUMN "is_thian_chai"           SET DEFAULT false;
ALTER TABLE "log_calculate"      ALTER COLUMN "is_remember_time"        SET DEFAULT false;
ALTER TABLE "log_love_mate"      ALTER COLUMN "is_remember_time"        SET DEFAULT false;
ALTER TABLE "log_love_mate"      ALTER COLUMN "your_is_remember_time"   SET DEFAULT false;
ALTER TABLE "log_matching"       ALTER COLUMN "is_remember_time"        SET DEFAULT false;
ALTER TABLE "log_matching"       ALTER COLUMN "your_is_remember_time"   SET DEFAULT false;
ALTER TABLE "log_work_vibe"      ALTER COLUMN "is_remember_time"        SET DEFAULT false;
ALTER TABLE "log_work_vibe"      ALTER COLUMN "your_is_remember_time"   SET DEFAULT false;
ALTER TABLE "member_with_friend" ALTER COLUMN "is_remember_time"        SET DEFAULT false;
ALTER TABLE "member_with_friend" ALTER COLUMN "is_member"               SET DEFAULT false;
ALTER TABLE "member_with_friend" ALTER COLUMN "is_notify"               SET DEFAULT false;
ALTER TABLE "payment_code"       ALTER COLUMN "is_active"               SET DEFAULT true;
ALTER TABLE "user"               ALTER COLUMN "is_remember_time"        SET DEFAULT false;
ALTER TABLE "user"               ALTER COLUMN "is_refresh"              SET DEFAULT false;

-- ── follow-up (#mootech-supabase-schema-parity-audit) ──────────────────────────
-- uuid PK generation gap: 11 entities use TypeORM @PrimaryGeneratedColumn('uuid').
-- On MySQL TypeORM generated the uuid client-side; on Postgres TypeORM relies on a
-- DB-side DEFAULT (uuid_generate_v4/gen_random_uuid). pgloader created these PKs as
-- plain varchar(36) with NO default → INSERT omitting the PK → null violates NOT NULL
-- (e.g. user.user_id on new-user register). Restore the DB-side generator.
-- gen_random_uuid()::text = 36 chars (fits varchar(36)). Default only fires when the
-- app omits the PK (which these entities always do), so it is correct + harmless.
ALTER TABLE "user"                    ALTER COLUMN "user_id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "user_provider"           ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "user_matching"           ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "member_with_friend"      ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "member_payment_code"     ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "member_payment_code_log" ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "member_payment_log"      ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "log_member_pay_as_use"   ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "payment"                 ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "otp"                      ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "employee"                ALTER COLUMN "id"      SET DEFAULT gen_random_uuid()::text;
