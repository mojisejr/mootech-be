import { registerAs } from '@nestjs/config';

export default registerAs('lineMessage', () => ({
  host: process.env.LINE_HOST,
  token: process.env.LINE_TOKEN,
}));
