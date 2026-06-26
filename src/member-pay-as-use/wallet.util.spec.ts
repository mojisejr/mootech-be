import {
  WELCOME_CREDITS,
  computeMigratedBalance,
  isCreditEnforced,
} from './wallet.util';

describe('wallet.util — Option B entitlement formula (#mootech-chat-credit-wallet)', () => {
  describe('computeMigratedBalance', () => {
    it('brand-new account (no purchase, no usage) → welcome 3', () => {
      expect(computeMigratedBalance(0, 0)).toBe(WELCOME_CREDITS);
      expect(computeMigratedBalance(0, 0)).toBe(3);
    });

    it('bought 3, used 0 → 3 welcome + 3 purchased = 6 (matches owner intent)', () => {
      expect(computeMigratedBalance(3, 0)).toBe(6);
    });

    it('bought 3, used 24 (yearly-bug overflow) → clamps to 0, no clawback', () => {
      expect(computeMigratedBalance(3, 24)).toBe(0);
    });

    it('legacy free user with usage but no purchase → max(0, 3 − used)', () => {
      expect(computeMigratedBalance(0, 1)).toBe(2);
      expect(computeMigratedBalance(0, 3)).toBe(0);
      expect(computeMigratedBalance(0, 5)).toBe(0);
    });

    it('bought 10, used 5 → 3 + 10 − 5 = 8', () => {
      expect(computeMigratedBalance(10, 5)).toBe(8);
    });

    it('coerces non-finite inputs to 0', () => {
      expect(computeMigratedBalance(NaN as unknown as number, 0)).toBe(3);
      expect(computeMigratedBalance(3, undefined as unknown as number)).toBe(6);
    });
  });

  describe('isCreditEnforced', () => {
    const original = process.env.CREDIT_ENFORCE;
    afterEach(() => {
      if (original === undefined) delete process.env.CREDIT_ENFORCE;
      else process.env.CREDIT_ENFORCE = original;
    });

    it('defaults to enforced (on) when unset', () => {
      delete process.env.CREDIT_ENFORCE;
      expect(isCreditEnforced()).toBe(true);
    });

    it('off (any case) disables enforcement', () => {
      process.env.CREDIT_ENFORCE = 'OFF';
      expect(isCreditEnforced()).toBe(false);
      process.env.CREDIT_ENFORCE = 'off';
      expect(isCreditEnforced()).toBe(false);
    });

    it('any other value stays enforced', () => {
      process.env.CREDIT_ENFORCE = 'on';
      expect(isCreditEnforced()).toBe(true);
    });
  });
});
