import type { FocusAnualRow, FocusReportMeta, FocusYearPack } from './types.js'

export function pickCutoffFriday(publishedAtIso: string | null) {
  if (!publishedAtIso) return null
  const dt = new Date(publishedAtIso)
  if (Number.isNaN(dt.getTime())) return null
  const d = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12, 0, 0, 0)
  d.setDate(d.getDate() - 1)
  for (let i = 0; i < 10; i++) {
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const ymd = `${yyyy}-${mm}-${dd}`
    if (d.getDay() === 5) return ymd
    d.setDate(d.getDate() - 1)
  }
  return null
}

export async function fetchFocusReportMeta(params: {
  focusPageUrl: string
  fetchTextWithTimeout: (url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<string>
}) : Promise<FocusReportMeta> {
  try {
    const html = await params.fetchTextWithTimeout(params.focusPageUrl, 4500, { 'User-Agent': 'Mozilla/5.0' })
    const mDate = html.match(/Data de publicação:\s*(\d{2}\/\d{2}\/\d{4})/i)
    const publishedRaw = mDate ? String(mDate[1]) : ''
    const mPdf = html.match(/href="([^"]+\.pdf[^"]*)"/i)
    const pdfHref = mPdf ? String(mPdf[1]) : ''
    const pdfUrl = pdfHref ? new URL(pdfHref, params.focusPageUrl).toString() : null
    const publishedAt = (() => {
      const m = publishedRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (!m) return null
      const dd = Number(m[1])
      const mm = Number(m[2])
      const yyyy = Number(m[3])
      if (![dd, mm, yyyy].every(Number.isFinite)) return null
      const d = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0)
      if (Number.isNaN(d.getTime())) return null
      return d.toISOString()
    })()
    const cutoffDate = pickCutoffFriday(publishedAt)
    return { pageUrl: params.focusPageUrl, pdfUrl, publishedAt, cutoffDate }
  } catch {
    return { pageUrl: params.focusPageUrl, pdfUrl: null, publishedAt: null, cutoffDate: null }
  }
}

export function normalizeReportMetaFallback(now: Date, report: FocusReportMeta) {
  const localYmd = (d: Date) => {
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  if (report.publishedAt && report.cutoffDate) return report
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
  for (let i = 0; i < 10; i++) {
    if (base.getDay() === 1) break
    base.setDate(base.getDate() - 1)
  }
  const fallbackPublishedAt = base.toISOString()
  const publishedAt = report.publishedAt || fallbackPublishedAt
  const cutoffDate = report.cutoffDate || pickCutoffFriday(publishedAt) || localYmd(base)
  return { ...report, publishedAt, cutoffDate }
}

export async function pickTop2(params: {
  baseUrl: string
  indicador: string
  dataReferencia: string
  cutoffDate: string | null
  fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}) {
  const extra = params.cutoffDate ? ` and Data le '${params.cutoffDate}'` : ''
  const filter = `Indicador eq '${params.indicador}' and DataReferencia eq '${params.dataReferencia}' and baseCalculo eq 0${extra}`
  const url =
    `${params.baseUrl}?` +
    `$format=json&` +
    `$top=2&` +
    `$orderby=${encodeURIComponent('Data desc')}&` +
    `$filter=${encodeURIComponent(filter)}`
  const j = await params.fetchJsonWithTimeout<{ value?: FocusAnualRow[] }>(url, 4500, { 'User-Agent': 'Mozilla/5.0' })
  const rows = Array.isArray(j && j.value) ? j.value : []
  return rows.filter(r => r && typeof r.Data === 'string' && typeof r.DataReferencia === 'string')
}

export async function buildYearPack(params: {
  baseUrl: string
  year: string
  cutoffDate: string | null
  fetchJsonWithTimeout: <T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}): Promise<FocusYearPack> {
  const toPoint = (rows: FocusAnualRow[]) => {
    const cur = rows[0] || null
    const prev = rows[1] || null
    const curMed = cur && typeof cur.Mediana === 'number' && Number.isFinite(cur.Mediana) ? cur.Mediana : null
    const prevMed = prev && typeof prev.Mediana === 'number' && Number.isFinite(prev.Mediana) ? prev.Mediana : null
    const delta = curMed !== null && prevMed !== null ? curMed - prevMed : null
    const date = cur && typeof cur.Data === 'string' ? cur.Data : null
    const respondents = cur && typeof cur.numeroRespondentes === 'number' && Number.isFinite(cur.numeroRespondentes) ? cur.numeroRespondentes : null
    return { mediana: curMed, deltaMediana: delta, date, respondents }
  }

  const [ipcaRows, selicRows, cambioRows, pibRows] = await Promise.all([
    pickTop2({ baseUrl: params.baseUrl, indicador: 'IPCA', dataReferencia: params.year, cutoffDate: params.cutoffDate, fetchJsonWithTimeout: params.fetchJsonWithTimeout }),
    pickTop2({ baseUrl: params.baseUrl, indicador: 'Selic', dataReferencia: params.year, cutoffDate: params.cutoffDate, fetchJsonWithTimeout: params.fetchJsonWithTimeout }),
    pickTop2({ baseUrl: params.baseUrl, indicador: 'Câmbio', dataReferencia: params.year, cutoffDate: params.cutoffDate, fetchJsonWithTimeout: params.fetchJsonWithTimeout }),
    pickTop2({ baseUrl: params.baseUrl, indicador: 'PIB Total', dataReferencia: params.year, cutoffDate: params.cutoffDate, fetchJsonWithTimeout: params.fetchJsonWithTimeout }),
  ])

  const ipca = toPoint(ipcaRows)
  const selic = toPoint(selicRows)
  const cambio = toPoint(cambioRows)
  const pib = toPoint(pibRows)
  const updatedAt = [ipca.date, selic.date, cambio.date, pib.date].filter(Boolean).sort().slice(-1)[0] || null
  return { updatedAt, ipca, selic, cambio, pib }
}

