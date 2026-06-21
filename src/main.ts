import { NestFactory } from '@nestjs/core';
import { types as pgTypes } from 'pg';
import { AppModule } from './app.module';
import { json } from 'express';
import * as express from 'express';

// MySQL→Postgres migration fix (#mootech-mysql-pg-migration-audit):
// node-postgres returns int8/bigint AND COUNT(*) as STRINGS by default. Many columns
// (points, ids, counts) are bigint in the migrated schema but typed `number` in the
// TypeORM entities, so without this they arrive as strings and JS arithmetic silently
// string-concatenates ("20" + 5 -> "205"). Parse int8 (OID 20) -> number globally,
// before TypeORM opens its connection. Values here (points/ids/counts) are well within
// Number.MAX_SAFE_INTEGER. double precision (money/score) is unaffected — already number.
pgTypes.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS locked to our fe origin(s). Set CORS_ORIGINS (comma-separated) at deploy.
  // Defaults to local dev fe so nothing breaks locally.
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins, credentials: true });

  // Omise webhook signature is HMAC-SHA256 over `<timestamp>.<raw body>`, so the
  // webhook route MUST receive the unparsed bytes. Register express.raw for it
  // FIRST, then JSON-parse every OTHER route. (#mootech-omise-payment-hardening)
  const OMISE_WEBHOOK_PATH = '/omise/webhook';
  app.use(OMISE_WEBHOOK_PATH, express.raw({ type: '*/*' }));
  app.use((req, res, next) => {
    if (req.path === OMISE_WEBHOOK_PATH) return next();
    return json({ limit: '100mb' })(req, res, next);
  });
  // Honor the port the platform injects (Render sets PORT). Fall back to
  // APP_PORT for existing setups, then 3000 for local dev. Bind 0.0.0.0 so
  // the container is reachable on Render.
  const port = process.env.PORT || process.env.APP_PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
