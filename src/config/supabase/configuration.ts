import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  projectUrl: process.env.SUPABASE_PROJECT_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'mootech',
  signedUrlTimeout: Number(process.env.SUPABASE_SIGNED_URL_TIMEOUT) || 3600, // second
}));
