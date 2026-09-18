// Runtime invariants the container must hold BEFORE Nest boots (mumate-infra-move-001 slice 1).
//
// Two facts about this backend make these guards non-negotiable:
//   1. The schema is a pgloader copy that TypeORM never owned. `synchronize: true` would DIFF the 83
//      entities against production tables and issue DDL — on Supabase that is a destructive migration
//      with no rollback. configuration.ts reads DB_SYNCHRONIZE and app.module.ts passes it straight to
//      TypeORM, so the only thing standing between a typo in an env panel and that DDL is this refusal.
//   2. pg's default pool is 10 connections per process and unbounded in time. Supabase counts every
//      one; a container that is restarted, scaled, or health-checked in a loop must state its bound
//      explicitly so the number is READ from config, not remembered from a library default.
//
// Pure functions: main.ts decides what to do with a refusal (print + exit 1). Tests in runtime-guard.spec.ts.

export type DbPoolConfig = {
  /** max connections this process opens (pg `max`) */
  max: number;
  /** ms to wait for a connection before failing the query (pg `connectionTimeoutMillis`) */
  connectionTimeoutMillis: number;
  /** ms an idle connection stays open before pg closes it (pg `idleTimeoutMillis`) */
  idleTimeoutMillis: number;
};

export const DB_POOL_DEFAULTS: DbPoolConfig = {
  max: 10,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
};

/**
 * Returns the reason the process must refuse to start, or null when the environment is safe.
 * Deliberately wider than configuration.ts's `=== 'true'`: any spelling of true is refused, so a value
 * that would NOT have synchronized ("TRUE", " true ") is still treated as an operator mistake.
 */
export function refuseUnsafeRuntimeEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const sync = (env.DB_SYNCHRONIZE ?? '').trim().toLowerCase();
  if (sync === 'true' || sync === '1' || sync === 'yes') {
    return (
      `DB_SYNCHRONIZE=${JSON.stringify(
        env.DB_SYNCHRONIZE,
      )} — refusing to start. ` +
      'This schema is pgloader-migrated; TypeORM synchronize would issue destructive DDL against it. ' +
      'Set DB_SYNCHRONIZE=false (migrations/ is the only schema path).'
    );
  }
  return null;
}

function readBoundedInt(
  raw: string | undefined,
  fallback: number,
  name: string,
  { min, max }: { min: number; max: number },
): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(
      `${name}=${JSON.stringify(raw)} is not an integer in [${min}, ${max}]`,
    );
  }
  return n;
}

/**
 * Pool bound, read from DB_POOL_MAX / DB_POOL_CONNECT_TIMEOUT_MS / DB_POOL_IDLE_TIMEOUT_MS.
 * Defaults equal what pg does today (max 10) so an image with no pool env behaves exactly like Render;
 * the point is that the number is now explicit and rejected when nonsensical.
 */
export function readDbPoolConfig(
  env: NodeJS.ProcessEnv = process.env,
): DbPoolConfig {
  return {
    max: readBoundedInt(env.DB_POOL_MAX, DB_POOL_DEFAULTS.max, 'DB_POOL_MAX', {
      min: 1,
      max: 100,
    }),
    connectionTimeoutMillis: readBoundedInt(
      env.DB_POOL_CONNECT_TIMEOUT_MS,
      DB_POOL_DEFAULTS.connectionTimeoutMillis,
      'DB_POOL_CONNECT_TIMEOUT_MS',
      { min: 1_000, max: 120_000 },
    ),
    idleTimeoutMillis: readBoundedInt(
      env.DB_POOL_IDLE_TIMEOUT_MS,
      DB_POOL_DEFAULTS.idleTimeoutMillis,
      'DB_POOL_IDLE_TIMEOUT_MS',
      { min: 1_000, max: 600_000 },
    ),
  };
}
