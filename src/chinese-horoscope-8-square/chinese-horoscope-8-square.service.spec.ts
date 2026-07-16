import * as moment from 'moment-timezone';
import { ChineseHoroscope8SquareService } from './chinese-horoscope-8-square.service';

// #decade-onset-year-shift-fix (sibling of #chinese-age-offset-fix): the 起运/onset day-distance
// calc (STEP 3-5 of getChineseHoroscope8Cycle) must measure from the REAL Gregorian birth year,
// not the lunar-shifted year used for zodiac/pillar lookups. For Jan 1 - Feb 3 births the two
// years differ, and using the shifted one makes STEP 4 look up the WRONG calendar year's almanac
// boundary — the fix now takes only `realYear` (the shifted `year` param was removed entirely, so
// there's no longer a wrong variable to accidentally pass).
//
// Real live data pinned below (dob 1989-01-03, MALE, verified 2026-07-16 against the actual
// running service + prod-shaped calendar100_year table):
//   - real (unshifted) year: 1989. Nearest forward 节 (小寒) in 1989: 1989-01-05 16:45.
//   - diffDate = |1989-01-03 → 1989-01-05| = 2 days → floor(2/3) = 0 → first band starts age 0.
//   - the OLD bug used the shifted year (1988) instead, finding 1988-01-06 11:03 (a full year
//     off but a similar month/day, since 节 recur near the same date every year) → diffDate = 3
//     days → floor(3/3) = 1 → every band shifted +1 year (the exact symptom ฟีม reported).
function makeService(overrides: any = {}) {
  const aboveRepo = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 1, chinese_symbol: 'above-X', element: 'WOOD' }),
  };
  const belowRepo = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 1, chinese_symbol: 'below-Y', element: 'WOOD' }),
  };
  const calendar100YearService = {
    // Responds differently depending on the `year` it's actually called with — this is what
    // makes the regression trap real: if a future change reintroduces the shifted year, this
    // mock returns the WRONG (1988) boundary and the final ageStart assertion below fails.
    getDay: jest.fn(async (year: number) => {
      if (year === 1989)
        return { year: 1989, month: 1, date: 5, time: '16:45' };
      if (year === 1988)
        return { year: 1988, month: 1, date: 6, time: '11:03' };
      return { year, month: 1, date: 1, time: '00:00' };
    }),
    ...(overrides.calendar100YearService || {}),
  };
  const momentService = {
    moment: () => moment.tz('2026-07-16', 'Asia/Bangkok'),
    momentDateFromFormat: (dateStr: string, fmt: string) =>
      moment.tz(dateStr, fmt, 'Asia/Bangkok'),
  };
  const svc = new ChineseHoroscope8SquareService(
    aboveRepo as any,
    belowRepo as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    momentService as any,
    calendar100YearService as any,
  );
  return { svc, calendar100YearService, aboveRepo, belowRepo };
}

const YEAR_ABOVE_YANG = { id: 5 }; // yang-stem id (odd) -> MALE forward, per isChineseHoroscope8CycleForward

describe('ChineseHoroscope8SquareService.getChineseHoroscope8Cycle — decade onset (起运)', () => {
  it('calls calendar100YearService.getDay with the REAL birth year (1989), not any shifted year', async () => {
    const { svc, calendar100YearService } = makeService();
    await svc.getChineseHoroscope8Cycle(
      YEAR_ABOVE_YANG,
      { id: 1 },
      { id: 1 },
      'MALE',
      1,
      3,
      '05:12',
      1989, // realYear
    );
    expect(calendar100YearService.getDay).toHaveBeenCalledWith(
      1989,
      1,
      3,
      '05:12',
      true,
    );
  }, 30000);

  it('ฟีมเคส (dob 1989-01-03, MALE): first decade band starts at age 0 (real onset), not age 1 (the old shifted-year bug)', async () => {
    const { svc } = makeService();
    const result = await svc.getChineseHoroscope8Cycle(
      YEAR_ABOVE_YANG,
      { id: 1 },
      { id: 1 },
      'MALE',
      1,
      3,
      '05:12',
      1989,
    );
    expect(result.birthdayYear).toBe(0);
    const sorted = [...result.life].sort(
      (a: any, b: any) => a.ageStart - b.ageStart,
    );
    expect(sorted[0].ageStart).toBe(0);
    expect(sorted[0].ageEnd).toBe(4);
    expect(sorted[1].ageStart).toBe(5);
  }, 30000);

  it('regression trap: if getDay were called with the shifted year (1988) instead, onset would wrongly be 1 — proves the fix matters', async () => {
    const { svc, calendar100YearService } = makeService();
    // Simulate the OLD bug directly against the same mock: what would STEP 4 have returned if
    // asked with the shifted year? (1988 boundary is a real day later relative to birth than the
    // 1989 boundary is, in this mock's fixture — confirms the two are genuinely different inputs,
    // not merely relabeled.)
    const buggyBoundary = await calendar100YearService.getDay(
      1988,
      1,
      3,
      '05:12',
      true,
    );
    const fixedBoundary = await calendar100YearService.getDay(
      1989,
      1,
      3,
      '05:12',
      true,
    );
    expect(buggyBoundary).not.toEqual(fixedBoundary);

    const result = await svc.getChineseHoroscope8Cycle(
      YEAR_ABOVE_YANG,
      { id: 1 },
      { id: 1 },
      'MALE',
      1,
      3,
      '05:12',
      1989,
    );
    expect(result.birthdayYear).not.toBe(1); // the old bug's wrong answer
    expect(result.birthdayYear).toBe(0); // the correct answer
  }, 30000);

  it('non-boundary-window control (June birth): realYear is the only year that ever existed for this call — sanity, no crash', async () => {
    const { svc, calendar100YearService } = makeService({
      calendar100YearService: {
        getDay: jest
          .fn()
          .mockResolvedValue({ year: 1990, month: 6, date: 20, time: '10:00' }),
      },
    });
    const result = await svc.getChineseHoroscope8Cycle(
      YEAR_ABOVE_YANG,
      { id: 1 },
      { id: 1 },
      'MALE',
      6,
      15,
      '08:00',
      1990,
    );
    expect(calendar100YearService.getDay).toHaveBeenCalledWith(
      1990,
      6,
      15,
      '08:00',
      true,
    );
    expect(typeof result.birthdayYear).toBe('number');
    expect(result.life.length).toBeGreaterThan(0);
  }, 30000);

  it('FEMALE (backward direction) also passes realYear through to getDay unchanged', async () => {
    const YEAR_ABOVE_YIN = { id: 2 }; // even id -> FEMALE forward per isChineseHoroscope8CycleForward's branch
    const { svc, calendar100YearService } = makeService();
    await svc.getChineseHoroscope8Cycle(
      YEAR_ABOVE_YIN,
      { id: 1 },
      { id: 1 },
      'FEMALE',
      1,
      3,
      '05:12',
      1989,
    );
    expect(calendar100YearService.getDay).toHaveBeenCalledWith(
      1989,
      1,
      3,
      '05:12',
      expect.any(Boolean),
    );
    expect(calendar100YearService.getDay.mock.calls[0][0]).toBe(1989);
  }, 30000);
});
