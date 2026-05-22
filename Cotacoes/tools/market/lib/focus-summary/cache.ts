import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { FocusSummaryPayload } from './types.js'
import { localYmd, tzParts } from './time.js'

export async function readFocusCache(outDir: string) {
  const p = path.join(outDir, 'focus_summary.json')
  try {
    const raw = await readFile(p, 'utf-8')
    if (!raw) return null
    const payload = JSON.parse(raw) as FocusSummaryPayload
    const gen = payload && typeof payload === 'object' ? (payload as { generatedAt?: unknown }).generatedAt : null
    if (typeof gen !== 'string' || !gen) return null
    return payload
  } catch {
    return null
  }
}

export function cachedPublishedYmd(cached: FocusSummaryPayload | null) {
  if (!cached || cached.ok !== true) return ''
  const pub = cached.source && typeof cached.source === 'object' ? (cached.source as { publishedAt?: unknown }).publishedAt : null
  if (typeof pub !== 'string' || !pub) return ''
  const dt = new Date(pub)
  if (Number.isNaN(dt.getTime())) return ''
  return tzParts(dt).ymd || localYmd(dt)
}

