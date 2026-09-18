// Teeth for the two container invariants (mumate-infra-move-001 slice 1):
//   DB_SYNCHRONIZE must never let the process start; the pool bound must be explicit and sane.
import {
  DB_POOL_DEFAULTS,
  readDbPoolConfig,
  refuseUnsafeRuntimeEnv,
} from './runtime-guard';

describe('refuseUnsafeRuntimeEnv', () => {
  it('lets a production-shaped env through', () => {
    expect(refuseUnsafeRuntimeEnv({ DB_SYNCHRONIZE: 'false' })).toBeNull();
    expect(refuseUnsafeRuntimeEnv({})).toBeNull();
  });

  it('refuses the exact value TypeORM would act on', () => {
    expect(refuseUnsafeRuntimeEnv({ DB_SYNCHRONIZE: 'true' })).toMatch(
      /refusing to start/,
    );
  });

  it('refuses every spelling of true, not only the one configuration.ts compares against', () => {
    for (const v of ['TRUE', ' true ', 'True', '1', 'yes']) {
      expect(refuseUnsafeRuntimeEnv({ DB_SYNCHRONIZE: v })).not.toBeNull();
    }
  });
});

describe('readDbPoolConfig', () => {
  it('defaults equal what pg does today, so an image with no pool env behaves like Render', () => {
    expect(readDbPoolConfig({})).toEqual(DB_POOL_DEFAULTS);
    expect(DB_POOL_DEFAULTS.max).toBe(10);
  });

  it('reads an explicit bound', () => {
    expect(
      readDbPoolConfig({
        DB_POOL_MAX: '4',
        DB_POOL_CONNECT_TIMEOUT_MS: '5000',
        DB_POOL_IDLE_TIMEOUT_MS: '10000',
      }),
    ).toEqual({
      max: 4,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    });
  });

  it('rejects a nonsensical bound instead of silently falling back', () => {
    expect(() => readDbPoolConfig({ DB_POOL_MAX: '0' })).toThrow(/DB_POOL_MAX/);
    expect(() => readDbPoolConfig({ DB_POOL_MAX: '101' })).toThrow(
      /DB_POOL_MAX/,
    );
    expect(() => readDbPoolConfig({ DB_POOL_MAX: 'ten' })).toThrow(
      /DB_POOL_MAX/,
    );
    expect(() => readDbPoolConfig({ DB_POOL_MAX: '2.5' })).toThrow(
      /DB_POOL_MAX/,
    );
    expect(() =>
      readDbPoolConfig({ DB_POOL_CONNECT_TIMEOUT_MS: '10' }),
    ).toThrow(/DB_POOL_CONNECT_TIMEOUT_MS/);
  });

  it('treats an empty string as unset', () => {
    expect(readDbPoolConfig({ DB_POOL_MAX: '' }).max).toBe(10);
  });
});
