/**
 * Render metrics adapter — best-effort CPU/mem for the BE service via the Render
 * REST API. GRACEFUL DEGRADE by design: any error, non-2xx, or unparseable
 * response returns { cpuPct: null, memPct: null } so the monitor falls back to
 * uptime+latency only and never crashes the loop.
 *
 * NOTE (honesty): the exact Render metrics response shape/units can differ by
 * plan + API version. This parses defensively and is verified against the live
 * key at P4. Until proven against the real key, treat CPU/mem as "best-effort"
 * (cards will show n/a rather than a wrong number).
 */
import type { Metrics } from './checks'

const API = 'https://api.render.com/v1'
// Standard plan limits for percentage conversion.
const STANDARD_CPU_CORES = 1
const STANDARD_MEM_BYTES = 2 * 1024 * 1024 * 1024 // 2 GB

interface MetricSeries {
  values?: Array<{ value?: number }>
}

function latestValue(json: unknown): number | null {
  // Render returns an array of series; take the last numeric value of the first series.
  const series = Array.isArray(json) ? (json[0] as MetricSeries | undefined) : undefined
  const values = series?.values
  if (!values || values.length === 0) return null
  const last = values[values.length - 1]?.value
  return typeof last === 'number' && Number.isFinite(last) ? last : null
}

async function fetchMetric(
  path: string,
  serviceId: string,
  apiKey: string,
  timeoutMs: number,
): Promise<number | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API}/metrics/${path}?resource=${encodeURIComponent(serviceId)}&resolutionSeconds=60`, {
      headers: { authorization: `Bearer ${apiKey}`, accept: 'application/json' },
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    return latestValue(await res.json())
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchRenderMetrics(
  serviceId: string,
  apiKey: string,
  timeoutMs = 8000,
): Promise<Metrics> {
  const [cpuRaw, memRaw] = await Promise.all([
    fetchMetric('cpu', serviceId, apiKey, timeoutMs),
    fetchMetric('memory', serviceId, apiKey, timeoutMs),
  ])

  const cpuPct = cpuRaw == null ? null : clampPct((cpuRaw / STANDARD_CPU_CORES) * 100)
  const memPct = memRaw == null ? null : clampPct((memRaw / STANDARD_MEM_BYTES) * 100)
  return { cpuPct, memPct }
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v))
}
