import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3RootBucket: process.env.AWS_S3_ROOT_BUCKET,
  s3ThumbRootBucket: process.env.AWS_S3_THUMB_ROOT_BUCKET,
  s3SignedUrlTimeout: Number(process.env.AWS_S3_SIGNED_URL_TIMEOUT) || 3600, // second
}));
