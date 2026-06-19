import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { safeStat } from './fs-helpers.ts'

export async function buildPublishSection(params: { workspaceRoot: string }) {
  const hubIndex = path.resolve(params.workspaceRoot, 'dashboard_unificado', 'index.html')
  const hubStat = await safeStat(hubIndex)

  if (!hubStat.exists) {
    return { ok: false as const, error: 'missing_dashboard_unificado_index' }
  }

  try {
    const raw = await readFile(hubIndex, 'utf8')
    const ok = raw.includes('Stranger Things') && !raw.includes('Gerado automaticamente (fallback)')
    return { ok, error: null as string | null }
  } catch {
    return { ok: null as boolean | null, error: 'read_failed' }
  }
}
