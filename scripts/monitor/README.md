# Mumate Prod Monitor (local · pm2 · Discord)

A small, **local-only** uptime + Render-metrics watcher for the Mumate production
stack. It polls the FE and BE every ~60s and posts a readable Discord **card**
only when a service changes state (healthy ↔ degraded ↔ down) plus a recovery
card. Read-only against prod — it never writes anything to the live stack.

> ⚠️ **Local-only caveat**: this runs under pm2 **on your machine**. It only
> watches while this computer is awake and online. It is _not_ a 24/7 hosted
> uptime service. For unattended coverage, add an external monitor later.

## What it watches

| Target | URL | Metrics |
|---|---|---|
| FE | `https://bazichart.mumate.co` | uptime + latency |
| BE | `https://mootech-be.onrender.com` | uptime + latency + Render CPU/mem (best-effort) |

## Thresholds (defaults)

| Status | Rule |
|---|---|
| `down` | non-2xx≥500 / network error / timeout (>10s) |
| `degraded` | latency > 3s, OR CPU > 80%, OR mem > 85% |
| anti-flap | a status must hold **2 consecutive cycles** before it alerts |
| poll | every 60s |
| heartbeat | hourly "all good" card — **off** by default |

## Setup

1. **Discord webhook** → Server Settings → Integrations → Webhooks → New Webhook
   → pick the alert channel → Copy Webhook URL.
2. **Render API key** → Render dashboard → Account Settings → API Keys → Create.
3. Put both in the gitignored `projects/mootech-be/.env.local` (NOT in git, NOT in chat):
   ```
   SERVER_MONITOR_DISCORD_WEB_HOOK=...
   SERVER_MONITOR_RENDER_API_KEY=...
   # optional:
   # SERVER_MONITOR_RENDER_SERVICE_ID=srv-d8nc4j8k1i2s73d7e030
   # SERVER_MONITOR_HEARTBEAT=off
   ```
   See [`.env.monitor.example`](./.env.monitor.example) for the reference.

## Run

```bash
# from projects/mootech-be

# 1) prove the webhook + card render (posts a synthetic down + recovery card):
bun scripts/monitor/prod-monitor.ts --selftest

# 2) start under pm2 + persist across reboot:
pm2 start scripts/monitor/ecosystem.config.cjs
pm2 save

# inspect / stop:
pm2 logs mootech-monitor
pm2 delete mootech-monitor && pm2 save
```

## Tests

```bash
bun scripts/monitor/checks.test.ts    # pure classify + anti-flap debounce
bun scripts/monitor/notify.test.ts    # Discord card shape + state round-trip
npx tsc --noEmit -p scripts/monitor/tsconfig.json
```

## Files

| File | Role |
|---|---|
| `prod-monitor.ts` | entry: poll loop + `--selftest`; orchestration only |
| `config.ts` | targets, thresholds, fail-closed env load from `.env.local` |
| `checks.ts` | **pure** classify + anti-flap debounce (unit-tested) |
| `render-metrics.ts` | Render CPU/mem adapter — graceful-degrade to n/a |
| `notify.ts` | Discord card builder (pure) + webhook post (I/O) |
| `state.ts` | `.state.json` persistence (survives pm2 restart) |
| `ecosystem.config.cjs` | pm2 process definition |

## Notes

- **Render metrics are best-effort.** The exact Render metrics REST shape/units
  are verified against the live key at first run; until proven, cards show `n/a`
  for CPU/mem rather than a wrong number. Uptime + latency are always authoritative.
- Secrets live only in `.env.local` (gitignored). `.state.json` is gitignored too.
