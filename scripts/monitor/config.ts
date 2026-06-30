/**
 * Monitor config — targets, thresholds, and secret env loading.
 *
 * Secrets live in `projects/mootech-be/.env.local` (gitignored) under the
 * operator's canonical keys:
 *   SERVER_MONITOR_DISCORD_WEB_HOOK   (required)
 *   SERVER_MONITOR_RENDER_API_KEY     (required)
 *   SERVER_MONITOR_RENDER_SERVICE_ID  (optional; defaults to the Mumate BE)
 *   SERVER_MONITOR_HEARTBEAT          (optional; "on" enables hourly heartbeat)
 *
 * `loadConfig` is fail-closed: it throws if a required secret is missing so the
 * monitor never silently runs blind. Reading is pure-ish (no network); the env
 * file is parsed directly so this works under both `bun` and `node/tsx`.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface MonitorTarget {
  name: string
  url: string
}

export interface Thresholds {
  /** latency above this (ms) => degraded */
  latencyMs: number
  /** CPU percent above this => degraded */
  cpuPct: number
  /** memory percent above this => degraded */
  memPct: number
  /** request abort threshold (ms) => treated as down */
  downTimeoutMs: number
  /** consecutive cycles a raw status must persist before it becomes effective */
  sustainCycles: number
}

export interface MonitorConfig {
  discordWebhook: string
  renderApiKey: string
  renderServiceId: string
  targets: MonitorTarget[]
  thresholds: Thresholds
  pollMs: number
  heartbeatEnabled: boolean
  heartbeatEveryMs: number
  stateFile: string
}

/** scripts/monitor -> mootech-be repo root */
const REPO_ROOT = resolve(__dirname, '..', '..')

/** Minimal .env.local parser. No dotenv dependency; supports quoted values + comments. */
function loadEnvFile(root: string): Record<string, string> {
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8')
    const out: Record<string, string> = {}
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      out[key] = value
    }
    return out
  } catch {
    return {}
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): MonitorConfig {
  const fileEnv = loadEnvFile(REPO_ROOT)
  const get = (key: string): string => env[key] ?? fileEnv[key] ?? ''

  const discordWebhook = get('SERVER_MONITOR_DISCORD_WEB_HOOK')
  const renderApiKey = get('SERVER_MONITOR_RENDER_API_KEY')

  const missing: string[] = []
  if (!discordWebhook) missing.push('SERVER_MONITOR_DISCORD_WEB_HOOK')
  if (!renderApiKey) missing.push('SERVER_MONITOR_RENDER_API_KEY')
  if (missing.length > 0) {
    throw new Error(
      `[monitor] missing required env: ${missing.join(', ')} — set them in projects/mootech-be/.env.local`,
    )
  }

  return {
    discordWebhook,
    renderApiKey,
    renderServiceId: get('SERVER_MONITOR_RENDER_SERVICE_ID') || 'srv-d8nc4j8k1i2s73d7e030',
    targets: [
      { name: 'FE · bazichart.mumate.co', url: 'https://bazichart.mumate.co' },
      { name: 'BE · mootech-be', url: 'https://mootech-be.onrender.com' },
    ],
    thresholds: {
      latencyMs: 3000,
      cpuPct: 80,
      memPct: 85,
      downTimeoutMs: 10_000,
      sustainCycles: 2,
    },
    pollMs: 60_000,
    heartbeatEnabled: get('SERVER_MONITOR_HEARTBEAT').toLowerCase() === 'on',
    heartbeatEveryMs: 60 * 60 * 1000,
    stateFile: resolve(__dirname, '.state.json'),
  }
}
