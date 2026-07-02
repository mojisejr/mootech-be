// Types for the bazi pair-matching engine swap (#mootech-matching-bazi-swap).
// The bazi engine (projects/bazi) exposes POST /api/bazi/pair — a stateless,
// read-only compatibility computation. These types model just the request we
// send and the slice of the response we consume; the bazi response carries far
// more (full charts, roles, sising) that the mootech contract does not need.

export type MatchingType = 'LOVE' | 'BOSS' | 'EMPLOYEE' | 'FRIEND';

export type BaziRelationship = 'love' | 'partner' | 'boss' | 'subordinate';

// One person's birth input as the bazi pair route expects it (RawInputValue).
export interface BaziRawInput {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  gender: 'male' | 'female';
  province: string; // required by the route; has no effect (tz pinned to Bangkok)
  calendarSystem: 'solar' | 'lunar';
  timezone: string;
}

export interface BaziPairRequest {
  personA: BaziRawInput;
  personB: BaziRawInput;
  relationship: BaziRelationship;
}

// --- Response slice we actually read ---
export interface BaziMatchPair {
  overallPercent?: number | null;
  overallGrade?: string | null;
}

export interface BaziFacet {
  key?: string;
  label?: string;
  pairingLabel?: string;
  percent?: number | null;
  grade?: string;
  found?: boolean;
  isMain?: boolean;
  domain?: 'love' | 'work';
  ratingText?: string;
}

export interface BaziElementInteraction {
  summaryTh?: string;
}

export interface BaziComparison {
  match?: { love?: BaziMatchPair; work?: BaziMatchPair };
  elementInteraction?: BaziElementInteraction;
}

export interface BaziPairResponse {
  personA?: unknown;
  personB?: unknown;
  comparison?: BaziComparison;
  relationship?: string;
  facets?: BaziFacet[];
  mainFacet?: BaziFacet | null;
}

// --- Mapped output: the legacy mootech matching contract the FE already reads ---
// FE consumes only result.{score, rating.rating, rating.note, desc[].note}; the
// rest is preserved for parity/traceability.
export interface MatchingRatingShape {
  rating: number; // 1-10
  note: string;
  start_score: number;
  end_score: number;
}

export interface MatchingDescShape {
  note: string;
}

export interface MatchingResultShape {
  result: Record<string, unknown>;
  score: number;
  rating: MatchingRatingShape;
  desc: MatchingDescShape[];
}

// The full object compatibilityLove/Work returns and matching.service stringifies.
export interface MatchingComputeResult {
  me: unknown;
  you: unknown;
  result: MatchingResultShape;
}

// The per-person input the matching path already builds (CompatibilityLoveAnalyticInput.me/you).
export interface MatchingPersonInput {
  name?: string;
  gender?: string;
  dob?: string;
  time?: string;
}
