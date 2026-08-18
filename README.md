# mootech-be

## Setup — run this once per clone

```bash
npm ci
git config core.hooksPath .githooks    # ⚠️ required — see below
```

### ⚠️ `core.hooksPath` is NOT installed by cloning

It is a **local git config value**, not a file in the repo. Committing `.githooks/pre-push` does nothing
on your machine until you run that one line. There is no check that catches a missing hook — if you skip
it, everything looks normal and the gate simply never runs.

Verify it took:

```bash
git config core.hooksPath        # must print: .githooks
```

## Hard gate — what must be green, and where

Decided in `mojisejr/mootech-fe#318` (2026-08-18). `ci.yml` is being retired: merge into `main` is a
production deploy (Render `autoDeploy`) and GitHub Actions minutes are paid, so the checks moved onto
your machine.

| when | what | cost here |
|---|---|---|
| every `git push` | `npm run lint` + `npm test` — enforced by `.githooks/pre-push` | ≈ 112s |
| before opening a PR | `npm run build` — paste the output into the PR body | ≈ 5s |

`build` is not in the hook so this repo stays symmetric with `mootech-fe`, where build costs 4m11s and a
normal issue takes 4–5 pushes.

### `lint` checks, `lint:fix` rewrites

```bash
npm run lint      # check only — this is the gate
npm run lint:fix  # rewrites your source (never run by the hook)
```

Until `mojisejr/mootech-fe#320` the `lint` script carried `--fix`, so it edited the very code it claimed
to be checking. If you want the old behaviour, it is `lint:fix` now.

### If the hook blocks you

Fix the red thing. `git push --no-verify` bypasses every hook — it is not a wall — but bypassing means the
next person to touch `main` inherits whatever you skipped, and `main` deploys straight to production.

If the 112s is genuinely too slow to live with, **say so in `mojisejr/mootech-fe#320`** rather than
quietly bypassing. Someone reaching for `--no-verify` is the agreed signal that this cost was set wrong.
