import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

function fakeRes() {
  const res: any = {};
  res.statusCode = 0;
  res.headers = {} as Record<string, string>;
  res.body = undefined;
  res.status = (c: number) => ((res.statusCode = c), res);
  res.setHeader = (k: string, v: string) => ((res.headers[k] = v), res);
  res.json = (b: unknown) => ((res.body = b), res);
  return res;
}

async function controllerWith(query: () => Promise<unknown>) {
  const mod: TestingModule = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: getDataSourceToken(), useValue: { query } }],
  }).compile();
  return mod.get(HealthController);
}

describe('GET /health', () => {
  it('answers 200 ok only after a real database round trip', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const c = await controllerWith(query);
    const res = fakeRes();
    await c.check(res);
    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      db: 'ok',
      service: 'mootech-be',
    });
    expect(res.headers['Cache-Control']).toBe('no-store');
  });

  it('answers 503 degraded when the database is unreachable — never a constant green', async () => {
    const c = await controllerWith(() =>
      Promise.reject(new Error('ECONNREFUSED')),
    );
    const res = fakeRes();
    await c.check(res);
    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({ status: 'degraded', db: 'error' });
  });

  it('reports the build SHA when the image was built with one, and nothing about the connection', async () => {
    const prev = process.env.APP_GIT_SHA;
    process.env.APP_GIT_SHA = 'abc1234';
    try {
      const c = await controllerWith(() => Promise.resolve([]));
      const res = fakeRes();
      await c.check(res);
      expect(res.body.sha).toBe('abc1234');
      expect(JSON.stringify(res.body)).not.toMatch(
        /DB_HOST|password|postgres:\/\//i,
      );
    } finally {
      if (prev === undefined) delete process.env.APP_GIT_SHA;
      else process.env.APP_GIT_SHA = prev;
    }
  });
});
