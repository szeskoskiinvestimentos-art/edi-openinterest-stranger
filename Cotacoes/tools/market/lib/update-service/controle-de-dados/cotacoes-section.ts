import path from 'node:path'

import { safeStat } from './fs-helpers.ts'

export async function buildCotacoesDataFiles(params: { workspaceRoot: string }) {
  const assetsDataDir = path.resolve(params.workspaceRoot, 'Cotacoes', 'dashboard', 'MERCADO', 'assets', 'data')
  const dataFilesList = [
    'economic_calendar.json',
    'fed_watch_rates.json',
    'focus_summary.json',
    'foreign_flow.json',
    'market_quotes.json',
    'market_yahoo_audit.json',
    'zq_curve.json',
  ]
  const files = await Promise.all(
    dataFilesList.map(async name => {
      const p = path.resolve(assetsDataDir, name)
      const st = await safeStat(p)
      return { name, path: p, exists: st.exists, size: st.size, mtime: st.mtime, mtime_fmt: st.mtime_fmt }
    }),
  )
  const newest = files.reduce<{ mtime: number | null; mtime_fmt: string | null }>(
    (acc, f) => {
      const m = typeof f.mtime === 'number' ? f.mtime : null
      if (m !== null && (acc.mtime === null || m > acc.mtime)) return { mtime: m, mtime_fmt: typeof f.mtime_fmt === 'string' ? f.mtime_fmt : null }
      return acc
    },
    { mtime: null, mtime_fmt: null },
  )
  return { base_dir: assetsDataDir, dir: assetsDataDir, newest_mtime: newest.mtime, newest_mtime_fmt: newest.mtime_fmt, files }
}
