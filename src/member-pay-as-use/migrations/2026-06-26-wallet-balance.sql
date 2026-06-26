-- ============================================================================
-- Chat Credit Wallet — Phase 1 migration (Option B unified formula)
-- Mission: #mootech-chat-credit-wallet
--
-- ⚠️  DO NOT run blindly against PROD. Run inside this transaction on a COPY /
--     staging snapshot first, inspect the verification counts at the bottom, and
--     only COMMIT once they match the PROD baseline:
--         footprint_users = 321   credits_granted = 287   clamped/lands-0 = 145
--     (operator-approved baseline, soxsccdlsycaevusndro, 2026-06-26)
--
-- Formula (Option B):  balance = max(0, 3 + total − lifetime_AI_GENERAL_used)
--   - 3                = one-time welcome credits (baked into the formula)
--   - total           = cumulative purchased credits (member_pay_as_use.total)
--   - lifetime_used   = count(log_ai WHERE ai_type='AI_GENERAL'), NO year filter
--   - clamp-negative → 0 (no clawback for users who overspent via the yearly bug)
--
-- Note: member_pay_as_use.user_id is uuid; log_ai.user_id is text → cast on join.
-- ============================================================================

BEGIN;

-- 1) Schema: add the decrement-only wallet column (synchronize=false → manual DDL).
ALTER TABLE member_pay_as_use
  ADD COLUMN IF NOT EXISTS balance integer NOT NULL DEFAULT 0;

-- 2) Existing wallet rows that HAVE AI_GENERAL usage: apply the full formula.
UPDATE member_pay_as_use m
SET balance = GREATEST(0, 3 + COALESCE(m.total, 0) - COALESCE(u.used, 0))
FROM (
  SELECT user_id, COUNT(*) AS used
  FROM log_ai
  WHERE ai_type = 'AI_GENERAL'
  GROUP BY user_id
) u
WHERE m.user_id::text = u.user_id;

-- 2b) Existing wallet rows with NO usage at all: balance = 3 (welcome) + total.
UPDATE member_pay_as_use m
SET balance = GREATEST(0, 3 + COALESCE(m.total, 0))
WHERE NOT EXISTS (
  SELECT 1 FROM log_ai l
  WHERE l.user_id = m.user_id::text AND l.ai_type = 'AI_GENERAL'
);

-- 3) Footprint users with AI_GENERAL usage but NO wallet row: insert (total=0).
INSERT INTO member_pay_as_use (user_id, total, balance, update_at)
SELECT u.user_id::uuid,
       0,
       GREATEST(0, 3 - u.used),
       to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
FROM (
  SELECT user_id, COUNT(*) AS used
  FROM log_ai
  WHERE ai_type = 'AI_GENERAL'
  GROUP BY user_id
) u
WHERE NOT EXISTS (
  SELECT 1 FROM member_pay_as_use m WHERE m.user_id::text = u.user_id
);

-- 4) VERIFY before COMMIT — these must match the PROD baseline:
--   SELECT COUNT(*)   AS footprint_users  FROM member_pay_as_use;             -- expect 321
--   SELECT SUM(balance) AS credits_granted FROM member_pay_as_use;            -- expect 287
--   SELECT COUNT(*)   AS lands_zero       FROM member_pay_as_use WHERE balance = 0; -- ~145
-- If the numbers drift, run `ROLLBACK;` instead of COMMIT and investigate.

COMMIT;
