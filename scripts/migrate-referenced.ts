/**
 * Referenced-only migration: copy ONLY the S3 objects that DB columns actually
 * reference (computed into /tmp/referenced-keys.json) into Supabase bucket
 * `mootech`, preserving key paths minus the leading `mootech/`.
 *
 * Full bucket = 25.7GB / 31,690 objects (mostly orphan uploads); Supabase free
 * tier = 1GB. Referenced set = 410 objects / ~386MB. This is the correct scope.
 *
 * Run from projects/mootech-be:
 *   bun scripts/migrate-referenced.ts --empty   # empty bucket first, then copy
 *   bun scripts/migrate-referenced.ts           # copy only (upsert)
 */
import AWS from 'aws-sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const S3_BUCKET = 's3-ps-cdn';
const S3_PREFIX = 'mootech/';
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET = 'mootech' } = process.env as Record<string, string>;
const EMPTY = process.argv.includes('--empty');

const s3 = new AWS.S3({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: 'ap-southeast-1' });
const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const BUCKET = SUPABASE_STORAGE_BUCKET;

async function listAllPaths(prefix = ''): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 100, offset });
    if (error) { console.log('list err', prefix, error.message); break; }
    if (!data || !data.length) break;
    for (const item of data) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      if ((item as any).id === null) out.push(...(await listAllPaths(full)));
      else out.push(full);
    }
    if (data.length < 100) break;
    offset += 100;
  }
  return out;
}

async function emptyBucket() {
  const paths = await listAllPaths('');
  console.log(`emptying: ${paths.length} existing objects`);
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) console.log('remove err', error.message);
  }
  console.log('emptied.');
}

(async () => {
  if (EMPTY) await emptyBucket();

  const keys: string[] = JSON.parse(readFileSync('/tmp/referenced-keys.json', 'utf8'));
  console.log(`copying ${keys.length} referenced objects, concurrency 24`);
  let copied = 0, failed = 0, idx = 0;
  const failures: string[] = [];
  const samples: string[] = [];

  async function copyOne(key: string) {
    const destKey = key.startsWith(S3_PREFIX) ? key.slice(S3_PREFIX.length) : key;
    try {
      const got = await s3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
      const { error } = await supabase.storage.from(BUCKET).upload(destKey, got.Body as Buffer, {
        contentType: (got.ContentType as string) || 'application/octet-stream', upsert: true,
      });
      if (error) { failed++; if (failures.length < 30) failures.push(`${destKey}: ${error.message}`); }
      else { copied++; if (samples.length < 5) samples.push(supabase.storage.from(BUCKET).getPublicUrl(destKey).data.publicUrl); }
    } catch (e: any) { failed++; if (failures.length < 30) failures.push(`${key}: ${e.code || e.message}`); }
  }
  async function worker() { while (idx < keys.length) { await copyOne(keys[idx++]); } }
  await Promise.all(Array.from({ length: 24 }, () => worker()));

  console.log('\n=== report ===');
  console.log(JSON.stringify({ referenced: keys.length, copied, failed }, null, 0));
  if (samples.length) console.log('samples:\n' + samples.join('\n'));
  if (failures.length) console.log('failures:\n' + failures.join('\n'));
})();
