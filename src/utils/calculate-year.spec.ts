import {
  CalculateDateEngToDAteChinese,
  calculateChineseAge,
} from './calculate-year';

// #chinese-age-offset-fix: อายุจีน = อายุไทย(western) + 1 เสมอ ต้องคำนวณจากปีเกิดจริง
// (ไม่ใช่ปีที่ CalculateDateEngToDAteChinese ปรับ -1 แล้วสำหรับคนเกิด 1ม.ค.-3ก.พ.
// ปรับนั้นถูกต้องสำหรับหา zodiac/pillar เท่านั้น ไม่ใช่สำหรับเลขอายุ).
//
// calculateChineseAge takes the REAL birth year only (no month/day) — the
// caller (chinese-horoscope.service.ts) is responsible for extracting that
// real year from the raw dob string BEFORE any lunar shifting is applied.
// The combined-scenario tests below mirror that caller's real extraction
// (`dob.split('-')[0]`) to prove the end-to-end wiring, not just the formula.
describe('calculateChineseAge', () => {
  const now = (iso: string) => new Date(iso);
  const realBirthYearFromDob = (dob: string) => parseInt(dob.split('-')[0]);
  const chineseAgeForDob = (dob: string, asOf: Date) =>
    calculateChineseAge(realBirthYearFromDob(dob), asOf);

  it('ฟีมเคส: เกิด 1989-01-03, ปัจจุบัน 2026 → อายุจีน = 38 (= อายุไทย 37 + 1)', () => {
    expect(chineseAgeForDob('1989-01-03', now('2026-07-16'))).toBe(38);
  });

  it('holds for a non-boundary birthdate (outside the Jan1-Feb3 shift window)', () => {
    expect(chineseAgeForDob('1990-06-15', now('2026-07-16'))).toBe(37);
  });

  it.each([
    ['1970-01-01', '2026-03-01', 57],
    ['1985-01-15', '2026-03-01', 42],
    ['1989-01-31', '2026-03-01', 38],
    ['1995-02-01', '2026-03-01', 32],
    ['2000-02-02', '2026-03-01', 27],
    ['2010-02-03', '2026-03-01', 17], // last day of the shift window
  ])(
    'shift-window birthdate %s as of %s → chinese age %i (unaffected by the lunar shift)',
    (dob, asOf, expected) => {
      expect(chineseAgeForDob(dob, now(asOf))).toBe(expected);
    },
  );

  it.each([
    ['1970-02-04', '2026-03-01', 57], // first day the shift stops applying
    ['1985-02-05', '2026-03-01', 42],
    ['1989-06-15', '2026-03-01', 38],
    ['1995-12-31', '2026-03-01', 32],
  ])(
    'non-boundary control %s as of %s → same formula, chinese age %i',
    (dob, asOf, expected) => {
      expect(chineseAgeForDob(dob, now(asOf))).toBe(expected);
    },
  );

  it('holds across multiple current-years for the same shift-window birthdate (regression should not be year-specific)', () => {
    const dob = '1989-01-03';
    expect(chineseAgeForDob(dob, now('2024-05-01'))).toBe(36);
    expect(chineseAgeForDob(dob, now('2025-05-01'))).toBe(37);
    expect(chineseAgeForDob(dob, now('2026-05-01'))).toBe(38);
    expect(chineseAgeForDob(dob, now('2027-05-01'))).toBe(39);
  });

  it('leap-day birth (Feb 29, outside the shift window) does not throw and still applies the +1 convention', () => {
    expect(chineseAgeForDob('1988-02-29', now('2026-07-16'))).toBe(39);
  });

  it('defaults `now` to the real current date when omitted', () => {
    const age = calculateChineseAge(new Date().getFullYear() - 10);
    expect(age).toBe(11);
  });

  it('regression trap: feeding the shifted (not real) year produces the old wrong answer — proves the fix matters', () => {
    const dob = '1989-01-03';
    const realYear = realBirthYearFromDob(dob);
    const shiftedYear = parseInt(
      CalculateDateEngToDAteChinese(dob).split('-')[0],
    );
    expect(shiftedYear).toBe(1988);
    expect(calculateChineseAge(realYear, now('2026-07-16'))).toBe(38); // correct (the fix)
    expect(calculateChineseAge(shiftedYear, now('2026-07-16'))).toBe(39); // the bug we removed
  });
});

describe('CalculateDateEngToDAteChinese (unchanged — regression guard)', () => {
  it('still shifts Jan/early-Feb births back one lunar year for zodiac/pillar lookups', () => {
    expect(CalculateDateEngToDAteChinese('1989-01-03')).toBe('1988-01-03');
  });

  it('still leaves non-boundary births untouched', () => {
    expect(CalculateDateEngToDAteChinese('1989-06-15')).toBe('1989-06-15');
  });
});
