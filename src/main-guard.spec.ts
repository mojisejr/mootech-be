// main-guard tripwire — provenance predicate teeth. The bug-class: a direct push to main (which bypasses
// secret-scan, and deploys to Render) slips by because the guard can't tell a PR-merge commit from a direct
// push. isPrMergeCommit is the single source of that decision (job B's YAML calls the same script), so its
// teeth live here. (Job A = tsc.)
//
// ANCHOR: src/main-guard.spec.ts#pr-merge-provenance
import { isPrMergeCommit } from '../scripts/assert-main-provenance';

describe('pr-merge-provenance', () => {
  it('a real GitHub PR-merge commit passes (2 parents + generated subject)', () => {
    expect(
      isPrMergeCommit(
        'Merge pull request #24 from mojisejr/chore/320-pre-push-gate',
        2,
      ),
    ).toBe(true);
    expect(isPrMergeCommit('Merge pull request #7 from x/y', 2)).toBe(true);
  });

  it('a linear DIRECT push is rejected (1 parent)', () => {
    expect(isPrMergeCommit('docs: log technical debt', 1)).toBe(false);
    expect(isPrMergeCommit('fix: whatever', 1)).toBe(false);
  });

  it('a locally-crafted merge pushed direct is rejected (2 parents but NOT the PR subject)', () => {
    // parent-count alone must NOT pass — it is spoofable by a plain local `git merge`
    expect(isPrMergeCommit('Merge branch main into feat', 2)).toBe(false);
    expect(isPrMergeCommit('Merge remote-tracking branch origin/main', 2)).toBe(
      false,
    );
  });

  it('a direct push wearing a fake merge SUBJECT is rejected (1 parent defeats it)', () => {
    expect(isPrMergeCommit('Merge pull request #999 from evil/branch', 1)).toBe(
      false,
    );
  });

  it('the subject must carry a real PR number', () => {
    expect(isPrMergeCommit('Merge pull request from mojisejr/x', 2)).toBe(
      false,
    );
    expect(isPrMergeCommit('Merge pull request #abc from mojisejr/x', 2)).toBe(
      false,
    );
  });
});
