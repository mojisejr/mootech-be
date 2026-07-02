// PURE mapping layer for the bazi pair-matching swap (#mootech-matching-bazi-swap).
// No I/O — fully unit-testable. Two responsibilities:
//   1. Build the bazi /api/bazi/pair request from the two-person input the
//      matching path already resolves (name/gender/dob/time).
//   2. Reshape the bazi response into the legacy mootech matching result the FE
//      already renders (result.{score, rating.rating, rating.note, desc[].note}).
//
// Missing-time policy (operator decision 2026-07-01, Option A): bazi requires a
// birth time, but the product treats birth time as optional. So when a person has
// no usable time we DEFAULT it to 12:00 (noon) rather than falling back to legacy.
// Compatibility keys mainly off the day/year/month pillars (time-independent), so
// the default only shapes the minor hour facet. A missing DATE still returns null.
import {
  BaziPairRequest,
  BaziPairResponse,
  BaziRawInput,
  BaziRelationship,
  MatchingComputeResult,
  MatchingDescShape,
  MatchingPersonInput,
  MatchingRatingShape,
  MatchingResultShape,
  MatchingType,
} from './bazi-pair.types';

const DEFAULT_PROVINCE = 'กรุงเทพมหานคร';
// Fallback birth time when a person's time is unknown (product allows optional time).
const DEFAULT_BIRTH_TIME = '12:00';

// matching_type (FE/legacy) -> bazi relationship + scoring domain.
export function resolveRelationship(type: MatchingType): {
  relationship: BaziRelationship;
  domain: 'love' | 'work';
} {
  switch (type) {
    case 'LOVE':
      return { relationship: 'love', domain: 'love' };
    case 'BOSS':
      return { relationship: 'boss', domain: 'work' };
    case 'EMPLOYEE':
      return { relationship: 'subordinate', domain: 'work' };
    case 'FRIEND':
      return { relationship: 'partner', domain: 'work' };
    default:
      return { relationship: 'love', domain: 'love' };
  }
}

export function normalizeGender(gender?: string): 'male' | 'female' {
  return String(gender ?? '')
    .trim()
    .toLowerCase()
    .startsWith('f')
    ? 'female'
    : 'male';
}

// Accepts ISO-ish dates ("1990-01-15", "1990-01-15T00:00:00Z"); returns
// "YYYY-MM-DD" or '' when it cannot be confidently parsed.
export function normalizeDate(dob?: string): string {
  const raw = String(dob ?? '').trim();
  if (!raw) {
    return '';
  }
  const head = raw.replace('T', ' ').split(' ')[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(head) ? head : '';
}

// Accepts "HH:MM", "H:MM", "HH:MM:SS"; returns zero-padded "HH:MM" or '' when invalid.
export function normalizeTime(time?: string): string {
  const raw = String(time ?? '').trim();
  if (!raw) {
    return '';
  }
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) {
    return '';
  }
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return '';
  }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Build one person's bazi RawInput. A missing/invalid DATE returns null (no sane
// default); a missing/invalid TIME defaults to noon so bazi still runs (Option A).
export function toRawInput(person: MatchingPersonInput): BaziRawInput | null {
  const birthDate = normalizeDate(person?.dob);
  if (!birthDate) {
    return null;
  }
  const birthTime = normalizeTime(person?.time) || DEFAULT_BIRTH_TIME;
  return {
    birthDate,
    birthTime,
    gender: normalizeGender(person?.gender),
    province: DEFAULT_PROVINCE,
    calendarSystem: 'solar',
    timezone: 'Asia/Bangkok',
  };
}

// Build the full pair request; null if either person is not usable (caller falls back).
export function toBaziPairRequest(
  me: MatchingPersonInput,
  you: MatchingPersonInput,
  type: MatchingType,
): BaziPairRequest | null {
  const personA = toRawInput(me);
  const personB = toRawInput(you);
  if (!personA || !personB) {
    return null;
  }
  return {
    personA,
    personB,
    relationship: resolveRelationship(type).relationship,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// 0-100 percent -> legacy 1-10 rating band, carrying the bazi prose as the note.
export function buildRating(
  percent: number,
  note: string,
  grade: string,
): MatchingRatingShape {
  const score = clamp(Math.round(percent), 0, 100);
  const rating = clamp(Math.ceil(score / 10), 1, 10);
  const start_score = (rating - 1) * 10;
  const end_score = rating * 10;
  return {
    rating,
    note: note || grade || '',
    start_score,
    end_score,
  };
}

// Compose readable Thai bullets from element interaction + the per-aspect facets.
export function buildDesc(resp: BaziPairResponse): MatchingDescShape[] {
  const desc: MatchingDescShape[] = [];

  const summary = resp?.comparison?.elementInteraction?.summaryTh;
  if (typeof summary === 'string' && summary.trim()) {
    desc.push({ note: summary.trim() });
  }

  const facets = Array.isArray(resp?.facets) ? resp.facets : [];
  for (const f of facets) {
    if (!f || f.found === false) {
      continue;
    }
    const text = typeof f.ratingText === 'string' ? f.ratingText.trim() : '';
    if (!text) {
      continue;
    }
    const label = (f.pairingLabel || f.label || '').trim();
    desc.push({ note: label ? `${label}: ${text}` : text });
  }

  if (desc.length === 0) {
    const main = resp?.mainFacet?.ratingText;
    if (typeof main === 'string' && main.trim()) {
      desc.push({ note: main.trim() });
    }
  }

  return desc;
}

// Reshape a bazi pair response into the legacy result block (result.{score,rating,desc}).
export function mapBaziPairToResult(
  resp: BaziPairResponse,
  type: MatchingType,
): MatchingResultShape {
  const { relationship, domain } = resolveRelationship(type);
  const main = resp?.mainFacet ?? null;
  const overall = resp?.comparison?.match?.[domain];

  const percent =
    (main && typeof main.percent === 'number' ? main.percent : null) ??
    (overall && typeof overall.overallPercent === 'number'
      ? overall.overallPercent
      : null) ??
    0;

  const grade = (main && main.grade) || (overall && overall.overallGrade) || '';

  const note = (main && main.ratingText) || '';
  const score = Math.round(percent * 100) / 100;

  return {
    result: {
      engine: 'bazi',
      relationship,
      domain,
      percent,
      grade: grade || null,
    },
    score,
    rating: buildRating(percent, note, grade),
    desc: buildDesc(resp),
  };
}

// Full compute result that matching.service stringifies. me/you carry the bazi
// charts for traceability (the FE ignores them).
export function mapBaziPairToComputeResult(
  resp: BaziPairResponse,
  type: MatchingType,
): MatchingComputeResult {
  return {
    me: resp?.personA ?? null,
    you: resp?.personB ?? null,
    result: mapBaziPairToResult(resp, type),
  };
}
