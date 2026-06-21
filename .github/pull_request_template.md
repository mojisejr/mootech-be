<!-- MuMate unified flow — see FE repo MUMATE-GITHUB-FLOW.md -->
## Summary


## Type
- [ ] feat
- [ ] fix
- [ ] chore
- [ ] payment ⚠️ (triggers the FE↔BE sync checklist below)

## Hard Gate (must be green before merge)
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (eslint, no-fix)
- [ ] Tests pass (`npm test`)

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
