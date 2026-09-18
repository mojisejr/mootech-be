import { Controller, Get, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { Response } from 'express';
import { DataSource } from 'typeorm';

// GET /health — the container's liveness/readiness surface (mumate-infra-move-001 slice 1).
//
// `/` keeps returning "Hello World!" (Render's healthCheckPath today) and is deliberately NOT changed:
// it proves the process answers, nothing more. This route proves the one dependency the service
// cannot serve without — the database — by running a real round trip, and answers 503 when it fails
// so an orchestrator stops routing to a container that is up but useless. No secret, host, or
// connection string is echoed; the SHA is the build-time argument so every running container names
// the exact revision it was built from.
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check(@Res() res: Response) {
    const startedAt = Date.now();
    let db: 'ok' | 'error' = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      db = 'error';
    }
    const body = {
      status: db === 'ok' ? 'ok' : 'degraded',
      service: 'mootech-be',
      db,
      dbLatencyMs: Date.now() - startedAt,
      sha: process.env.APP_GIT_SHA ?? null,
      uptimeSec: Math.round(process.uptime()),
    };
    res
      .status(db === 'ok' ? 200 : 503)
      .setHeader('Cache-Control', 'no-store')
      .json(body);
  }
}
