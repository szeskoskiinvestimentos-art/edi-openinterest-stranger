import { readdir, stat, readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseCsv } from './csv.js'
import { fileExists } from './io.js'

function parseWatchlistDateFromFilename(filename: string) {
  const m = /^(?:Pré|Pre)Mercado_Watchlist_(\d{2})(\d{2})(\d{4})(?:[^\\/]*)?\.csv$/i.exec(filename)
  if (!m) return null
  const a = Number(m[1])
  const b = Number(m[2])
  const yyyy = Number(m[3])
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(yyyy)) return null
  if (yyyy < 2000 || yyyy > 2100) return null

  const toTs = (dd: number, mm: number) => {
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null
    const ts = new Date(Date.UTC(yyyy, mm - 1, dd)).getTime()
    return Number.isFinite(ts) ? ts : null
  }

  const ddmm = toTs(a, b)
  const mmdd = toTs(b, a)

  if (ddmm === null && mmdd === null) return null
  if (ddmm === null) return mmdd
  if (mmdd === null) return ddmm

  const now = Date.now()
  const futureCutoff = now + (36 * 60 * 60 * 1000)
  const plausible = (ts: number) => Number.isFinite(ts) && ts <= futureCutoff

  const ddOk = plausible(ddmm)
  const mmOk = plausible(mmdd)
  if (ddOk && !mmOk) return ddmm
  if (mmOk && !ddOk) return mmdd
  if (ddOk && mmOk) return Math.max(ddmm, mmdd)
  return ddmm
}

export async function resolveDefaultCsvPath(cwd: string) {
  const downloadsDir = path.resolve(cwd, '.edi-market-guardin', 'downloads')
  const listCsv = async (dir: string) => {
    const files = await readdir(dir)
    const candidates = files.filter(f => /^(?:Pré|Pre)Mercado_Watchlist(?:_.*)?\.csv$/i.test(f))
    return candidates.map(f => ({ dir, f, full: path.resolve(dir, f) }))
  }

  const fromDownloads = (await fileExists(downloadsDir)) ? await listCsv(downloadsDir) : []
  const fromCwd = await listCsv(cwd)
  const allCandidates = [...fromDownloads, ...fromCwd]

  if (!allCandidates.length) {
    throw new Error(
      `Nenhum CSV encontrado. Coloque o export do Investing em "${downloadsDir}" (preferencial) ou na raiz com nome "PréMercado_Watchlist_DDMMAAAA.csv" (ex: PréMercado_Watchlist_15032026.csv) ou "PréMercado_Watchlist.csv", ou rode com --csv "SEU_ARQUIVO.csv".`,
    )
  }

  const extSignalScore = async (full: string) => {
    try {
      const raw = await readFile(full, 'utf-8')
      if (!raw) return 0
      const rows = parseCsv(raw).slice(0, 250)
      let score = 0
      for (const row of rows) {
        const ex = String(row['Negociação Estendida'] || row['Negociacao Estendida'] || '').trim()
        const exPct = String(row['Negociação Estendida (%)'] || row['Negociacao Estendida (%)'] || '').trim()
        if (ex && ex !== '-' && ex !== '--' && /[0-9]/.test(ex)) score++
        else if (exPct && exPct !== '-' && exPct !== '--' && /[0-9]/.test(exPct)) score++
      }
      return score
    } catch {
      return 0
    }
  }

  const scored = await Promise.all(
    allCandidates.map(async x => {
      const dt = parseWatchlistDateFromFilename(x.f)
      try {
        const st = await stat(x.full)
        const extScore = await extSignalScore(x.full)
        return { full: x.full, filename: x.f, dt, mtimeMs: st.mtimeMs, extScore }
      } catch {
        const extScore = await extSignalScore(x.full)
        return { full: x.full, filename: x.f, dt, mtimeMs: -1, extScore }
      }
    }),
  )

  const pick = (list: typeof scored) =>
    list
      .slice()
      .sort(
        (a, b) =>
          Number(b.dt !== null) - Number(a.dt !== null) ||
          (b.dt ?? -1) - (a.dt ?? -1) ||
          (b.mtimeMs ?? -1) - (a.mtimeMs ?? -1) ||
          (b.extScore ?? 0) - (a.extScore ?? 0) ||
          String(a.filename).localeCompare(String(b.filename)),
      )[0]

  return pick(scored).full
}
