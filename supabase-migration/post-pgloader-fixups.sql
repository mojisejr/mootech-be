-- Post-pgloader fixups for the MySQL -> Supabase (Postgres) migration.
-- Run ONCE after pgloader completes. Idempotent-ish (safe to re-run; type alters
-- become no-ops once boolean). Captures two classes of fixup:
--   (1) tinyint(MySQL) -> smallint(pgloader) but entities expect boolean  -> ALTER to boolean
--   (2) missing secondary indexes the original MySQL lacked                -> CREATE INDEX
-- Mission: #mootech-fullstack-supabase-fold (Phase 1+2)

-- (1) boolean columns (entities declare `: boolean`; pgloader made them smallint)
ALTER TABLE analytic_life          ALTER COLUMN is_above              DROP DEFAULT;
ALTER TABLE analytic_life          ALTER COLUMN is_above              TYPE boolean USING (is_above <> 0);
ALTER TABLE chinese_calendar       ALTER COLUMN is_thai_buddhist_day  DROP DEFAULT;
ALTER TABLE chinese_calendar       ALTER COLUMN is_thai_buddhist_day  TYPE boolean USING (is_thai_buddhist_day <> 0);
ALTER TABLE chinese_calendar       ALTER COLUMN is_chinese_buddhist_day DROP DEFAULT;
ALTER TABLE chinese_calendar       ALTER COLUMN is_chinese_buddhist_day TYPE boolean USING (is_chinese_buddhist_day <> 0);
ALTER TABLE chinese_calendar       ALTER COLUMN is_doctor_day         DROP DEFAULT;
ALTER TABLE chinese_calendar       ALTER COLUMN is_doctor_day         TYPE boolean USING (is_doctor_day <> 0);
ALTER TABLE chinese_calendar       ALTER COLUMN is_good_day           DROP DEFAULT;
ALTER TABLE chinese_calendar       ALTER COLUMN is_good_day           TYPE boolean USING (is_good_day <> 0);
ALTER TABLE chinese_calendar       ALTER COLUMN is_thian_chai         DROP DEFAULT;
ALTER TABLE chinese_calendar       ALTER COLUMN is_thian_chai         TYPE boolean USING (is_thian_chai <> 0);
ALTER TABLE log_calculate          ALTER COLUMN is_remember_time      DROP DEFAULT;
ALTER TABLE log_calculate          ALTER COLUMN is_remember_time      TYPE boolean USING (is_remember_time <> 0);
ALTER TABLE log_work_vibe          ALTER COLUMN is_remember_time      DROP DEFAULT;
ALTER TABLE log_work_vibe          ALTER COLUMN is_remember_time      TYPE boolean USING (is_remember_time <> 0);
ALTER TABLE log_work_vibe          ALTER COLUMN your_is_remember_time DROP DEFAULT;
ALTER TABLE log_work_vibe          ALTER COLUMN your_is_remember_time TYPE boolean USING (your_is_remember_time <> 0);
ALTER TABLE log_matching           ALTER COLUMN is_remember_time      DROP DEFAULT;
ALTER TABLE log_matching           ALTER COLUMN is_remember_time      TYPE boolean USING (is_remember_time <> 0);
ALTER TABLE log_matching           ALTER COLUMN your_is_remember_time DROP DEFAULT;
ALTER TABLE log_matching           ALTER COLUMN your_is_remember_time TYPE boolean USING (your_is_remember_time <> 0);
ALTER TABLE log_love_mate          ALTER COLUMN is_remember_time      DROP DEFAULT;
ALTER TABLE log_love_mate          ALTER COLUMN is_remember_time      TYPE boolean USING (is_remember_time <> 0);
ALTER TABLE log_love_mate          ALTER COLUMN your_is_remember_time DROP DEFAULT;
ALTER TABLE log_love_mate          ALTER COLUMN your_is_remember_time TYPE boolean USING (your_is_remember_time <> 0);
ALTER TABLE payment_code           ALTER COLUMN is_active             DROP DEFAULT;
ALTER TABLE payment_code           ALTER COLUMN is_active             TYPE boolean USING (is_active <> 0);
ALTER TABLE member_with_friend     ALTER COLUMN is_remember_time      DROP DEFAULT;
ALTER TABLE member_with_friend     ALTER COLUMN is_remember_time      TYPE boolean USING (is_remember_time <> 0);
ALTER TABLE member_with_friend     ALTER COLUMN is_member             DROP DEFAULT;
ALTER TABLE member_with_friend     ALTER COLUMN is_member             TYPE boolean USING (is_member <> 0);
ALTER TABLE member_with_friend     ALTER COLUMN is_notify             DROP DEFAULT;
ALTER TABLE member_with_friend     ALTER COLUMN is_notify             TYPE boolean USING (is_notify <> 0);
ALTER TABLE product                ALTER COLUMN is_show               DROP DEFAULT;
ALTER TABLE product                ALTER COLUMN is_show               TYPE boolean USING (is_show <> 0);
ALTER TABLE power_finance_fortune  ALTER COLUMN is_above              DROP DEFAULT;
ALTER TABLE power_finance_fortune  ALTER COLUMN is_above              TYPE boolean USING (is_above <> 0);
ALTER TABLE power_finance_fortune  ALTER COLUMN is_real               DROP DEFAULT;
ALTER TABLE power_finance_fortune  ALTER COLUMN is_real               TYPE boolean USING (is_real <> 0);
ALTER TABLE "user"                 ALTER COLUMN is_remember_time      DROP DEFAULT;
ALTER TABLE "user"                 ALTER COLUMN is_remember_time      TYPE boolean USING (is_remember_time <> 0);
ALTER TABLE "user"                 ALTER COLUMN is_refresh            DROP DEFAULT;
ALTER TABLE "user"                 ALTER COLUMN is_refresh            TYPE boolean USING (is_refresh <> 0);

-- (2) indexes the original MySQL lacked (by-convention FK columns, hot lookups)
CREATE INDEX IF NOT EXISTS idx_payment_user_id        ON payment        (user_id);
CREATE INDEX IF NOT EXISTS idx_member_payment_user_id ON member_payment (user_id);
CREATE INDEX IF NOT EXISTS idx_user_matching_user_id  ON user_matching  (user_id);

-- (3) column-name casing: MySQL had camelCase `createAt` (case-insensitive); pgloader
--     lowercased it to `createat`, but the TypeORM entities query `"createAt"` (quoted,
--     case-sensitive on Postgres) -> "column does not exist". Rename back to match entities.
ALTER TABLE log_activity   RENAME COLUMN createat TO "createAt";
ALTER TABLE log_calculate  RENAME COLUMN createat TO "createAt";
ALTER TABLE log_love_mate  RENAME COLUMN createat TO "createAt";
ALTER TABLE log_matching   RENAME COLUMN createat TO "createAt";
ALTER TABLE log_save_image RENAME COLUMN createat TO "createAt";
ALTER TABLE log_survey     RENAME COLUMN createat TO "createAt";
ALTER TABLE log_work_vibe  RENAME COLUMN createat TO "createAt";
