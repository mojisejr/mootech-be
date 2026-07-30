// Unit tests for the PURE bazi pair-match mapper (Slice 2B).
// Fixtures mirror the real shape of POST /api/bazi/pair-match (verified from the
// bazi route source: overall/dimensions/persons/elementInteraction + fourPillars).
import { mapBaziPairToResult } from './bazi-pair.mapper';
import { BaziPairResponse } from './bazi-pair.types';
import {
  buildDescFromPairMatch,
  mapPairMatchToComputeResult,
  mapPairMatchToResult,
  toPairMatchPerson,
  toPairMatchRequest,
} from './bazi-pair-match.mapper';
import { BaziPairMatchResponse } from './bazi-pair-match.types';

// A pair-match response for a LOVE pairing. Values chosen to mirror PAIR_SAMPLE below
// so the v1 result block can be proven byte-equal across the two connectors (D9).
const PM_SAMPLE: BaziPairMatchResponse = {
  relationship: 'love',
  relationshipLabel: 'ดูดวงคู่รัก',
  ourLabel: 'ตัวเรา',
  partnerLabel: 'เขา',
  domain: 'love',
  note: null,
  persons: {
    a: {
      displayName: 'เอ',
      dayGanzhi: '己巳',
      elementTh: 'ดิน',
      stageTh: 'ตี้อ๋วง',
      nisai: ['ก้าน: ...', 'ราศี: ...', 'เชี่ยงแซ: ...'],
      timeKnown: true,
      fourPillars: {
        year: { stem: '庚', branch: '午', element: 'ทอง' },
        month: { stem: '辛', branch: '巳', element: 'ทอง' },
        day: { stem: '己', branch: '巳', element: 'ดิน' },
        hour: { stem: '戊', branch: '辰', element: 'ดิน' },
      },
    },
    b: {
      displayName: 'บี',
      dayGanzhi: '丙午',
      elementTh: 'ไฟ',
      stageTh: 'ลิ่มกัว',
      nisai: ['ก้าน: ...', 'ราศี: ...', 'เชี่ยงแซ: ...'],
      timeKnown: false,
      fourPillars: {
        year: { stem: '戊', branch: '辰', element: 'ดิน' },
        month: { stem: '壬', branch: '戌', element: 'น้ำ' },
        day: { stem: '丙', branch: '午', element: 'ไฟ' },
        hour: { stem: '甲', branch: '午', element: 'ไม้' },
      },
    },
  },
  overall: {
    percent: 40,
    grade: 'D+',
    gradeLabel: 'พอไปได้',
    hearts: 2,
    emoji: '💛',
    ratingText: 'เป็นความสัมพันธ์ที่อบอุ่น เข้าใจกันดี',
  },
  dimensions: [
    {
      key: 'day',
      label: 'เสาวัน',
      pairingLabel: 'ดิถีคู่',
      percent: 40,
      grade: 'D+',
      ratingText: 'เข้าใจกันดี ดูแลใจกัน',
      isMain: true,
      sising: null,
    },
    {
      key: 'year',
      label: 'เสาปี',
      pairingLabel: '',
      percent: null,
      ratingText: '',
      isMain: false,
      sising: null,
    },
    {
      key: 'month',
      label: 'เสาเดือน',
      pairingLabel: 'เดือนคู่',
      percent: 30,
      ratingText: 'ต้องปรับจูนเรื่องเวลา',
      isMain: false,
      sising: null,
    },
  ],
  elementInteraction: {
    aElementTh: 'ดิน',
    bElementTh: 'ไฟ',
    summaryTh: 'ธาตุของทั้งคู่เสริมกันบางส่วน',
    aToB: { relation: 'resource', labelTh: 'ส่งเสริมดิถี', meaningTh: 'เขาส่งเสริมเรา' },
    bToA: { relation: 'wealth', labelTh: 'ดิถีพิฆาต', meaningTh: 'เราควบคุมเขา' },
  },
};

// The /pair response carrying the SAME underlying numbers/prose — used to prove the
// v1 result block is identical whichever connector produced it.
const PAIR_SAMPLE: BaziPairResponse = {
  personA: {},
  personB: {},
  relationship: 'love',
  comparison: {
    match: { love: { overallPercent: 40, overallGrade: 'D+' } },
    elementInteraction: { summaryTh: 'ธาตุของทั้งคู่เสริมกันบางส่วน' },
  },
  facets: [
    { label: 'เสาวัน', pairingLabel: 'ดิถีคู่', percent: 40, grade: 'D+', found: true, ratingText: 'เข้าใจกันดี ดูแลใจกัน' },
    { label: 'เสาปี', percent: null, found: false, ratingText: '' },
    { label: 'เสาเดือน', pairingLabel: 'เดือนคู่', percent: 30, found: true, ratingText: 'ต้องปรับจูนเรื่องเวลา' },
  ],
  mainFacet: { label: 'เสาวัน', percent: 40, grade: 'D+', isMain: true, ratingText: 'เป็นความสัมพันธ์ที่อบอุ่น เข้าใจกันดี' },
};

describe('toPairMatchPerson / toPairMatchRequest', () => {
  const ok = { name: 'เอ', gender: 'FEMALE', dob: '1990-01-15', time: '08:30' };
  const noTime = { name: 'บี', gender: 'MALE', dob: '1992-06-20', time: '' };
  const noDate = { name: 'ซี', gender: 'MALE', dob: '', time: '08:30' };

  it('includes birthTime + displayName when the time is known', () => {
    expect(toPairMatchPerson(ok)).toEqual({
      birthDate: '1990-01-15',
      birthTime: '08:30',
      gender: 'female',
      province: 'กรุงเทพมหานคร',
      displayName: 'เอ',
    });
  });

  it('OMITS birthTime when the time is unknown (route → timeKnown=false, not a noon default)', () => {
    const p = toPairMatchPerson(noTime);
    expect(p).not.toBeNull();
    expect('birthTime' in (p as object)).toBe(false);
    expect(p?.gender).toBe('male');
    expect(p?.displayName).toBe('บี');
  });

  it('returns null only when the DATE is missing', () => {
    expect(toPairMatchPerson(noDate)).toBeNull();
    expect(toPairMatchRequest(ok, noDate, 'LOVE')).toBeNull();
    expect(toPairMatchRequest(noDate, ok, 'BOSS')).toBeNull();
  });

  it('maps the matching type to the engine relationship', () => {
    expect(toPairMatchRequest(ok, ok, 'EMPLOYEE')?.relationship).toBe('subordinate');
    expect(toPairMatchRequest(ok, ok, 'FRIEND')?.relationship).toBe('partner');
    expect(toPairMatchRequest(ok, noTime, 'LOVE')?.personB).not.toHaveProperty('birthTime');
  });
});

describe('buildDescFromPairMatch', () => {
  it('composes bullets from element summary + rated dimensions (skips empty)', () => {
    const desc = buildDescFromPairMatch(PM_SAMPLE);
    expect(desc[0].note).toBe('ธาตุของทั้งคู่เสริมกันบางส่วน');
    expect(desc).toContainEqual({ note: 'ดิถีคู่: เข้าใจกันดี ดูแลใจกัน' });
    expect(desc).toContainEqual({ note: 'เดือนคู่: ต้องปรับจูนเรื่องเวลา' });
    expect(desc.find((d) => d.note.includes('เสาปี'))).toBeUndefined();
  });

  it('falls back to overall prose when no dimensions carry text', () => {
    expect(buildDescFromPairMatch({ overall: { ratingText: 'สรุปรวม' } })).toEqual([{ note: 'สรุปรวม' }]);
  });

  it('never throws on empty response', () => {
    expect(buildDescFromPairMatch({})).toEqual([]);
  });
});

describe('mapPairMatchToResult — v1 block', () => {
  it('produces the legacy result block (score/rating/desc/engine)', () => {
    const r = mapPairMatchToResult(PM_SAMPLE, 'LOVE');
    expect(r.score).toBe(40);
    expect(r.rating.rating).toBe(4); // ceil(40/10)
    expect(r.rating.note).toContain('อบอุ่น');
    expect(r.result.engine).toBe('bazi');
    expect(r.result.relationship).toBe('love');
    expect(r.result.domain).toBe('love');
    expect(r.desc.length).toBeGreaterThan(0);
  });

  it('yields score 0 without throwing on an empty response', () => {
    const r = mapPairMatchToResult({}, 'FRIEND');
    expect(r.score).toBe(0);
    expect(r.rating.rating).toBe(1);
    expect(r.desc).toEqual([]);
  });

  // D9: the deciding gate — v1 /matching/result must keep rendering. Prove the block
  // is byte-identical to what the legacy /pair connector produced for the same numbers.
  it('D9: v1 result block is identical to the /pair connector output', () => {
    const viaPairMatch = mapPairMatchToResult(PM_SAMPLE, 'LOVE');
    const viaPair = mapBaziPairToResult(PAIR_SAMPLE, 'LOVE');
    expect(viaPairMatch).toEqual(viaPair);
  });
});

describe('mapPairMatchToComputeResult — v1 block + whole blob (D7)', () => {
  it('nests the v1 result and keeps the WHOLE pair-match blob verbatim', () => {
    const c = mapPairMatchToComputeResult(PM_SAMPLE, 'LOVE');
    // v1 block for /matching/result
    expect(c.result.score).toBe(40);
    // me/you = slim persons (FE ignores; 2C reads pairMatch.persons)
    expect(c.me).toBe(PM_SAMPLE.persons?.a);
    expect(c.you).toBe(PM_SAMPLE.persons?.b);
    // D7: the rich fields the new FE needs survive un-compressed
    expect(c.pairMatch).toBe(PM_SAMPLE);
    expect(c.pairMatch.overall?.percent).toBe(40);
    expect(c.pairMatch.dimensions?.length).toBe(3);
    expect(c.pairMatch.elementInteraction?.aToB).toEqual({ relation: 'resource', labelTh: 'ส่งเสริมดิถี', meaningTh: 'เขาส่งเสริมเรา' });
    expect(c.pairMatch.elementInteraction?.bToA).toBeTruthy();
    expect((c.pairMatch.persons?.a as any).fourPillars.day).toEqual({ stem: '己', branch: '巳', element: 'ดิน' });
    expect((c.pairMatch.persons?.b as any).timeKnown).toBe(false);
  });

  it('tolerates a missing/empty response', () => {
    const c = mapPairMatchToComputeResult({}, 'LOVE');
    expect(c.me).toBeNull();
    expect(c.you).toBeNull();
    expect(c.result.score).toBe(0);
    expect(c.pairMatch).toEqual({});
  });
});
