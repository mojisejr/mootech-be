/**
 * Mumate prod monitor — entry point.
 *
 * Local, off-stack, pm2-managed uptime + Render-metrics watcher for the
 * just-launched Mumate stack. Polls FE + BE every ~60s, evaluates thresholds,
 * and posts a Discord CARD only on a confirmed state transition (anti-flapping
 * via a 2-cycle debounce) plus a recovery card. Read-only against prod.
 *
 * Run:
 *   bun scripts/monitor/prod-monitor.ts            # start the poll loop
 *   bun scripts/monitor/prod-monitor.ts --selftest # post synthetic down+recovery cards then exit
 *
 * Orchestration only — pure decisions live in checks.ts, I/O in the adapters.
 */
import { loadConfig, type MonitorConfig } from './config'
import { classifySample, reduceState, type HttpResult } from './checks'
import { fetchRenderMetrics } from './render-metrics'
import { buildEmbed, buildHeartbeat, postDiscord, type AlertInput } from './notify'
import { loadState, saveState, type StateMap } from './state'

function isRenderTarget(url: string): boolean {
  return url.includes('onrender.com')
}

async function httpCheck(url: string, timeoutMs: number): Promise<HttpResult> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  const start = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': 'mumate-prod-monitor' },
    })
    return { ok: res.status < 500, status: res.status, latencyMs: Date.now() - start }
  } catch (e: any) {
    const error = e?.name === 'AbortError' ? 'timeout' : (e?.message ?? 'network error')
    return { ok: false, status: 0, latencyMs: Date.now() - start, error }
  } finally {
    clearTimeout(timer)
  }
}

let lastHeartbeatAt = 0

async function runCycle(cfg: MonitorConfig, state: StateMap): Promise<void> {
  const now = Date.now()
  const nowIso = new Date(now).toISOString()
  const healthyLines: string[] = []
  let allHealthy = true

  for (const target of cfg.targets) {
    const http = await httpCheck(target.url, cfg.thresholds.downTimeoutMs)
    const metrics = isRenderTarget(target.url)
      ? await fetchRenderMetrics(cfg.renderServiceId, cfg.renderApiKey)
      : { cpuPct: null, memPct: null }

    const verdict = classifySample(http, metrics, cfg.thresholds)
    const tr = reduceState(state[target.name], verdict.raw, now, cfg.thresholds.sustainCycles)
    state[target.name] = tr.next

    if (verdict.raw !== 'healthy') allHealthy = false
    healthyLines.push(`${target.name}: ${verdict.raw} · ${http.latencyMs}ms`)

    if (tr.transitioned) {
      const alert: AlertInput = {
        targetName: target.name,
        transition: tr,
        latencyMs: http.latencyMs,
        cpuPct: metrics.cpuPct,
        memPct: metrics.memPct,
        reasons: verdict.reasons,
        nowIso,
      }
      try {
        await postDiscord(cfg.discordWebhook, buildEmbed(alert))
        console.log(`[monitor] ALERT ${target.name} ${tr.from} -> ${tr.to}`)
      } catch (e: any) {
        console.error(`[monitor] discord post failed: ${e?.message ?? e}`)
      }
    }
  }

  if (cfg.heartbeatEnabled && allHealthy && now - lastHeartbeatAt >= cfg.heartbeatEveryMs) {
    lastHeartbeatAt = now
    try {
      await postDiscord(cfg.discordWebhook, buildHeartbeat(healthyLines, nowIso))
    } catch (e: any) {
      console.error(`[monitor] heartbeat post failed: ${e?.message ?? e}`)
    }
  }

  console.log(`[monitor] ${nowIso} · ${healthyLines.join(' | ')}`)
}

/** P4 dry-run: prove the webhook + card render by posting a synthetic down then recovery. */
async function selftest(cfg: MonitorConfig): Promise<void> {
  const target = cfg.targets[0]?.name ?? 'selftest-target'
  const nowIso = new Date().toISOString()
  console.log('[monitor] selftest: posting synthetic DOWN card...')
  await postDiscord(
    cfg.discordWebhook,
    buildEmbed({
      targetName: `${target} (SELFTEST)`,
      transition: {
        next: { effective: 'down', pendingRaw: 'down', pendingCount: 2, since: Date.now() },
        transitioned: true,
        from: 'healthy',
        to: 'down',
        prevDurationMs: 0,
      },
      latencyMs: 10_001,
      cpuPct: null,
      memPct: null,
      reasons: ['ติดต่อไม่ได้: timeout (synthetic)'],
      nowIso,
    }),
  )
  console.log('[monitor] selftest: posting synthetic RECOVERY card...')
  await postDiscord(
    cfg.discordWebhook,
    buildEmbed({
      targetName: `${target} (SELFTEST)`,
      transition: {
        next: { effective: 'healthy', pendingRaw: 'healthy', pendingCount: 2, since: Date.now() },
        transitioned: true,
        from: 'down',
        to: 'healthy',
        prevDurationMs: 125_000,
      },
      latencyMs: 180,
      cpuPct: 42,
      memPct: 61,
      reasons: [],
      nowIso,
    }),
  )
  console.log('[monitor] selftest: done — check the Discord channel for two cards.')
}

function sleep(ms: number, stillRunning: () => boolean): Promise<void> {
  return new Promise((res) => {
    const step = 1000
    let waited = 0
    const tick = (): void => {
      if (!stillRunning() || waited >= ms) return res()
      waited += step
      setTimeout(tick, Math.min(step, ms - waited + step))
    }
    setTimeout(tick, Math.min(step, ms))
  })
}

async function main(): Promise<void> {
  const cfg = loadConfig()

  if (process.argv.includes('--selftest')) {
    await selftest(cfg)
    return
  }

  const state = loadState(cfg.stateFile)
  let running = true
  const shutdown = (sig: string): void => {
    console.log(`[monitor] ${sig} received, shutting down...`)
    running = false
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  console.log(
    `[monitor] started · poll ${cfg.pollMs}ms · ${cfg.targets.length} targets · heartbeat ${cfg.heartbeatEnabled ? 'on' : 'off'}`,
  )

  while (running) {
    try {
      await runCycle(cfg, state)
      saveState(cfg.stateFile, state)
    } catch (e: any) {
      console.error(`[monitor] cycle error: ${e?.message ?? e}`)
    }
    if (running) await sleep(cfg.pollMs, () => running)
  }

  console.log('[monitor] stopped cleanly')
}

main().catch((e) => {
  console.error(`[monitor] fatal: ${e?.message ?? e}`)
  process.exit(1)
})
