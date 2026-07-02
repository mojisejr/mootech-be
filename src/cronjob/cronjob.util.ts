// Pure helpers for the morning LINE notification cron (#mootech-line-cron-toggle-multicast).
// Kept side-effect free so they can be unit-tested headlessly (no Nest DI, no network).

/**
 * Reversible master switch for BOTH morning crons (06:00 member + 09:00 free).
 * Default is OFF (fail-safe): if the env is unset the broadcast never fires, so a
 * fresh deploy cannot accidentally spam users. Turn on by setting
 * MORNING_CRON_ENABLED=true on the runtime, then redeploy.
 */
export function isMorningCronEnabled(): boolean {
  return (
    (process.env.MORNING_CRON_ENABLED ?? 'false').trim().toLowerCase() ===
    'true'
  );
}

/** A valid LINE userId starts with `U` followed by 32 hex chars. */
export function isLineUserId(value: unknown): value is string {
  return typeof value === 'string' && /^U[a-f0-9]{32}$/i.test(value.trim());
}

/**
 * Normalize -> keep only valid LINE userIds -> drop duplicates.
 * Optionally exclude any id present in `exclude` (used by the free path to
 * remove users who are already paid members). This is the shared dedup that
 * both the member (06:00) and free (09:00) paths now use so neither can
 * double-send when the source list contains duplicate rows.
 */
export function dedupeLineUserIds(
  ids: unknown[],
  exclude?: Set<string>,
): string[] {
  return Array.from(
    new Set(
      ids
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter((id) => isLineUserId(id) && !(exclude?.has(id) ?? false)),
    ),
  );
}
