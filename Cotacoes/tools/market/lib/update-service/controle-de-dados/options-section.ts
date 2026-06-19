import path from 'node:path'
import { readdir } from 'node:fs/promises'

import { listRecentFiles, safeStat } from './fs-helpers.ts'

export async function buildBarchartCsvDolarSummary(params: { workspaceRoot: string }) {
  const autoB3Root = path.resolve(params.workspaceRoot, 'Auto_B3_System')
  const csvDolarDir = path.resolve(autoB3Root, 'CSV_Dolar')

  try {
    const expiryFromName = (fileName: string) => {
      const m = String(fileName || '').match(/_options_exp-(\d{4}-\d{2}-\d{2})/)
      return m ? m[1] : null
    }
    const expiryMs = (iso: string | null) => {
      if (!iso) return null
      const t = Date.parse(`${iso}T00:00:00Z`)
      return Number.isFinite(t) ? t : null
    }

    const items = await readdir(csvDolarDir, { withFileTypes: true })
    const csv = items.filter(d => d.isFile() && d.name.toLowerCase().endsWith('.csv')).map(d => d.name)
    const latestByPrefix: Record<string, { name: string; size?: number | null; mtime?: number | null; mtime_fmt?: string | null }> = {}
    let includedFiles = 0

    for (const name of csv) {
      const prefix = name.split('_options')[0] || name
      if (prefix.toLowerCase().startsWith('wdo_')) continue
      if (name.includes('_options_exp-unknown')) continue
      if (name.includes('_intraday-')) continue
      includedFiles += 1
      const abs = path.join(csvDolarDir, name)
      const st = await safeStat(abs)
      const prev = latestByPrefix[prefix]
      const prevM = prev && typeof prev.mtime === 'number' ? prev.mtime : null
      const nextM = st.mtime
      if (!prev || (typeof nextM === 'number' && typeof prevM === 'number' ? nextM > prevM : !!nextM)) {
        latestByPrefix[prefix] = { name, size: st.size ?? null, mtime: st.mtime, mtime_fmt: st.mtime_fmt }
      }
    }

    const expected = Object.keys(latestByPrefix).sort((a, b) => {
      const ea = expiryMs(expiryFromName(latestByPrefix[a]?.name || ''))
      const eb = expiryMs(expiryFromName(latestByPrefix[b]?.name || ''))
      const na = ea === null ? Number.POSITIVE_INFINITY : ea
      const nb = eb === null ? Number.POSITIVE_INFINITY : eb
      if (na !== nb) return na - nb
      return a.localeCompare(b)
    })
    return {
      ok: true as const,
      dir: csvDolarDir,
      files_total: includedFiles,
      expected_contracts: expected,
      latest_by_prefix: latestByPrefix,
      missing_prefixes: [] as string[],
    }
  } catch {
    return { ok: false as const, dir: csvDolarDir, files_total: 0, expected_contracts: [] as string[], latest_by_prefix: {}, missing_prefixes: [] as string[] }
  }
}

export async function buildBarchartCsvIndiceSummary(params: { workspaceRoot: string }) {
  const autoB3Root = path.resolve(params.workspaceRoot, 'Auto_B3_System')
  const csvIndiceDir = path.resolve(autoB3Root, 'CSV_Indice')

  const exists = await safeStat(csvIndiceDir)
  if (!exists.exists) return { ok: false as const, dir: csvIndiceDir, files_total: 0, files_recent: [] as any[] }

  const recent = (await listRecentFiles(csvIndiceDir, 20)).filter(x => x.name.toLowerCase().endsWith('.csv'))
  const all = await readdir(csvIndiceDir, { withFileTypes: true }).catch(() => [])
  const total = all.filter(d => d.isFile() && d.name.toLowerCase().endsWith('.csv')).length

  return {
    ok: true as const,
    dir: csvIndiceDir,
    files_total: total,
    files_recent: recent.map(f => ({ name: f.name, path: f.path, size: f.size ?? null, mtime: f.mtime ?? null, mtime_fmt: f.mtime_fmt ?? null })),
  }
}
