// Pure rating-band lookup (#mootech-matching-calculate-robustness).
//
// Replaces a fragile TypeORM `Raw()` predicate
//   `${score} BETWEEN ROUND(start_score::numeric, 2) AND ROUND(end_score::numeric, 2)`
// that broke on Postgres after the MySQL->PG fold:
//   - layer 1: `round(double precision, integer) does not exist` (fixed earlier via ::numeric)
//   - layer 2: `missing FROM-clause entry for table "compatibilityloverating"` — the bare
//     `end_score` resolved against a lowercase table name while TypeORM aliased the table
//     case-sensitively, so Postgres could not find it.
//
// The compatibility *_rating tables are tiny (a handful of score bands), so loading them and
// matching the band in JS removes ALL SQL-dialect/alias risk and makes the logic unit-testable
// without a database. Semantics mirror the original SQL: inclusive range on bounds rounded to
// 2 decimals.

export interface ScoreBand {
  start_score: number;
  end_score: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

// Return the first band whose [round2(start_score), round2(end_score)] inclusive range
// contains `score`, or null when none match. `score` is expected pre-rounded to 2 decimals
// by the caller (parity with the previous query).
export function findRatingBand<T extends ScoreBand>(
  rows: T[],
  score: number,
): T | null {
  return (
    rows.find(
      (r) => round2(r.start_score) <= score && score <= round2(r.end_score),
    ) ?? null
  );
}
