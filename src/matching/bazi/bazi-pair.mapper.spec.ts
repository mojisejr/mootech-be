// Unit tests for the PURE bazi pair mapper (#mootech-matching-bazi-swap).
// Fixtures mirror the real shape captured from POST /api/bazi/pair (Phase 0 probe).
import {
  buildDesc,
  buildRating,
  mapBaziPairToComputeResult,
  mapBaziPairToResult,
  normalizeDate,
  normalizeGender,
  normalizeTime,
  resolveRelationship,
  toBaziPairRequest,
  toRawInput,
} from './bazi-pair.mapper';
import { BaziPairResponse } from './bazi-pair.types';

const SAMPLE: BaziPairResponse = {
  personA: { fourPillars: { day: { stem: '己', branch: '巳' } } },
  personB: { fourPillars: { day: { stem: '丙', branch: '午' } } },
  relationship: 'love',
  comparison: {
    match: {
      love: { overallPercent: 35, overallGrade: 'D+' },
      work: { overallPercent: 62, overallGrade: 'C' },
    },
    elementInteraction: { summaryTh: 'ธาตุของทั้งคู่เสริมกันบางส่วน' },
  },
  facets: [
    {
      label: 'เสาวัน',
      pairingLabel: 'ดิถีคู่',
      percent: 40,
      grade: 'D+',
      found: true,
      ratingText: 'เข้าใจกันดี ดูแลใจกัน',
    },
    {
      label: 'เสาปี',
      percent: null,
      found: false,
      ratingText: '',
    },
    {
      label: 'เสาเดือน',
      pairingLabel: 'เดือนคู่',
      percent: 30,
      found: true,
      ratingText: 'ต้องปรับจูนเรื่องเวลา',
    },
  ],
  mainFacet: {
    label: 'เสาวัน',
    percent: 40,
    grade: 'D+',
    isMain: true,
    ratingText: 'เป็นความสัมพันธ์ที่อบอุ่น เข้าใจกันดี',
  },
};

describe('resolveRelationship', () => {
  it('maps every matching_type to relationship + domain', () => {
    expect(resolveRelationship('LOVE')).toEqual({
      relationship: 'love',
      domain: 'love',
    });
    expect(resolveRelationship('BOSS')).toEqual({
      relationship: 'boss',
      domain: 'work',
    });
    expect(resolveRelationship('EMPLOYEE')).toEqual({
      relationship: 'subordinate',
      domain: 'work',
    });
    expect(resolveRelationship('FRIEND')).toEqual({
      relationship: 'partner',
      domain: 'work',
    });
  });
});

describe('normalizers', () => {
  it('normalizeGender', () => {
    expect(normalizeGender('MALE')).toBe('male');
    expect(normalizeGender('FEMALE')).toBe('female');
    expect(normalizeGender('female')).toBe('female');
    expect(normalizeGender(undefined)).toBe('male');
  });

  it('normalizeDate', () => {
    expect(normalizeDate('1990-01-15')).toBe('1990-01-15');
    expect(normalizeDate('1990-01-15T00:00:00.000Z')).toBe('1990-01-15');
    expect(normalizeDate('1990-01-15 08:30')).toBe('1990-01-15');
    expect(normalizeDate('15/01/1990')).toBe('');
    expect(normalizeDate('')).toBe('');
    expect(normalizeDate(undefined)).toBe('');
  });

  it('normalizeTime', () => {
    expect(normalizeTime('08:30')).toBe('08:30');
    expect(normalizeTime('8:30')).toBe('08:30');
    expect(normalizeTime('14:00:00')).toBe('14:00');
    expect(normalizeTime('25:00')).toBe('');
    expect(normalizeTime('')).toBe('');
    expect(normalizeTime(undefined)).toBe('');
  });
});

describe('toRawInput / toBaziPairRequest (missing-time -> default noon)', () => {
  const ok = { name: 'A', gender: 'MALE', dob: '1990-01-15', time: '08:30' };
  const noTime = { name: 'B', gender: 'FEMALE', dob: '1992-06-20', time: '' };
  const noDate = { name: 'C', gender: 'MALE', dob: '', time: '08:30' };

  it('builds a RawInput for complete input', () => {
    expect(toRawInput(ok)).toEqual({
      birthDate: '1990-01-15',
      birthTime: '08:30',
      gender: 'male',
      province: 'กรุงเทพมหานคร',
      calendarSystem: 'solar',
      timezone: 'Asia/Bangkok',
    });
  });

  it('defaults time to 12:00 when time is missing (Option A)', () => {
    expect(toRawInput(noTime)).toEqual({
      birthDate: '1992-06-20',
      birthTime: '12:00',
      gender: 'female',
      province: 'กรุงเทพมหานคร',
      calendarSystem: 'solar',
      timezone: 'Asia/Bangkok',
    });
  });

  it('returns null only when the DATE is missing', () => {
    expect(toRawInput(noDate)).toBeNull();
    expect(toBaziPairRequest(ok, noDate, 'LOVE')).toBeNull();
    expect(toBaziPairRequest(noDate, ok, 'BOSS')).toBeNull();
  });

  it('builds a request even when a person has no time (defaults noon)', () => {
    const req = toBaziPairRequest(ok, noTime, 'LOVE');
    expect(req).not.toBeNull();
    expect(req?.personB.birthTime).toBe('12:00');
  });

  it('builds a full request with mapped relationship for usable input', () => {
    const req = toBaziPairRequest(ok, ok, 'EMPLOYEE');
    expect(req).not.toBeNull();
    expect(req?.relationship).toBe('subordinate');
    expect(req?.personA.gender).toBe('male');
    expect(req?.personB.birthTime).toBe('08:30');
  });
});

describe('buildRating', () => {
  it('maps percent to a 1-10 band and carries the prose note', () => {
    const r = buildRating(35, 'อบอุ่น', 'D+');
    expect(r.rating).toBe(4); // ceil(35/10)
    expect(r.note).toBe('อบอุ่น');
    expect(r.start_score).toBe(30);
    expect(r.end_score).toBe(40);
  });

  it('clamps and falls back note to grade', () => {
    expect(buildRating(0, '', 'F').rating).toBe(1);
    expect(buildRating(100, '', 'A').rating).toBe(10);
    expect(buildRating(50, '', 'C').note).toBe('C');
  });
});

describe('buildDesc', () => {
  it('composes bullets from element summary + found facets', () => {
    const desc = buildDesc(SAMPLE);
    expect(desc[0].note).toBe('ธาตุของทั้งคู่เสริมกันบางส่วน');
    expect(desc).toContainEqual({ note: 'ดิถีคู่: เข้าใจกันดี ดูแลใจกัน' });
    expect(desc).toContainEqual({ note: 'เดือนคู่: ต้องปรับจูนเรื่องเวลา' });
    // the not-found / empty facet is skipped
    expect(desc.find((d) => d.note.includes('เสาปี'))).toBeUndefined();
  });

  it('falls back to mainFacet prose when nothing else is present', () => {
    const desc = buildDesc({ mainFacet: { ratingText: 'สรุปรวม' } });
    expect(desc).toEqual([{ note: 'สรุปรวม' }]);
  });

  it('never throws on empty response', () => {
    expect(buildDesc({})).toEqual([]);
  });
});

describe('mapBaziPairToResult', () => {
  it('produces the legacy result block (LOVE uses mainFacet percent)', () => {
    const r = mapBaziPairToResult(SAMPLE, 'LOVE');
    expect(r.score).toBe(40); // mainFacet.percent preferred
    expect(r.rating.rating).toBe(4);
    expect(r.rating.note).toContain('อบอุ่น');
    expect(Array.isArray(r.desc)).toBe(true);
    expect(r.desc.length).toBeGreaterThan(0);
    expect(r.result.engine).toBe('bazi');
    expect(r.result.relationship).toBe('love');
  });

  it('falls back to overall percent when mainFacet has no percent', () => {
    const noMain: BaziPairResponse = {
      comparison: {
        match: { work: { overallPercent: 62, overallGrade: 'C' } },
      },
      mainFacet: null,
    };
    const r = mapBaziPairToResult(noMain, 'BOSS');
    expect(r.score).toBe(62);
    expect(r.rating.rating).toBe(7); // ceil(62/10)
    expect(r.result.domain).toBe('work');
  });

  it('does not throw and yields score 0 on an empty response', () => {
    const r = mapBaziPairToResult({}, 'FRIEND');
    expect(r.score).toBe(0);
    expect(r.rating.rating).toBe(1);
    expect(r.desc).toEqual([]);
  });
});

describe('mapBaziPairToComputeResult', () => {
  it('passes through me/you and nests the result block', () => {
    const c = mapBaziPairToComputeResult(SAMPLE, 'LOVE');
    expect(c.me).toBe(SAMPLE.personA);
    expect(c.you).toBe(SAMPLE.personB);
    expect(c.result.score).toBe(40);
  });

  it('tolerates missing charts', () => {
    const c = mapBaziPairToComputeResult({}, 'LOVE');
    expect(c.me).toBeNull();
    expect(c.you).toBeNull();
    expect(c.result.score).toBe(0);
  });
});
