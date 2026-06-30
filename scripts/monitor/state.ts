/**
 * State persistence — last effective status per target, on disk as `.state.json`
 * so the monitor survives a pm2 restart and only alerts on real transitions.
 * I/O adapter; the decision logic lives in checks.ts (pure).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import type { TargetState } from './checks'

export type StateMap = Record<string, TargetState>

export function loadState(file: string): StateMap {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as StateMap
  } catch {
    return {}
  }
}

export function saveState(file: string, state: StateMap): void {
  writeFileSync(file, JSON.stringify(state, null, 2))
}
