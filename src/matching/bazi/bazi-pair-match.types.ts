// Types for the bazi pair-match connector (Slice 2B — ดวงสมพงศ์ result page).
// The bazi engine exposes POST /api/bazi/pair-match — the consumer endpoint whose
// response is shaped for the new result screen (overall/dimensions/persons/
// elementInteraction) rather than the raw charts /api/bazi/pair returns.
//
// BE role here is "ยกกล่องส่งต่อ" only: reshape the response into the legacy v1
// result block the current /matching/result page reads, AND keep the WHOLE
// pair-match blob so the new FE (2C) can read the rich fields. No astrology logic.
import { MatchingResultShape } from './bazi-pair.types';

// pair-match accepts the engine relationships + "family"; resolveRelationship only
// ever yields the first four, but the type mirrors the route's enum.
export type PairMatchRelationship =
  | 'love'
  | 'partner'
  | 'boss'
  | 'subordinate'
  | 'family';

// One person as /api/bazi/pair-match expects. birthTime is OPTIONAL by design:
// omitting it lets the route apply its own noon default AND flag timeKnown=false,
// so the result screen can honestly show "—" for an unknown hour.
export interface BaziPairMatchPersonInput {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM — omit when unknown (route defaults noon + timeKnown=false)
  gender: 'male' | 'female' | 'unspecified';
  province?: string;
  displayName?: string;
}

export interface BaziPairMatchRequest {
  relationship: PairMatchRelationship;
  personA: BaziPairMatchPersonInput;
  personB: BaziPairMatchPersonInput;
}

// --- Response slice we read to rebuild the v1 block (the WHOLE object is kept too). ---
export interface PairMatchOverall {
  percent?: number | null;
  grade?: string | null;
  gradeLabel?: string;
  hearts?: number;
  emoji?: string | null;
  ratingText?: string;
}

export interface PairMatchDimension {
  key?: string;
  label?: string;
  pairingLabel?: string;
  percent?: number | null;
  grade?: string;
  ratingText?: string;
  isMain?: boolean;
  sising?: unknown;
}

export interface PairMatchElementInteraction {
  aElementTh?: string;
  bElementTh?: string;
  summaryTh?: string;
  aToB?: unknown;
  bToA?: unknown;
}

// Only the fields the mapper reads are typed; extra fields (relationshipLabel,
// fourPillars, mascot-less persons, note, ...) ride along untyped and are preserved
// verbatim in `pairMatch` — nothing is compressed out (D7).
export interface BaziPairMatchResponse {
  relationship?: string;
  domain?: string;
  persons?: { a?: unknown; b?: unknown };
  overall?: PairMatchOverall;
  dimensions?: PairMatchDimension[];
  elementInteraction?: PairMatchElementInteraction;
  [key: string]: unknown;
}

// What compatibilityLove/Work returns and matching.service stringifies into
// log_matching.result: the legacy v1 block PLUS the whole raw pair-match blob.
export interface PairMatchComputeResult {
  me: unknown;
  you: unknown;
  result: MatchingResultShape;
  pairMatch: BaziPairMatchResponse; // the whole blob the new FE (2C) reads
}
