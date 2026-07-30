// PURE mapping layer for the bazi pair-match connector (Slice 2B). No I/O.
// Two responsibilities, both pure reshape — NO astrology logic (D8):
//   1. Build the /api/bazi/pair-match request from the two-person matching input.
//   2. Reshape the response into (a) the legacy v1 result block the current
//      /matching/result page already reads (result.{score, rating.rating,
//      rating.note, desc[].note}) — byte-compatible with the /pair mapper so v1
//      keeps rendering (D9) — and (b) the WHOLE raw blob preserved for the new FE.
//
// Reuses the /pair mapper's pure normalizers + buildRating (identical bands) so the
// two connectors cannot drift on the numbers v1 depends on.
import {
  buildRating,
  normalizeDate,
  normalizeGender,
  normalizeTime,
  resolveRelationship,
} from './bazi-pair.mapper';
import {
  MatchingDescShape,
  MatchingPersonInput,
  MatchingResultShape,
  MatchingType,
} from './bazi-pair.types';
import {
  BaziPairMatchPersonInput,
  BaziPairMatchRequest,
  BaziPairMatchResponse,
  PairMatchComputeResult,
} from './bazi-pair-match.types';

const DEFAULT_PROVINCE = 'กรุงเทพมหานคร';

// Build one person for /pair-match. A missing/invalid DATE returns null (caller falls
// back). birthTime is OMITTED when unknown — the route applies its own noon default
// AND sets timeKnown=false, so the score stays identical to the legacy noon-send path
// while the FE learns the hour was unknown (shows "—"). Never defaults time here.
export function toPairMatchPerson(
  person: MatchingPersonInput,
): BaziPairMatchPersonInput | null {
  const birthDate = normalizeDate(person?.dob);
  if (!birthDate) {
    return null;
  }
  const birthTime = normalizeTime(person?.time); // '' when unknown/invalid
  const out: BaziPairMatchPersonInput = {
    birthDate,
    gender: normalizeGender(person?.gender),
    province: DEFAULT_PROVINCE,
  };
  if (birthTime) {
    out.birthTime = birthTime; // present only when known → timeKnown=true at the route
  }
  const name = String(person?.name ?? '').trim();
  if (name) {
    out.displayName = name;
  }
  return out;
}

// Build the full pair-match request; null if either person is not usable.
export function toPairMatchRequest(
  me: MatchingPersonInput,
  you: MatchingPersonInput,
  type: MatchingType,
): BaziPairMatchRequest | null {
  const personA = toPairMatchPerson(me);
  const personB = toPairMatchPerson(you);
  if (!personA || !personB) {
    return null;
  }
  return {
    relationship: resolveRelationship(type).relationship,
    personA,
    personB,
  };
}

// Compose the legacy Thai desc bullets from the pair-match response. The `dimensions`
// are the slimmed facets the /pair mapper read as `facets`, so the same bullets come
// out (element summary first, then "<pairingLabel|label>: <ratingText>" per dimension,
// finally the overall prose as a fallback).
export function buildDescFromPairMatch(
  resp: BaziPairMatchResponse,
): MatchingDescShape[] {
  const desc: MatchingDescShape[] = [];

  const summary = resp?.elementInteraction?.summaryTh;
  if (typeof summary === 'string' && summary.trim()) {
    desc.push({ note: summary.trim() });
  }

  const dims = Array.isArray(resp?.dimensions) ? resp.dimensions : [];
  for (const d of dims) {
    const text = typeof d?.ratingText === 'string' ? d.ratingText.trim() : '';
    if (!text) {
      continue;
    }
    const label = (d?.pairingLabel || d?.label || '').trim();
    desc.push({ note: label ? `${label}: ${text}` : text });
  }

  if (desc.length === 0) {
    const main = resp?.overall?.ratingText;
    if (typeof main === 'string' && main.trim()) {
      desc.push({ note: main.trim() });
    }
  }

  return desc;
}

// Reshape a pair-match response into the legacy v1 result block. Same shape the /pair
// mapper produces (result.{engine,relationship,domain,percent,grade} + score + rating
// + desc), so /matching/result reads it unchanged. `domain` comes from the matching
// type (not resp.domain) to stay identical to the legacy mapper.
export function mapPairMatchToResult(
  resp: BaziPairMatchResponse,
  type: MatchingType,
): MatchingResultShape {
  const { relationship, domain } = resolveRelationship(type);

  const rawPercent = resp?.overall?.percent;
  const percent = typeof rawPercent === 'number' ? rawPercent : 0;
  const grade = (resp?.overall?.grade as string) || '';
  const note = (resp?.overall?.ratingText as string) || '';
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
    desc: buildDescFromPairMatch(resp),
  };
}

// Full compute result matching.service stringifies into log_matching.result:
// the v1 block PLUS the whole raw pair-match blob (D7 — ห้ามบีบทิ้ง). me/you carry the
// slim person profiles for traceability (v1 ignores them; 2C reads pairMatch.persons).
export function mapPairMatchToComputeResult(
  resp: BaziPairMatchResponse,
  type: MatchingType,
): PairMatchComputeResult {
  return {
    me: resp?.persons?.a ?? null,
    you: resp?.persons?.b ?? null,
    result: mapPairMatchToResult(resp, type),
    pairMatch: resp ?? {},
  };
}
