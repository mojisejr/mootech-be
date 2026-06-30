/**
 * Discord notify adapter — builds a readable rich-embed CARD (Thai, color-coded)
 * and posts it to the webhook. `buildEmbed` is PURE (unit-tested for shape);
 * `postDiscord` is the only I/O.
 */
import type { Health, Transition } from './checks'

export interface DiscordEmbedField {
  name: string
  value: string
  inline: boolean
}

export interface DiscordEmbed {
  title: string
  description?: string
  color: number
  fields: DiscordEmbedField[]
  footer: { text: string }
  timestamp: string
}

export interface DiscordPayload {
  username: string
  embeds: DiscordEmbed[]
}

export interface AlertInput {
  targetName: string
  transition: Transition
  latencyMs: number
  cpuPct: number | null
  memPct: number | null
  reasons: string[]
  nowIso: string
}

const COLOR: Record<Health, number> = {
  healthy: 0x2ecc71, // green
  degraded: 0xf39c12, // amber
  down: 0xe74c3c, // red
}

const ICON: Record<Health, string> = { healthy: '🟢', degraded: '🟠', down: '🔴' }
const LABEL_TH: Record<Health, string> = { healthy: 'ปกติ', degraded: 'เริ่มมีปัญหา', down: 'ล่ม' }

function fmtPct(v: number | null): string {
  return v == null ? 'n/a' : `${Math.round(v)}%`
}

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s} วินาที`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} นาที`
  const h = Math.floor(m / 60)
  return `${h} ชม. ${m % 60} นาที`
}

/** PURE: shape the Discord card for a single transition. */
export function buildEmbed(a: AlertInput): DiscordPayload {
  const { from, to, prevDurationMs } = a.transition
  const isRecovery = to === 'healthy'

  const titleIcon = isRecovery ? '✅' : ICON[to]
  const title = `${titleIcon} ${a.targetName} — ${LABEL_TH[to]}`

  const fields: DiscordEmbedField[] = [
    {
      name: 'สถานะ',
      value: `${ICON[from]} ${LABEL_TH[from]} → ${ICON[to]} ${LABEL_TH[to]}`,
      inline: false,
    },
    {
      name: 'สาเหตุ',
      value: a.reasons.length > 0 ? a.reasons.join('\n') : '—',
      inline: false,
    },
    { name: 'Latency', value: `${a.latencyMs} ms`, inline: true },
    { name: 'CPU', value: fmtPct(a.cpuPct), inline: true },
    { name: 'Memory', value: fmtPct(a.memPct), inline: true },
  ]

  if (isRecovery && prevDurationMs > 0) {
    fields.push({
      name: 'ก่อนหน้านี้มีปัญหานาน',
      value: fmtDuration(prevDurationMs),
      inline: false,
    })
  }

  const description = isRecovery
    ? '✅ กลับมาทำงานปกติแล้ว'
    : to === 'down'
      ? '🔴 เซิร์ฟเวอร์ติดต่อไม่ได้'
      : '🟠 ประสิทธิภาพเริ่มตก เฝ้าดูใกล้ชิด'

  return {
    username: 'Mumate Prod Monitor',
    embeds: [
      {
        title,
        description,
        color: COLOR[to],
        fields,
        footer: { text: 'Mumate Prod Monitor' },
        timestamp: a.nowIso,
      },
    ],
  }
}

/** PURE: an "all good" hourly heartbeat card. */
export function buildHeartbeat(summaryLines: string[], nowIso: string): DiscordPayload {
  return {
    username: 'Mumate Prod Monitor',
    embeds: [
      {
        title: '🟢 ทุกอย่างปกติ',
        description: summaryLines.join('\n'),
        color: COLOR.healthy,
        fields: [],
        footer: { text: 'Mumate Prod Monitor · heartbeat' },
        timestamp: nowIso,
      },
    ],
  }
}

/** I/O: post a payload to the Discord webhook. Throws on non-2xx. */
export async function postDiscord(webhook: string, payload: DiscordPayload): Promise<void> {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`discord webhook ${res.status}: ${body.slice(0, 200)}`)
  }
}
