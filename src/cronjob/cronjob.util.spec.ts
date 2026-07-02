// Unit tests for the pure cron helpers (#mootech-line-cron-toggle-multicast).
import {
  dedupeLineUserIds,
  isLineUserId,
  isMorningCronEnabled,
} from './cronjob.util';

const VALID_A = 'U' + 'a'.repeat(32);
const VALID_B = 'U' + 'b'.repeat(32);

describe('isMorningCronEnabled (reversible toggle, default OFF)', () => {
  const original = process.env.MORNING_CRON_ENABLED;
  afterEach(() => {
    if (original === undefined) delete process.env.MORNING_CRON_ENABLED;
    else process.env.MORNING_CRON_ENABLED = original;
  });

  it('is false when the env is unset (fail-safe default)', () => {
    delete process.env.MORNING_CRON_ENABLED;
    expect(isMorningCronEnabled()).toBe(false);
  });

  it('is true only for "true" (case/space-insensitive)', () => {
    process.env.MORNING_CRON_ENABLED = ' TRUE ';
    expect(isMorningCronEnabled()).toBe(true);
    process.env.MORNING_CRON_ENABLED = 'true';
    expect(isMorningCronEnabled()).toBe(true);
  });

  it('is false for any non-"true" value', () => {
    for (const v of ['false', '0', '1', 'yes', 'on', '']) {
      process.env.MORNING_CRON_ENABLED = v;
      expect(isMorningCronEnabled()).toBe(false);
    }
  });
});

describe('isLineUserId', () => {
  it('accepts a well-formed LINE userId', () => {
    expect(isLineUserId(VALID_A)).toBe(true);
    expect(isLineUserId(`  ${VALID_A}  `)).toBe(true);
  });

  it('rejects malformed / non-string ids', () => {
    expect(isLineUserId('U123')).toBe(false);
    expect(isLineUserId('X' + 'a'.repeat(32))).toBe(false);
    expect(isLineUserId(null)).toBe(false);
    expect(isLineUserId(undefined)).toBe(false);
    expect(isLineUserId(12345)).toBe(false);
  });
});

describe('dedupeLineUserIds', () => {
  it('removes duplicate valid ids (member path anti-double-send)', () => {
    const out = dedupeLineUserIds([
      VALID_A,
      VALID_A,
      VALID_B,
      `  ${VALID_A}  `,
    ]);
    expect(out).toEqual([VALID_A, VALID_B]);
  });

  it('drops invalid / empty / non-string entries', () => {
    const out = dedupeLineUserIds([VALID_A, 'nope', '', null, undefined, 42]);
    expect(out).toEqual([VALID_A]);
  });

  it('excludes ids present in the exclude set (free path)', () => {
    const members = new Set([VALID_A]);
    const out = dedupeLineUserIds([VALID_A, VALID_B], members);
    expect(out).toEqual([VALID_B]);
  });

  it('returns an empty array when nothing valid remains', () => {
    expect(dedupeLineUserIds(['x', '', null])).toEqual([]);
  });
});
