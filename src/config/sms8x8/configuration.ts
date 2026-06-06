import { registerAs } from '@nestjs/config';

export default registerAs('sms8x8', () => ({
  host: process.env.SMS_8X8_HOST,
  token: process.env.SMS_8X8_TOKEN,
  topic: process.env.SMS_8X8_TOPIC,
  encoding: process.env.SMS_8X8_ENCODING,
}));
