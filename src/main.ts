import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS locked to our fe origin(s). Set CORS_ORIGINS (comma-separated) at deploy.
  // Defaults to local dev fe so nothing breaks locally.
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.use(json({ limit: '100mb' }));

  app.use('/callback/omise', express.raw({ type: 'application/json' }));
  // Honor the port the platform injects (Render sets PORT). Fall back to
  // APP_PORT for existing setups, then 3000 for local dev. Bind 0.0.0.0 so
  // the container is reachable on Render.
  const port = process.env.PORT || process.env.APP_PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
