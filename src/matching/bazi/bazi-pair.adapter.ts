// I/O adapter for the bazi pair-matching engine (#mootech-matching-bazi-swap).
// The ONLY side-effecting part of the swap: a read-only HTTP POST to the bazi
// engine's public /api/bazi/pair seam. Decisions live in bazi-pair.mapper.ts (pure).
//
// Node 22 has global fetch/AbortSignal, but @types/node@16 does not declare them,
// so they are reached via globalThis (runtime-present, type-absent).
import { BaziPairRequest, BaziPairResponse } from './bazi-pair.types';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 12000;

// Engine switch — bazi only when explicitly enabled; default stays legacy.
export function isBaziMatchingEnabled(): boolean {
  return (
    (process.env.MATCHING_ENGINE ?? 'legacy').trim().toLowerCase() === 'bazi'
  );
}

export function getBaziBaseUrl(): string {
  const v = (process.env.BAZI_BASE_URL ?? '').trim();
  return v || DEFAULT_BASE_URL;
}

export function getBaziPairTimeoutMs(): number {
  const n = Number(process.env.BAZI_PAIR_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS;
}

// POST the pair request to the bazi engine. Throws on timeout / non-2xx so the
// caller can fall back to the legacy engine.
export async function fetchBaziPair(
  req: BaziPairRequest,
  baseUrl: string = getBaziBaseUrl(),
  timeoutMs: number = getBaziPairTimeoutMs(),
): Promise<BaziPairResponse> {
  const g = globalThis as any;
  const url = `${baseUrl.replace(/\/+$/, '')}/api/bazi/pair`;
  const res = await g.fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
    signal: g.AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`bazi pair HTTP ${res.status}`);
  }
  return (await res.json()) as BaziPairResponse;
}
