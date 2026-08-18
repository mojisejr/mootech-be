<!-- MuMate unified flow — see FE repo MUMATE-GITHUB-FLOW.md -->
## Summary


## Type
- [ ] feat
- [ ] fix
- [ ] chore
- [ ] payment ⚠️ (triggers the FE↔BE sync checklist below)

## Hard Gate — run on YOUR machine, not in CI (see mojisejr/mootech-fe#318)
`lint` + `test` are enforced by `.githooks/pre-push` on every push. `build` is not — check it here.

- [ ] `npm run build` green — **paste the output below** (this is the one nothing enforces)
- [ ] `npm run lint` green (0 errors; warnings do not fail the gate)
- [ ] `npm test` green
- [ ] `git config core.hooksPath` prints `.githooks` on my machine

<details><summary>output of `npm run build`</summary>

```
paste here
```
</details>

## Deploy impact
- [ ] I understand: **merge into `main` = production deploy** (Render `autoDeploy`, no separate deploy step)
- [ ] No manual/CLI deploy used (deploy = merge)

## Payment contract (fill only if `payment` type)
- [ ] Partner repo (FE↔BE) updated in the same change window
- [ ] Deploy ordering respected: **BE first, FE second**
- [ ] Omise webhook raw-body (`src/main.ts` `express.raw` `/callback/omise`) + idempotency unaffected

## Secrets
- [ ] gitleaks is green — no secret in this diff
- [ ] No `.env` / `.env.*.local` or real keys committed
