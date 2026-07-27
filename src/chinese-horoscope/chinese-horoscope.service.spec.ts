import { ChineseHoroscopeService } from './chinese-horoscope.service';

// Focused unit test for getResult's null-guard. getResult only depends on logCalculateService, so we build a
// prototype instance and stub just that one dependency — avoiding the ~30-provider constructor. This locks the
// behavior: a missing row can never again throw a 500 (it returns an explicit empty envelope {data:null}, per
// the #167 "keep the {data} shape, never bare null" rule), while a real stored row still parses through.
describe('ChineseHoroscopeService.getResult — null-guard (missing row -> 200 {data:null}, not 500)', () => {
  function svcWith(
    getLogCalculate: (code: string, userId: string) => Promise<any>,
  ): ChineseHoroscopeService {
    const svc = Object.create(ChineseHoroscopeService.prototype);
    svc.logCalculateService = { getLogCalculate };
    return svc as ChineseHoroscopeService;
  }

  it('returns {data:null} when there is no saved chart (no throw)', async () => {
    const svc = svcWith(async () => null);
    await expect(
      svc.getResult({ code: 'nope', userId: 'nobody' } as any),
    ).resolves.toEqual({ data: null });
  });

  it('returns the parsed chart enveloped when a row exists', async () => {
    const chart = {
      summary: { mascot: 1 },
      detail: { dayAbove: { element: 'wood' } },
    };
    const svc = svcWith(async () => ({ result: JSON.stringify(chart) }));
    await expect(
      svc.getResult({ code: 'c', userId: 'u' } as any),
    ).resolves.toEqual({ data: chart });
  });

  it('still throws on a malformed stored row (a real 500, deliberately not swallowed)', async () => {
    const svc = svcWith(async () => ({ result: '{not valid json' }));
    await expect(
      svc.getResult({ code: 'c', userId: 'u' } as any),
    ).rejects.toBeInstanceOf(SyntaxError);
  });
});
