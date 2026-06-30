/**
 * Deterministic unit tests for the monitor's pure decision core.
 * DB-free, network-free, Discord-free. Run:
 *   bun scripts/monitor/checks.test.ts
 */
import assert from 'node:assert/strict'
import { classifySample, reduceState } from './checks'
import type { Thresholds } from './config'
import type { HttpResult, Metrics, TargetState } from './checks'

const T: Thresholds = {
  latencyMs: 3000,
  cpuPct: 80,
  memPct: 85,
  downTimeoutMs: 10_000,
  sustainCycles: 2,
}

const ok = (latencyMs: number, status = 200): HttpResult => ({ ok: true, status, latencyMs })
const noMetrics: Metrics = { cpuPct: null, memPct: null }

let pass = 0
function t(name: string, fn: () => void): void {
  try {
    fn()
    pass++
  } catch (e: any) {
    console.error(`✗ ${name}\n  ${e?.message ?? e}`)
    process.exitCode = 1
  }
}

// ── classifySample ──────────────────────────────────────────────────────────
t('network error (status 0) -> down', () => {
  assert.equal(classifySample({ ok: false, status: 0, latencyMs: 10_001, error: 'timeout' }, noMetrics, T).raw, 'down')
})

t('5xx -> down', () => {
  assert.equal(classifySample({ ok: false, status: 502, latencyMs: 120 }, noMetrics, T).raw, 'down')
})

t('200 fast, no metrics -> healthy', () => {
  assert.equal(classifySample(ok(120), noMetrics, T).raw, 'healthy')
})

t('200 but slow -> degraded (latency)', () => {
  const v = classifySample(ok(3500), noMetrics, T)
  assert.equal(v.raw, 'degraded')
  assert.ok(v.reasons[0].includes('latency'))
})

t('high CPU -> degraded', () => {
  assert.equal(classifySample(ok(120), { cpuPct: 92, memPct: 40 }, T).raw, 'degraded')
})

t('high mem -> degraded', () => {
  assert.equal(classifySample(ok(120), { cpuPct: 10, memPct: 91 }, T).raw, 'degraded')
})

t('null metrics never count against health', () => {
  assert.equal(classifySample(ok(120), { cpuPct: null, memPct: null }, T).raw, 'healthy')
})

// ── reduceState (anti-flapping debounce, sustainCycles = 2) ──────────────────
t('first single down does NOT transition (blip protection)', () => {
  const r = reduceState(undefined, 'down', 1000, 2)
  assert.equal(r.transitioned, false)
  assert.equal(r.next.effective, 'healthy')
  assert.equal(r.next.pendingCount, 1)
})

t('second consecutive down transitions healthy -> down', () => {
  const first = reduceState(undefined, 'down', 1000, 2)
  const second = reduceState(first.next, 'down', 2000, 2)
  assert.equal(second.transitioned, true)
  assert.equal(second.from, 'healthy')
  assert.equal(second.to, 'down')
})

t('a single down between healthy polls never alerts (flap)', () => {
  let s: TargetState | undefined
  let alerts = 0
  for (const raw of ['healthy', 'healthy', 'down', 'healthy', 'healthy'] as const) {
    const r = reduceState(s, raw, 1000, 2)
    if (r.transitioned) alerts++
    s = r.next
  }
  assert.equal(alerts, 0)
})

t('recovery transition reports previous downtime duration', () => {
  // get to down at t=2000
  const d1 = reduceState(undefined, 'down', 1000, 2)
  const d2 = reduceState(d1.next, 'down', 2000, 2) // -> down, since=2000
  // two healthy cycles to recover at t=4000
  const h1 = reduceState(d2.next, 'healthy', 3000, 2)
  const h2 = reduceState(h1.next, 'healthy', 4000, 2)
  assert.equal(h2.transitioned, true)
  assert.equal(h2.to, 'healthy')
  assert.equal(h2.prevDurationMs, 2000) // down lasted 2000ms (2000 -> 4000)
})

t('stable healthy never transitions', () => {
  let s: TargetState | undefined
  let alerts = 0
  for (let i = 0; i < 5; i++) {
    const r = reduceState(s, 'healthy', i * 1000, 2)
    if (r.transitioned) alerts++
    s = r.next
  }
  assert.equal(alerts, 0)
})

if (!process.exitCode) console.log(`✓ all ${pass} monitor checks assertions passed`)
else console.error(`\n${pass} passed, FAILURES above`)
