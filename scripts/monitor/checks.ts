/**
 * PURE decision core for the monitor — no network, no fs, no Discord.
 * Everything here is deterministic and unit-testable (see checks.test.ts).
 *
 * Two responsibilities:
 *   1. classifySample() — turn one (http + metrics) sample into a raw health.
 *   2. reduceState()    — debounce raw health into an *effective* status with
 *                         anti-flapping (a status must persist `sustainCycles`
 *                         consecutive cycles before it transitions + alerts).
 */
import type { Thresholds } from './config'

export type Health = 'healthy' | 'degraded' | 'down'

export interface HttpResult {
  /** reachable with a non-server-error status */
  ok: boolean
  /** HTTP status; 0 on network error / timeout */
  status: number
  latencyMs: number
  error?: string
}

export interface Metrics {
  /** null = metric unavailable (graceful degrade — not counted against health) */
  cpuPct: number | null
  memPct: number | null
}

export interface SampleVerdict {
  raw: Health
  reasons: string[]
}

/** One-shot classification of a single poll sample (no history). PURE. */
export function classifySample(http: HttpResult, metrics: Metrics, t: Thresholds): SampleVerdict {
  if (!http.ok || http.status === 0 || http.status >= 500) {
    const why = http.error ? `ติดต่อไม่ได้: ${http.error}` : `HTTP ${http.status}`
    return { raw: 'down', reasons: [why] }
  }

  const reasons: string[] = []
  if (http.latencyMs > t.latencyMs) {
    reasons.push(`latency ${http.latencyMs}ms > ${t.latencyMs}ms`)
  }
  if (metrics.cpuPct != null && metrics.cpuPct > t.cpuPct) {
    reasons.push(`CPU ${metrics.cpuPct}% > ${t.cpuPct}%`)
  }
  if (metrics.memPct != null && metrics.memPct > t.memPct) {
    reasons.push(`mem ${metrics.memPct}% > ${t.memPct}%`)
  }
  return reasons.length > 0 ? { raw: 'degraded', reasons } : { raw: 'healthy', reasons: [] }
}

export interface TargetState {
  /** last confirmed status (what we alert on) */
  effective: Health
  /** raw status currently accumulating consecutive cycles */
  pendingRaw: Health
  /** how many consecutive cycles pendingRaw has held */
  pendingCount: number
  /** epoch ms when `effective` began (for downtime duration on recovery) */
  since: number
}

export interface Transition {
  next: TargetState
  transitioned: boolean
  from: Health
  to: Health
  /** ms the previous effective status lasted, set only when transitioned */
  prevDurationMs: number
}

/**
 * Debounce a raw sample into an effective status. PURE.
 * A new status only becomes effective (and fires an alert) once it has held for
 * `sustainCycles` consecutive cycles — this is the anti-flapping guarantee and
 * applies uniformly to down, degraded, and recovery transitions.
 */
export function reduceState(
  prev: TargetState | undefined,
  rawNow: Health,
  now: number,
  sustainCycles: number,
): Transition {
  const baseline: TargetState = prev ?? {
    effective: 'healthy',
    pendingRaw: rawNow,
    pendingCount: 0,
    since: now,
  }

  let pendingRaw = baseline.pendingRaw
  let pendingCount = baseline.pendingCount
  if (rawNow === pendingRaw) {
    pendingCount += 1
  } else {
    pendingRaw = rawNow
    pendingCount = 1
  }

  const from = baseline.effective
  let effective = baseline.effective
  let since = baseline.since
  let transitioned = false
  let prevDurationMs = 0

  if (pendingRaw !== effective && pendingCount >= sustainCycles) {
    prevDurationMs = Math.max(0, now - since)
    effective = pendingRaw
    since = now
    transitioned = true
  }

  return {
    next: { effective, pendingRaw, pendingCount, since },
    transitioned,
    from,
    to: effective,
    prevDurationMs,
  }
}
