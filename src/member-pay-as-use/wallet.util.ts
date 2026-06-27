// Chat Credit Wallet — pure helpers (#mootech-chat-credit-wallet)
// Kept framework-free so the entitlement math is unit-testable in isolation.

/** One-time welcome credits granted to a brand-new account (free questions). */
export const WELCOME_CREDITS = 3;

/**
 * Option B unified entitlement / migration formula.
 *
 *   balance = max(0, WELCOME_CREDITS + purchasedTotal − lifetimeUsed)
 *
 * - `purchasedTotal`  = cumulative credits ever bought (member_pay_as_use.total)
 * - `lifetimeUsed`    = count of AI_GENERAL log rows for the user (NO year filter)
 * - clamp-negative → 0 (no clawback for users who overspent via the old yearly bug)
 *
 * Used both by the one-shot migration (existing users) and at runtime for the
 * lazy welcome/backfill path (new users: used=0 → 3; legacy overflow: max(0,3−used)).
 */
export function computeMigratedBalance(
  purchasedTotal: number,
  lifetimeUsed: number,
): number {
  const total = Number.isFinite(purchasedTotal) ? purchasedTotal : 0;
  const used = Number.isFinite(lifetimeUsed) ? lifetimeUsed : 0;
  return Math.max(0, WELCOME_CREDITS + total - used);
}

/**
 * CREDIT_ENFORCE feature flag. When `off`, balance is still tracked/decremented
 * and displayed, but the gate must NOT block the user. Default is ON so testers
 * experience the real wallet behavior before go-live.
 */
export function isCreditEnforced(): boolean {
  return (process.env.CREDIT_ENFORCE ?? 'on').toLowerCase() !== 'off';
}
