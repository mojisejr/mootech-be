/**
 * Deterministic tests for the Discord card builder (pure) + state round-trip.
 * Network-free (buildEmbed never posts). Run:
 *   bun scripts/monitor/notify.test.ts
 */
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { rmSync } from 'node:fs'
import { buildEmbed, buildHeartbeat } from './notify'
import { loadState, saveState } from './state'
import type { Transition, TargetState } from './checks'

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

const downTransition: Transition = {
  next: { effective: 'down', pendingRaw: 'down', pendingCount: 2, since: 2000 },
  transitioned: true,
  from: 'healthy',
  to: 'down',
  prevDurationMs: 0,
}

const recoveryTransition: Transition = {
  next: { effective: 'healthy', pendingRaw: 'healthy', pendingCount: 2, since: 4000 },
  transitioned: true,
  from: 'down',
  to: 'healthy',
  prevDurationMs: 125_000, // ~2 นาที
}

// ── card shape ───────────────────────────────────────────────────────────────
t('down card: red color, single embed, footer set', () => {
  const p = buildEmbed({
    targetName: 'FE · bazichart.mumate.co',
    transition: downTransition,
    latencyMs: 10_001,
    cpuPct: null,
    memPct: null,
    reasons: ['ติดต่อไม่ได้: timeout'],
    nowIso: '2026-06-30T18:30:00.000Z',
  })
  assert.equal(p.embeds.length, 1)
  assert.equal(p.embeds[0].color, 0xe74c3c)
  assert.equal(p.embeds[0].footer.text, 'Mumate Prod Monitor')
  assert.ok(p.embeds[0].title.includes('ล่ม'))
  // metrics unavailable -> n/a, never a fake number
  const cpu = p.embeds[0].fields.find((f) => f.name === 'CPU')
  assert.equal(cpu?.value, 'n/a')
})

t('recovery card: green + downtime duration field', () => {
  const p = buildEmbed({
    targetName: 'BE · mootech-be',
    transition: recoveryTransition,
    latencyMs: 180,
    cpuPct: 42,
    memPct: 61,
    reasons: [],
    nowIso: '2026-06-30T18:32:05.000Z',
  })
  assert.equal(p.embeds[0].color, 0x2ecc71)
  assert.ok(p.embeds[0].title.startsWith('✅'))
  const dur = p.embeds[0].fields.find((f) => f.name.includes('มีปัญหานาน'))
  assert.ok(dur, 'recovery card must carry downtime duration')
  assert.ok(dur!.value.includes('นาที'))
})

t('heartbeat card is green with no fields', () => {
  const p = buildHeartbeat(['FE 120ms', 'BE 180ms'], '2026-06-30T19:00:00.000Z')
  assert.equal(p.embeds[0].color, 0x2ecc71)
  assert.equal(p.embeds[0].fields.length, 0)
})

// ── state round-trip (survives pm2 restart) ──────────────────────────────────
t('state saves + reloads identically; missing file -> {}', () => {
  const file = join(tmpdir(), `monitor-state-test-${process.pid}.json`)
  try {
    assert.deepEqual(loadState(file), {})
    const st: Record<string, TargetState> = {
      'FE · bazichart.mumate.co': { effective: 'down', pendingRaw: 'down', pendingCount: 3, since: 1000 },
    }
    saveState(file, st)
    assert.deepEqual(loadState(file), st)
  } finally {
    rmSync(file, { force: true })
  }
})

if (!process.exitCode) console.log(`✓ all ${pass} notify/state assertions passed`)
else console.error(`\n${pass} passed, FAILURES above`)
