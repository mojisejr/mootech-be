-- Phase 3: rewrite stored image URLs from the old S3 / phoenix-stark CDN bases
-- to the Supabase Storage public base. Run in the Supabase SQL editor.
--
-- Safe / idempotent: each statement only touches rows whose value still starts
-- with the OLD base (WHERE ... LIKE 'oldbase%'); re-running is a no-op.
-- Key paths were preserved during the object copy (the leading "mootech/" prefix
-- was stripped because the Supabase bucket itself is named "mootech"), so a plain
-- base-string REPLACE produces correct URLs.
--
-- Old bases:
--   S3:            https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/
--   phoenix-stark: https://cdn.phoenix-stark.com/mootech/      (CloudFront over the same bucket)
-- New base:
--   https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/

-- ============ S3 base -> Supabase ============
UPDATE "user" SET picture_url = REPLACE(picture_url,
  'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE picture_url LIKE 'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/%';

UPDATE "user" SET share_img_profile_url = REPLACE(share_img_profile_url,
  'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE share_img_profile_url LIKE 'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/%';

UPDATE user_provider SET picture_url = REPLACE(picture_url,
  'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE picture_url LIKE 'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/%';

UPDATE member_with_friend SET picture_url = REPLACE(picture_url,
  'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE picture_url LIKE 'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/%';

UPDATE fortune_telling SET image = REPLACE(image,
  'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE image LIKE 'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/%';

UPDATE heavenly_spirit_card SET image = REPLACE(image,
  'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE image LIKE 'https://s3-ps-cdn.s3.ap-southeast-1.amazonaws.com/mootech/%';

-- ============ phoenix-stark CDN base -> Supabase (same underlying bucket) ============
UPDATE mascot SET url = REPLACE(url,
  'https://cdn.phoenix-stark.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE url LIKE 'https://cdn.phoenix-stark.com/mootech/%';

UPDATE mascot_v2 SET url = REPLACE(url,
  'https://cdn.phoenix-stark.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE url LIKE 'https://cdn.phoenix-stark.com/mootech/%';

UPDATE mascot_v2 SET url_share = REPLACE(url_share,
  'https://cdn.phoenix-stark.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE url_share LIKE 'https://cdn.phoenix-stark.com/mootech/%';

UPDATE scared_thing SET url = REPLACE(url,
  'https://cdn.phoenix-stark.com/mootech/',
  'https://jgxsjhbdhttfoiyvptvy.supabase.co/storage/v1/object/public/mootech/')
  WHERE url LIKE 'https://cdn.phoenix-stark.com/mootech/%';

-- ============ Verification (expect 0 rows remaining on the old bases) ============
-- SELECT 'user.picture_url' c, count(*) FROM "user" WHERE picture_url LIKE 'https://s3-ps-cdn%'
-- UNION ALL SELECT 'user.share', count(*) FROM "user" WHERE share_img_profile_url LIKE 'https://s3-ps-cdn%'
-- UNION ALL SELECT 'user_provider', count(*) FROM user_provider WHERE picture_url LIKE 'https://s3-ps-cdn%'
-- UNION ALL SELECT 'member_with_friend', count(*) FROM member_with_friend WHERE picture_url LIKE 'https://s3-ps-cdn%'
-- UNION ALL SELECT 'fortune_telling', count(*) FROM fortune_telling WHERE image LIKE 'https://s3-ps-cdn%'
-- UNION ALL SELECT 'heavenly_spirit_card', count(*) FROM heavenly_spirit_card WHERE image LIKE 'https://s3-ps-cdn%'
-- UNION ALL SELECT 'mascot', count(*) FROM mascot WHERE url LIKE 'https://cdn.phoenix-stark.com%'
-- UNION ALL SELECT 'mascot_v2.url', count(*) FROM mascot_v2 WHERE url LIKE 'https://cdn.phoenix-stark.com%'
-- UNION ALL SELECT 'mascot_v2.url_share', count(*) FROM mascot_v2 WHERE url_share LIKE 'https://cdn.phoenix-stark.com%'
-- UNION ALL SELECT 'scared_thing', count(*) FROM scared_thing WHERE url LIKE 'https://cdn.phoenix-stark.com%';
