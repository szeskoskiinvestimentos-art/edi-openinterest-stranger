import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ForeignFlowPayload } from './types.js'

export function localYmd(d: Date) {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function readForeignFlowCache(outDir: string) {
  const p = path.join(outDir, 'foreign_flow.json')
  try {
    const raw = await readFile(p, 'utf-8')
    if (!raw) return null
    const payload = JSON.parse(raw) as ForeignFlowPayload
    const gen = payload && typeof payload === 'object' ? (payload as { generatedAt?: unknown }).generatedAt : null
    if (typeof gen !== 'string' || !gen) return null
    const dt = new Date(gen)
    if (Number.isNaN(dt.getTime())) return null
    return { payload, ymd: localYmd(dt), dt }
  } catch {
    return null
  }
}

