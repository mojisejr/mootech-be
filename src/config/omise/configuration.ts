import { registerAs } from '@nestjs/config';

export default registerAs('omise', () => ({
  pub: process.env.OMISE_PUBLIC_KEY,
  secret: process.env.OMISE_SECRET_KEY,
  return_uri: process.env.OMISE_RETURN_URI,
  webhook_secret: process.env.OMISE_WEBHOOK_SECRET,
}));
