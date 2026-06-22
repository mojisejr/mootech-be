import { findRatingBand } from './rating-band';

// score bands (mirror compatibility_*_rating shape: start_score/end_score float)
const bands = [
  { id: 1, start_score: 0, end_score: 33.333, rating: 1, note: 'low' },
  { id: 2, start_score: 33.34, end_score: 66.666, rating: 2, note: 'mid' },
  { id: 3, start_score: 66.67, end_score: 100, rating: 3, note: 'high' },
];

describe('findRatingBand', () => {
  it('matches the band that contains a mid-range score', () => {
    expect(findRatingBand(bands, 50)?.id).toBe(2);
  });

  it('is inclusive on the rounded start bound', () => {
    // round2(33.34) = 33.34 -> 33.34 is in band 2
    expect(findRatingBand(bands, 33.34)?.id).toBe(2);
  });

  it('is inclusive on the rounded end bound', () => {
    // round2(66.666) = 66.67 -> 66.67 falls in band 2 (first match wins)
    expect(findRatingBand(bands, 66.67)?.id).toBe(2);
  });

  it('rounds bounds to 2 decimals (parity with ROUND(...,2))', () => {
    // band end 66.666 rounds to 66.67, so 66.665 (-> caller passes 66.67) is covered
    expect(findRatingBand([{ start_score: 0, end_score: 66.666 }], 66.67)).not.toBeNull();
    expect(findRatingBand([{ start_score: 0, end_score: 66.664 }], 66.67)).toBeNull();
  });

  it('returns null when no band contains the score', () => {
    expect(findRatingBand([{ start_score: 0, end_score: 10 }], 50)).toBeNull();
  });

  it('returns null for an empty table', () => {
    expect(findRatingBand([], 50)).toBeNull();
  });

  it('matches the lowest band at score 0', () => {
    expect(findRatingBand(bands, 0)?.id).toBe(1);
  });

  it('matches the top band at score 100', () => {
    expect(findRatingBand(bands, 100)?.id).toBe(3);
  });

  it('round:false compares bounds verbatim (no 2-decimal rounding)', () => {
    // exact mode: 66.666 is NOT rounded up to 66.67, so 66.67 is out of range
    expect(findRatingBand([{ start_score: 0, end_score: 66.666 }], 66.67, { round: false })).toBeNull();
    // and a score inside the verbatim range still matches
    expect(findRatingBand([{ start_score: 0, end_score: 66.666 }], 66.5, { round: false })).not.toBeNull();
  });
});
