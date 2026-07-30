// I/O adapter for the bazi pair-match connector (Slice 2B).
// The ONLY side-effecting part: a read-only HTTP POST to /api/bazi/pair-match.
// Throws on timeout / non-2xx so computeBaziPair can fall back to the legacy
// engine (D10). Base URL + timeout + engine flag are shared with the /pair adapter.
import {
  BaziPairMatchRequest,
  BaziPairMatchResponse,
} from './bazi-pair-match.types';
import { getBaziBaseUrl, getBaziPairTimeoutMs } from './bazi-pair.adapter';

// POST the request to the bazi pair-match endpoint. Throws on timeout / non-2xx.
export async function fetchBaziPairMatch(
  req: BaziPairMatchRequest,
  baseUrl: string = getBaziBaseUrl(),
  timeoutMs: number = getBaziPairTimeoutMs(),
): Promise<BaziPairMatchResponse> {
  const g = globalThis as any;
  const url = `${baseUrl.replace(/\/+$/, '')}/api/bazi/pair-match`;
  const res = await g.fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
    signal: g.AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`bazi pair-match HTTP ${res.status}`);
  }
  return (await res.json()) as BaziPairMatchResponse;
}
