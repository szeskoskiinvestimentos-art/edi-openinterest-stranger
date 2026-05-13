import 'dotenv/config'
import path from 'node:path'
import { readdir, stat, mkdir, unlink } from 'node:fs/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from './lib/args.js'
import { parseCsv } from './lib/csv.js'
import { buildMarketHistory } from './market-history.js'
import type { Asset, MarketPoint, MarketQuotes } from './types.js'
import { buildPetrobrasModule } from './lib/petrobras-module.js'
import type { WebNewsModule } from './lib/petrobras-module.js'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..')

function resolveFromProject(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p)
}

function env(key: string, fallback = '') {
  const v = process.env[key]
  if (typeof v === 'string' && v.trim()) return v.trim()
  return fallback
}

function envBool(key: string, fallback: boolean) {
  const v = process.env[key]
  if (v === undefined || v === null || v === '') return fallback
  const s = String(v).trim().toLowerCase()
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false
  return fallback
}

async function fetchTextWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Math.max(250, timeoutMs))
  try {
    const r = await fetch(url, { method: 'GET', headers, signal: controller.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.text()
  } finally {
    clearTimeout(t)
  }
}

async function fetchJsonWithTimeout<T = unknown>(url: string, timeoutMs: number, headers?: Record<string, string>) {
  const raw = await fetchTextWithTimeout(url, timeoutMs, headers)
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error('JSON parse falhou')
  }
}

function clamp(val: number, min: number, max: number) {
  if (!Number.isFinite(val)) return min
  return Math.max(min, Math.min(max, val))
}

function meanAbs(vals: number[]) {
  let n = 0
  let sum = 0
  for (const x of vals) {
    if (typeof x !== 'number' || !Number.isFinite(x)) continue
    n++
    sum += Math.abs(x)
  }
  return n ? sum / n : 0
}

function ddmmyyyyToYmd(s: string) {
  const raw = String(s || '').trim()
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const dd = m[1]
  const mm = m[2]
  const yyyy = m[3]
  return `${yyyy}-${mm}-${dd}`
}

function parsePtBrNumber(raw: string) {
  const s = String(raw || '').trim()
  if (!s) return null
  const cleaned = s.replace(/\s+/g, ' ').trim()
  if (cleaned === '—' || cleaned === '-' || cleaned === '--') return null
  const m = cleaned.match(/-?\s*[\d.]+(?:,\d+)?/)
  if (!m) return null
  const num = m[0].replace(/\s+/g, '').replace(/\./g, '').replace(',', '.')
  const v = Number(num)
  return Number.isFinite(v) ? v : null
}

function parsePtBrCompactMoney(raw: string) {
  const s = String(raw || '').trim().toLowerCase()
  const base = parsePtBrNumber(s)
  if (base === null) return null
  if (/\bbi\b/.test(s)) return base * 1e9
  if (/\bmi\b/.test(s)) return base * 1e6
  if (/\bmil\b/.test(s)) return base * 1e3
  return base
}

type ForeignFlowRow = {
  date: string
  foreigners: number
  institutional: number
  individuals: number
  financial_institutions: number
  other: number
}

type ForeignFlowPayload =
  | {
      ok: true
      generatedAt: string
      provider: 'dadosdemercado_fluxo_scrape'
      source: { url: string; updatedAt?: string | null; updatedAtText?: string | null }
      latest: ForeignFlowRow
      derived: { foreigners: { cum5: number; cum20: number; ma28: number; unit: number } }
      signal: { score: number; bias: 'inflow' | 'outflow' | 'neutral'; wdo: '↓' | '↑' | '≈'; win: '↑' | '↓' | '≈' }
      series: ForeignFlowRow[]
    }
  | {
      ok: false
      generatedAt: string
      provider: 'dadosdemercado_fluxo_scrape'
      message: string
      source?: { url: string; updatedAt?: string | null; updatedAtText?: string | null }
    }

type FocusAnualRow = {
  Indicador: string
  IndicadorDetalhe?: string | null
  Data: string
  DataReferencia: string
  Media?: number | null
  Mediana?: number | null
  DesvioPadrao?: number | null
  Minimo?: number | null
  Maximo?: number | null
  numeroRespondentes?: number | null
  baseCalculo?: number | null
}

type FocusSummaryPayload =
  | {
      ok: true
      generatedAt: string
      provider: 'bcb_olinda_expectativas'
      source: { pageUrl: string; pdfUrl: string | null; datasetUrl: string; cutoffDate: string | null; publishedAt: string | null }
      years: Record<string, FocusYearPack>
      derived: {
        referenceYear: string
        score: number
        bias: 'hawkish' | 'dovish' | 'mixed'
        wdo: '↓' | '↑' | '≈'
        win: '↑' | '↓' | '≈'
      }
    }
  | {
      ok: false
      generatedAt: string
      provider: 'bcb_olinda_expectativas'
      message: string
      source: { pageUrl: string; pdfUrl: string | null; datasetUrl: string; cutoffDate: string | null; publishedAt: string | null }
    }

type FocusYearPack = {
  updatedAt: string | null
  ipca: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
  selic: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
  cambio: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
  pib: { mediana: number | null; deltaMediana: number | null; date: string | null; respondents: number | null }
}

async function buildFocusSummaryFromBcb(outDir: string): Promise<FocusSummaryPayload> {
  const baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais'
  const focusPageUrl = 'https://www.bcb.gov.br/publicacoes/focus'
  const generatedAt = new Date().toISOString()
  const now = new Date()
  const years = [now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2, now.getFullYear() + 3].map(y => String(y))

  const tzParts = (d: Date) => {
    try {
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
      const parts = fmt.formatToParts(d)
      const get = (t: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === t)?.value || ''
      const wd = get('weekday')
      const weekday =
        wd === 'Sun' ? 0 : wd === 'Mon' ? 1 : wd === 'Tue' ? 2 : wd === 'Wed' ? 3 : wd === 'Thu' ? 4 : wd === 'Fri' ? 5 : wd === 'Sat' ? 6 : d.getDay()
      const year = get('year')
      const month = get('month')
      const day = get('day')
      const hour = Number(get('hour'))
      const minute = Number(get('minute'))
      const ymd = year && month && day ? `${year}-${month}-${day}` : ''
      return { weekday, hour: Number.isFinite(hour) ? hour : d.getHours(), minute: Number.isFinite(minute) ? minute : d.getMinutes(), ymd }
    } catch {
      const y = String(d.getFullYear())
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return { weekday: d.getDay(), hour: d.getHours(), minute: d.getMinutes(), ymd: `${y}-${m}-${dd}` }
    }
  }

  const spNow = tzParts(now)
  const canAttemptAfterRelease = (() => {
    if (spNow.weekday === 1) return spNow.hour > 8 || (spNow.hour === 8 && spNow.minute >= 30)
    return spNow.weekday >= 2 && spNow.weekday <= 6
  })()

  const isPrimaryUpdateWindow = (() => {
    if (spNow.weekday !== 1) return false
    const afterStart = spNow.hour > 8 || (spNow.hour === 8 && spNow.minute >= 30)
    const beforeEnd = spNow.hour < 9 || (spNow.hour === 9 && spNow.minute === 0)
    return afterStart && beforeEnd
  })()

  const localYmd = (d: Date) => {
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const readCache = async () => {
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

  const cached = await readCache()
  const lastPublishedMondayYmd = (() => {
    const baseYmd = spNow.ymd || localYmd(now)
    const baseDt = /^\d{4}-\d{2}-\d{2}$/.test(baseYmd) ? new Date(`${baseYmd}T12:00:00`) : new Date(now)
    const isEarlyMonday = spNow.weekday === 1 && !(spNow.hour > 8 || (spNow.hour === 8 && spNow.minute >= 30))
    const weekdayForCalc = isEarlyMonday ? 0 : spNow.weekday
    const delta = weekdayForCalc === 0 ? 6 : weekdayForCalc - 1
    const dt = new Date(baseDt.getFullYear(), baseDt.getMonth(), baseDt.getDate(), 12, 0, 0, 0)
    dt.setDate(dt.getDate() - delta)
    const y = String(dt.getFullYear())
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })()

  const cachedPublishedYmd = (() => {
    if (!cached || cached.ok !== true) return ''
    const pub = cached.source && typeof cached.source === 'object' ? (cached.source as { publishedAt?: unknown }).publishedAt : null
    if (typeof pub !== 'string' || !pub) return ''
    const dt = new Date(pub)
    if (Number.isNaN(dt.getTime())) return ''
    return tzParts(dt).ymd || localYmd(dt)
  })()

  const hasCurrentWeek = Boolean(cachedPublishedYmd && cachedPublishedYmd === lastPublishedMondayYmd)
  const hasAllYearsInCache =
    !!cached &&
    cached.ok === true &&
    typeof cached.years === 'object' &&
    cached.years !== null &&
    years.every(y => Object.prototype.hasOwnProperty.call(cached.years, y))
  const mustCatchUp = canAttemptAfterRelease && (!hasCurrentWeek || !hasAllYearsInCache)
  if (!isPrimaryUpdateWindow && !mustCatchUp) {
    if (cached) return cached
    return {
      ok: false,
      generatedAt,
      provider: 'bcb_olinda_expectativas',
      message: 'Fora da janela de atualização do Focus (seg 08:30-09:00) e sem coleta pendente na semana.',
      source: { pageUrl: focusPageUrl, pdfUrl: null, datasetUrl: baseUrl, cutoffDate: null, publishedAt: null },
    }
  }

  const pickCutoffFriday = (publishedAtIso: string | null) => {
    if (!publishedAtIso) return null
    const dt = new Date(publishedAtIso)
    if (Number.isNaN(dt.getTime())) return null
    const d = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12, 0, 0, 0)
    d.setDate(d.getDate() - 1)
    for (let i = 0; i < 10; i++) {
      if (d.getDay() === 5) return localYmd(d)
      d.setDate(d.getDate() - 1)
    }
    return null
  }

  const fetchFocusReportMeta = async () => {
    try {
      const html = await fetchTextWithTimeout(focusPageUrl, 4500, { 'User-Agent': 'Mozilla/5.0' })
      const mDate = html.match(/Data de publicação:\s*(\d{2}\/\d{2}\/\d{4})/i)
      const publishedRaw = mDate ? String(mDate[1]) : ''
      const mPdf = html.match(/href="([^"]+\.pdf[^"]*)"/i)
      const pdfHref = mPdf ? String(mPdf[1]) : ''
      const pdfUrl = pdfHref ? new URL(pdfHref, focusPageUrl).toString() : null
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
      return { pageUrl: focusPageUrl, pdfUrl, publishedAt, cutoffDate }
    } catch {
      return { pageUrl: focusPageUrl, pdfUrl: null, publishedAt: null, cutoffDate: null }
    }
  }

  const report = await fetchFocusReportMeta()
  if (!report.publishedAt || !report.cutoffDate) {
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
    for (let i = 0; i < 10; i++) {
      if (base.getDay() === 1) break
      base.setDate(base.getDate() - 1)
    }
    const fallbackPublishedAt = base.toISOString()
    report.publishedAt = report.publishedAt || fallbackPublishedAt
    report.cutoffDate = report.cutoffDate || pickCutoffFriday(report.publishedAt)
  }

  const pickTop2 = async (indicador: string, dataReferencia: string) => {
    const extra = report.cutoffDate ? ` and Data le '${report.cutoffDate}'` : ''
    const filter = `Indicador eq '${indicador}' and DataReferencia eq '${dataReferencia}' and baseCalculo eq 0${extra}`
    const url =
      `${baseUrl}?` +
      `$format=json&` +
      `$top=2&` +
      `$orderby=${encodeURIComponent('Data desc')}&` +
      `$filter=${encodeURIComponent(filter)}`
    const j = await fetchJsonWithTimeout<{ value?: FocusAnualRow[] }>(url, 4500, { 'User-Agent': 'Mozilla/5.0' })
    const rows = Array.isArray(j && j.value) ? j.value : []
    return rows.filter(r => r && typeof r.Data === 'string' && typeof r.DataReferencia === 'string')
  }

  const pack = async (y: string) => {
    const toPoint = (rows: FocusAnualRow[]) => {
      const cur = rows[0] || null
      const prev = rows[1] || null
      const curMed = cur && typeof cur.Mediana === 'number' && Number.isFinite(cur.Mediana) ? cur.Mediana : null
      const prevMed = prev && typeof prev.Mediana === 'number' && Number.isFinite(prev.Mediana) ? prev.Mediana : null
      const delta = curMed !== null && prevMed !== null ? curMed - prevMed : null
      const date = cur && typeof cur.Data === 'string' ? cur.Data : null
      const respondents =
        cur && typeof cur.numeroRespondentes === 'number' && Number.isFinite(cur.numeroRespondentes) ? cur.numeroRespondentes : null
      return { mediana: curMed, deltaMediana: delta, date, respondents }
    }

    const [ipcaRows, selicRows, cambioRows, pibRows] = await Promise.all([
      pickTop2('IPCA', y),
      pickTop2('Selic', y),
      pickTop2('Câmbio', y),
      pickTop2('PIB Total', y),
    ])

    const ipca = toPoint(ipcaRows)
    const selic = toPoint(selicRows)
    const cambio = toPoint(cambioRows)
    const pib = toPoint(pibRows)
    const updatedAt = [ipca.date, selic.date, cambio.date, pib.date].filter(Boolean).sort().slice(-1)[0] || null
    return { updatedAt, ipca, selic, cambio, pib }
  }

  try {
    const entries = await Promise.all(years.map(async y => [y, await pack(y)] as const))
    const yearsObj = Object.fromEntries(entries) as Record<string, FocusYearPack>

    const refYear = years[0]
    const ref = yearsObj[refYear]
    const sgn = (x: number | null) => (typeof x === 'number' && Number.isFinite(x) ? (x > 0 ? 1 : x < 0 ? -1 : 0) : 0)
    const score =
      1.0 * sgn(ref?.ipca?.deltaMediana ?? null) +
      1.0 * sgn(ref?.selic?.deltaMediana ?? null) +
      0.6 * sgn(ref?.cambio?.deltaMediana ?? null) +
      -0.4 * sgn(ref?.pib?.deltaMediana ?? null)
    const bias = score > 0.8 ? 'hawkish' : score < -0.8 ? 'dovish' : 'mixed'
    const wdo = bias === 'hawkish' ? '↑' : bias === 'dovish' ? '↓' : '≈'
    const win = bias === 'hawkish' ? '↓' : bias === 'dovish' ? '↑' : '≈'

    return {
      ok: true,
      generatedAt,
      provider: 'bcb_olinda_expectativas',
      source: { pageUrl: report.pageUrl, pdfUrl: report.pdfUrl, datasetUrl: baseUrl, cutoffDate: report.cutoffDate, publishedAt: report.publishedAt },
      years: yearsObj,
      derived: { referenceYear: refYear, score, bias, wdo, win },
    }
  } catch (e) {
    if (cached && cached.ok === true) return cached
    return {
      ok: false,
      generatedAt,
      provider: 'bcb_olinda_expectativas',
      message: `Falha ao buscar Boletim Focus (Olinda): ${String(e instanceof Error ? e.message : e)}`,
      source: { pageUrl: report.pageUrl, pdfUrl: report.pdfUrl, datasetUrl: baseUrl, cutoffDate: report.cutoffDate, publishedAt: report.publishedAt },
    }
  }
}

function extractDadosDeMercadoUpdatedAt(html: string) {
  const m = String(html || '').match(/Atualizado em\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]{3}),?\s+(\d{4})\s+(\d{2}):(\d{2})/i)
  if (!m) return { updatedAt: null as string | null, updatedAtText: null as string | null }
  const day = Number(m[1])
  const monRaw = String(m[2] || '').toLowerCase()
  const year = Number(m[3])
  const hh = Number(m[4])
  const mm = Number(m[5])
  const monthMap: Record<string, number> = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  }
  const mon = monthMap[monRaw]
  if (![day, year, hh, mm].every(Number.isFinite) || mon === undefined) {
    return { updatedAt: null as string | null, updatedAtText: m[0] || null }
  }
  const dt = new Date(year, mon, day, hh, mm, 0, 0)
  if (Number.isNaN(dt.getTime())) return { updatedAt: null as string | null, updatedAtText: m[0] || null }
  return { updatedAt: dt.toISOString(), updatedAtText: m[0] || null }
}

function extractForeignFlowRowsFromHtml(html: string) {
  const out: ForeignFlowRow[] = []
  const re =
    /<tr[^>]*>\s*<td[^>]*>\s*(\d{2}\/\d{2}\/\d{4})\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>[\s\S]*?<\/tr>/gi
  let m: RegExpExecArray | null = null
  while ((m = re.exec(html))) {
    const date = ddmmyyyyToYmd(m[1])
    if (!date) continue
    const foreigners = parsePtBrCompactMoney(m[2]) ?? 0
    const institutional = parsePtBrCompactMoney(m[3]) ?? 0
    const individuals = parsePtBrCompactMoney(m[4]) ?? 0
    const financial_institutions = parsePtBrCompactMoney(m[5]) ?? 0
    const other = parsePtBrCompactMoney(m[6]) ?? 0
    out.push({ date, foreigners, institutional, individuals, financial_institutions, other })
  }
  out.sort((a, b) => a.date.localeCompare(b.date))
  return out
}

async function buildForeignFlowFromScrape(outDir: string): Promise<ForeignFlowPayload> {
  const enabled = envBool('DADOS_DE_MERCADO_FLOW_SCRAPE_ENABLED', true)
  const url = env('DADOS_DE_MERCADO_FLOW_URL', 'https://www.dadosdemercado.com.br/fluxo')
  const refreshHourRaw = Number(env('DADOS_DE_MERCADO_FLOW_REFRESH_HOUR', '6'))
  const refreshHour = Number.isFinite(refreshHourRaw) ? Math.max(0, Math.min(23, Math.floor(refreshHourRaw))) : 6
  const refreshMinuteRaw = Number(env('DADOS_DE_MERCADO_FLOW_REFRESH_MINUTE', '20'))
  const refreshMinute = Number.isFinite(refreshMinuteRaw) ? Math.max(0, Math.min(59, Math.floor(refreshMinuteRaw))) : 20
  const now = new Date()
  const generatedAt = now.toISOString()
  if (!enabled) {
    return { ok: false, generatedAt, provider: 'dadosdemercado_fluxo_scrape', message: 'Desabilitado', source: { url } }
  }

  const localYmd = (d: Date) => {
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const readCache = async () => {
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

  const cached = await readCache()
  const nowYmd = localYmd(now)
  if (cached) {
    const beforeRefresh = now.getHours() < refreshHour || (now.getHours() === refreshHour && now.getMinutes() < refreshMinute)
    if (beforeRefresh) return cached.payload
    if (cached.ymd === nowYmd) {
      const cachedBeforeRefresh =
        cached.dt.getHours() < refreshHour || (cached.dt.getHours() === refreshHour && cached.dt.getMinutes() < refreshMinute)
      if (!cachedBeforeRefresh) {
        const hasUpdatedAt =
          cached.payload &&
          typeof cached.payload === 'object' &&
          (cached.payload as { ok?: unknown }).ok === true &&
          (cached.payload as { source?: unknown }).source &&
          typeof (cached.payload as { source?: { updatedAt?: unknown } }).source?.updatedAt === 'string'
        if (hasUpdatedAt) return cached.payload
      }
    }
  }

  try {
    const html = await fetchTextWithTimeout(url, 8000, { 'User-Agent': 'Mozilla/5.0' })
    const sourceUpdated = extractDadosDeMercadoUpdatedAt(html)
    const series = extractForeignFlowRowsFromHtml(html).slice(-420)
    if (!series.length) throw new Error('Tabela não encontrada ou vazia')
    const latest = series[series.length - 1]
    const last60 = series.slice(-60).map(x => x.foreigners)
    const unit = meanAbs(last60) || 1_000_000_000

    const sumLast = (n: number) => series.slice(-n).reduce((s, x) => s + x.foreigners, 0)
    const cum5 = sumLast(5)
    const cum20 = sumLast(20)
    const ma28 =
      series.length >= 28
        ? series.slice(-28).reduce((s, x) => s + x.foreigners, 0) / 28
        : series.reduce((s, x) => s + x.foreigners, 0) / series.length

    const score = clamp(cum5 / (unit * 5), -1, 1)
    const bias = score > 0.25 ? 'inflow' : score < -0.25 ? 'outflow' : 'neutral'
    const wdo = bias === 'inflow' ? '↓' : bias === 'outflow' ? '↑' : '≈'
    const win = bias === 'inflow' ? '↑' : bias === 'outflow' ? '↓' : '≈'

    return {
      ok: true,
      generatedAt,
      provider: 'dadosdemercado_fluxo_scrape',
      source: { url, updatedAt: sourceUpdated.updatedAt, updatedAtText: sourceUpdated.updatedAtText },
      latest,
      derived: { foreigners: { cum5, cum20, ma28, unit } },
      signal: { score, bias, wdo, win },
      series,
    }
  } catch (e) {
    if (cached) return cached.payload
    return {
      ok: false,
      generatedAt,
      provider: 'dadosdemercado_fluxo_scrape',
      message: `Falha no scraping: ${String(e instanceof Error ? e.message : e)}`,
      source: { url },
    }
  }
}

 

function parseSinaHqVar(raw: string) {
  const m = String(raw || '').match(/var\s+hq_str_[^=]+="([^"]*)"/)
  if (!m) return null
  const payloadStr = String(m[1] || '')
  if (!payloadStr) return null
  const parts = payloadStr.split(',')
  if (!parts.length) return null
  const name = String(parts[0] || '').trim()
  const timeRaw = String(parts[1] || '').trim()
  const time = /^\d{6}$/.test(timeRaw) ? `${timeRaw.slice(0, 2)}:${timeRaw.slice(2, 4)}:${timeRaw.slice(4, 6)}` : null
  const date =
    parts
      .map(x => String(x || '').trim())
      .find(x => /^\d{4}-\d{2}-\d{2}$/.test(x)) || null

  const price = Number(parts[8])
  if (!Number.isFinite(price)) return null
  const change = Number(parts[9])
  return {
    name: name || null,
    price,
    change: Number.isFinite(change) ? change : null,
    time,
    date,
  }
}

async function fileExists(p: string) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function writeJsonAndJs(outDir: string, baseName: string, windowKey: string, payload: unknown) {
  const jsonPath = path.join(outDir, `${baseName}.json`)
  const jsPath = path.join(outDir, `${baseName}.js`)
  await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(jsPath, `window.${windowKey}=${JSON.stringify(payload)};`, 'utf-8')
}

async function exportDashboardPdf() {
  const enabled = envBool('EXPORT_DASHBOARD_PDF', true)
  if (!enabled) return
  const indexPath = path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'index.html')
  const exists = await fileExists(indexPath)
  if (!exists) return
  const outDir = resolveFromProject(env('EXPORT_PDF_OUT_DIR', path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'exports')))
  await mkdir(outDir, { recursive: true })
  const stamp = new Date()
  const yyyy = String(stamp.getFullYear())
  const mm = String(stamp.getMonth() + 1).padStart(2, '0')
  const dd = String(stamp.getDate()).padStart(2, '0')
  const hh = String(stamp.getHours()).padStart(2, '0')
  const mi = String(stamp.getMinutes()).padStart(2, '0')
  const ss = String(stamp.getSeconds()).padStart(2, '0')
  const prefix = env('EXPORT_PDF_FILENAME_PREFIX', 'MERCADO')
  const pdfName = `${prefix}_${yyyy}${mm}${dd}_${hh}${mi}${ss}.pdf`
  const pdfPath = path.join(outDir, pdfName)
  const fileUrl = pathToFileURL(indexPath).toString()
  let browser: import('playwright').Browser | null = null
  try {
    const { chromium } = await import('playwright')
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(2500)
    try {
      await page.emulateMedia({ media: 'screen' })
    } catch {
      void 0
    }
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
    })
    process.stdout.write(`OK • dashboard PDF exportado: ${pdfPath}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao exportar PDF do dashboard: ${String(e instanceof Error ? e.message : e)}\n`)
  } finally {
    if (browser) await browser.close()
  }

  try {
    await purgeOldExports(outDir, [env('EXPORT_PDF_FILENAME_PREFIX', 'MERCADO')])
  } catch {
    void 0
  }
}

async function exportDashboardPdfLite() {
  const enabled = envBool('EXPORT_DASHBOARD_PDF_LITE', true)
  if (!enabled) return
  const indexPath = path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'index.html')
  const exists = await fileExists(indexPath)
  if (!exists) return
  const outDir = resolveFromProject(env('EXPORT_PDF_OUT_DIR', path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'exports')))
  await mkdir(outDir, { recursive: true })
  const stamp = new Date()
  const yyyy = String(stamp.getFullYear())
  const mm = String(stamp.getMonth() + 1).padStart(2, '0')
  const dd = String(stamp.getDate()).padStart(2, '0')
  const hh = String(stamp.getHours()).padStart(2, '0')
  const mi = String(stamp.getMinutes()).padStart(2, '0')
  const ss = String(stamp.getSeconds()).padStart(2, '0')
  const prefix = env('EXPORT_PDF_LITE_PREFIX', 'MERCADO_LITE')
  const pdfName = `${prefix}_${yyyy}${mm}${dd}_${hh}${mi}${ss}.pdf`
  const pdfPath = path.join(outDir, pdfName)
  const fileUrl = pathToFileURL(indexPath).toString()
  let browser: import('playwright').Browser | null = null
  try {
    const { chromium } = await import('playwright')
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(2500)
    try {
      await page.addStyleTag({
        content: `
          * { box-shadow: none !important; text-shadow: none !important; }
          html, body { color: #000 !important; font-size: 11px !important; }
          body, body * { color: #000 !important; opacity: 1 !important; }
          a, a:visited { color: #000 !important; text-decoration: none !important; }
          html, body, .main, .section, .context-box, .table-container, nav, header, footer {
            background: #ffffff !important;
          }
          nav, header { display: none !important; }
          .section-glow, .quicknav-overlay { display: none !important; }
          .positive, .negative, .neutral {
            color: #000 !important;
            border-color: #000 !important;
            background: transparent !important;
          }
          .data-table th, .data-table td {
            border-color: #000 !important;
          }
          .data-table th, .data-table td { padding: 4px 6px !important; font-size: 10px !important; }
          .tm-card__list .tm-row .tm-row__pct,
          .tm-card__list .tm-row .tm-row__name,
          .tm-card__list .tm-row .tm-row__symbol {
            color: #000 !important;
          }
          canvas { filter: grayscale(100%) saturate(0%) !important; }
          svg { filter: grayscale(100%) saturate(0%) !important; }
          .calendar-widget__iframe { filter: grayscale(100%) saturate(0%) !important; }
          .metric-card, .context-box, .data-table, details, summary {
            border-color: #000 !important;
            background: #fff !important;
          }
          h1 { font-size: 16px !important; margin: 6px 0 !important; }
          h2 { font-size: 14px !important; margin: 6px 0 !important; }
          h3 { font-size: 12px !important; margin: 6px 0 !important; }
          p { margin: 4px 0 !important; }
          .context-box, .metric-card, details { padding: 8px !important; }
          .table-container { padding: 6px !important; }
        `,
      })
      await page.emulateMedia({ media: 'screen' })
    } catch {
      void 0
    }
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: false,
      scale: 0.96,
      margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' },
    })
    process.stdout.write(`OK • dashboard PDF (Lite) exportado: ${pdfPath}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao exportar PDF Lite do dashboard: ${String(e instanceof Error ? e.message : e)}\n`)
  } finally {
    if (browser) await browser.close()
  }

  try {
    await purgeOldExports(outDir, [env('EXPORT_PDF_LITE_PREFIX', 'MERCADO_LITE')])
  } catch {
    void 0
  }
}

async function exportPdfLiteFromIndex(input: { indexPath: string; outDir: string; prefix: string; label: string }) {
  const exists = await fileExists(input.indexPath)
  if (!exists) return
  await mkdir(input.outDir, { recursive: true })
  const stamp = new Date()
  const yyyy = String(stamp.getFullYear())
  const mm = String(stamp.getMonth() + 1).padStart(2, '0')
  const dd = String(stamp.getDate()).padStart(2, '0')
  const hh = String(stamp.getHours()).padStart(2, '0')
  const mi = String(stamp.getMinutes()).padStart(2, '0')
  const ss = String(stamp.getSeconds()).padStart(2, '0')
  const pdfName = `${input.prefix}_${yyyy}${mm}${dd}_${hh}${mi}${ss}.pdf`
  const pdfPath = path.join(input.outDir, pdfName)
  const fileUrl = pathToFileURL(input.indexPath).toString()
  let browser: import('playwright').Browser | null = null
  try {
    const { chromium } = await import('playwright')
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(2500)
    try {
      await page.addStyleTag({
        content: `
          * { box-shadow: none !important; text-shadow: none !important; }
          html, body { color: #000 !important; font-size: 11px !important; }
          body, body * { color: #000 !important; opacity: 1 !important; }
          a, a:visited { color: #000 !important; text-decoration: none !important; }
          html, body, .main, .section, .context-box, .table-container, nav, header, footer {
            background: #ffffff !important;
          }
          nav, header { display: none !important; }
          .section-glow, .quicknav-overlay { display: none !important; }
          .positive, .negative, .neutral {
            color: #000 !important;
            border-color: #000 !important;
            background: transparent !important;
          }
          .data-table th, .data-table td {
            border-color: #000 !important;
          }
          .data-table th, .data-table td { padding: 4px 6px !important; font-size: 10px !important; }
          .tm-card__list .tm-row .tm-row__pct,
          .tm-card__list .tm-row .tm-row__name,
          .tm-card__list .tm-row .tm-row__symbol {
            color: #000 !important;
          }
          canvas { filter: grayscale(100%) saturate(0%) !important; }
          svg { filter: grayscale(100%) saturate(0%) !important; }
          .calendar-widget__iframe { filter: grayscale(100%) saturate(0%) !important; }
          .metric-card, .context-box, .data-table, details, summary {
            border-color: #000 !important;
            background: #fff !important;
          }
          h1 { font-size: 16px !important; margin: 6px 0 !important; }
          h2 { font-size: 14px !important; margin: 6px 0 !important; }
          h3 { font-size: 12px !important; margin: 6px 0 !important; }
          p { margin: 4px 0 !important; }
          .context-box, .metric-card, details { padding: 8px !important; }
          .table-container { padding: 6px !important; }
        `,
      })
      await page.emulateMedia({ media: 'screen' })
    } catch {
      void 0
    }
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: false,
      scale: 0.96,
      margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' },
    })
    process.stdout.write(`OK • ${input.label}: ${pdfPath}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao exportar PDF Lite (${input.label}): ${String(e instanceof Error ? e.message : e)}\n`)
  } finally {
    if (browser) await browser.close()
  }

  try {
    await purgeOldExports(input.outDir, [input.prefix])
  } catch {
    void 0
  }
}

async function exportWdoWinDashboardsPdfLite() {
  const enabled = envBool('EXPORT_WDO_WIN_DASHBOARDS_PDF_LITE', true)
  if (!enabled) return

  const outDir = resolveFromProject(env('EXPORT_PDF_OUT_DIR', path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'exports')))

  const optionsDashboardDir = resolveFromProject(
    env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(PROJECT_ROOT, '..', 'B3_System', 'dashboard_unificado')),
  )

  const wdoIndex = path.resolve(optionsDashboardDir, 'WDO', 'index.html')
  const winIndex = path.resolve(optionsDashboardDir, 'WIN', 'index.html')

  await exportPdfLiteFromIndex({
    indexPath: wdoIndex,
    outDir,
    prefix: env('EXPORT_PDF_WDO_V1_LITE_PREFIX', 'WDO_V1_LITE'),
    label: 'dashboard WDO v1 (Lite)',
  })
  await exportPdfLiteFromIndex({
    indexPath: winIndex,
    outDir,
    prefix: env('EXPORT_PDF_WIN_V1_LITE_PREFIX', 'WIN_V1_LITE'),
    label: 'dashboard WIN v1 (Lite)',
  })
}

function parseStampFromName(name: string) {
  const m = name.match(/_(\d{8})_(\d{6})\.pdf$/)
  if (!m) return 0
  const d = m[1]
  const t = m[2]
  const y = Number(d.slice(0, 4))
  const mo = Number(d.slice(4, 6))
  const day = Number(d.slice(6, 8))
  const hh = Number(t.slice(0, 2))
  const mi = Number(t.slice(2, 4))
  const ss = Number(t.slice(4, 6))
  const dt = new Date(y, mo - 1, day, hh, mi, ss).getTime()
  return Number.isFinite(dt) ? dt : 0
}

async function purgeOldExports(outDir: string, prefixes: string[]) {
  const entries = await readdir(outDir, { withFileTypes: true })
  const pdfs = entries
    .filter(e => e.isFile() && /\.pdf$/i.test(e.name))
    .map(e => e.name)
  for (const prefix of prefixes) {
    const list = pdfs.filter(n => n.startsWith(`${prefix}_`))
    if (list.length <= 1) continue
    const sorted = list
      .map(n => ({ name: n, ts: parseStampFromName(n) }))
      .sort((a, b) => a.ts - b.ts)
    const toDelete = sorted.slice(0, -1).map(x => x.name)
    await Promise.all(
      toDelete.map(n =>
        unlink(path.join(outDir, n)).catch(() => void 0),
      ),
    )
  }
}

async function buildOptionsGammaSummary() {
  type OptionsMarketData = {
    last_updated?: string
    spot_price?: number
    overview?: { last_update?: string; spot_price?: number; regime?: string }
    key_levels?: {
      gamma_flip?: number
      gamma_flip_hvl?: number
      gamma_flip_hvl_gaussian?: number
      gamma_flip_selected?: number
      gamma_flip_model?: string
      call_wall?: number
      put_wall?: number
      effective_call_wall?: number
      effective_put_wall?: number
      max_pain?: number
      range_low?: number
      range_high?: number
    }
  }

  const optionsDashboardDir = resolveFromProject(
    env('OPTIONS_UNIFIED_DASHBOARD_DIR', path.resolve(PROJECT_ROOT, '..', 'B3_System', 'dashboard_unificado')),
  )

  async function loadOne(symbol: 'WDO' | 'WIN') {
    const jsonPath = path.join(optionsDashboardDir, symbol, 'assets', 'data', 'market_data.json')
    if (!(await fileExists(jsonPath))) return null
    const raw = JSON.parse(await readFile(jsonPath, 'utf-8')) as OptionsMarketData

    const overviewSpot =
      raw && raw.overview && typeof raw.overview.spot_price === 'number' ? raw.overview.spot_price : null
    const topSpot = raw && typeof raw.spot_price === 'number' ? raw.spot_price : null
    const key = raw && raw.key_levels ? raw.key_levels : null

    const flipCandidate =
      key && typeof key.gamma_flip_selected === 'number'
        ? key.gamma_flip_selected
        : key && typeof key.gamma_flip === 'number'
          ? key.gamma_flip
          : key && typeof key.gamma_flip_hvl === 'number'
            ? key.gamma_flip_hvl
            : key && typeof key.gamma_flip_hvl_gaussian === 'number'
              ? key.gamma_flip_hvl_gaussian
              : null

    const fileUrl = pathToFileURL(path.join(optionsDashboardDir, symbol, 'index.html')).toString()
    const dataUrl = pathToFileURL(jsonPath).toString()

    return {
      symbol,
      updatedAt: (raw && raw.overview && raw.overview.last_update) || raw.last_updated || null,
      spot: overviewSpot ?? topSpot,
      regime: (raw && raw.overview && raw.overview.regime) || null,
      keyLevels: {
        gammaFlip: flipCandidate,
        gammaFlipModel: key && typeof key.gamma_flip_model === 'string' ? key.gamma_flip_model : null,
        callWall: key && typeof key.call_wall === 'number' ? key.call_wall : null,
        putWall: key && typeof key.put_wall === 'number' ? key.put_wall : null,
        effectiveCallWall: key && typeof key.effective_call_wall === 'number' ? key.effective_call_wall : null,
        effectivePutWall: key && typeof key.effective_put_wall === 'number' ? key.effective_put_wall : null,
        maxPain: key && typeof key.max_pain === 'number' ? key.max_pain : null,
        rangeLow: key && typeof key.range_low === 'number' ? key.range_low : null,
        rangeHigh: key && typeof key.range_high === 'number' ? key.range_high : null,
      },
      links: { dashboard: fileUrl, data: dataUrl },
    }
  }

  const [wdo, win] = await Promise.all([loadOne('WDO'), loadOne('WIN')])
  const items: Record<string, unknown> = {}
  if (wdo) items.WDO = wdo
  if (win) items.WIN = win

  if (!Object.keys(items).length) {
    return {
      ok: false,
      generatedAt: new Date().toISOString(),
      provider: 'options_gamma_summary',
      message: `Sem arquivos de opções em ${optionsDashboardDir}`,
    }
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: { kind: 'dashboard_unificado', dir: optionsDashboardDir },
    items,
  }
}

function sanitizeNoNumbers(raw: string) {
  return String(raw || '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim()
}

function parseRssItems(xml: string) {
  const out: Array<{ title: string; link: string; pubDate: string | null; source: string | null }> = []
  const blocks = String(xml || '').match(/<item[\s\S]*?<\/item>/gi) || []
  for (const b of blocks) {
    const title = (b.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1] || b.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim()
    const link = (b.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '').trim()
    const pubDate = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '').trim() || null
    const source = (b.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || '').trim() || null
    if (title && link) out.push({ title, link, pubDate, source })
  }
  return out
}

function classifyWebBucket(title: string, url: string) {
  const s = `${title} ${url}`.toLowerCase()
  if (/\bbrazil\b|\bbrasil\b|\bcopom\b|\bbcb\b|\bfiscal\b|\bcongress\b|\bhaddad\b|\blula\b/.test(s)) return 'BRASIL'
  if (/\boil\b|\bbrent\b|\bwti\b|\bopec\b|\biron\b|\bore\b|\bsteel\b|\bsoy\b|\bsoybean\b|\bcorn\b|\bcoffee\b|\bsugar\b/.test(s)) return 'COMMODITIES'
  return 'GLOBAL'
}

function classifyWebImpact(title: string) {
  const s = title.toLowerCase()
  const riskOff = /\brisk[-\s]?off\b|\bfears\b|\btensions\b|\bescalat|\bwar\b|\bconflict\b|\bcrisis\b/.test(s)
  const riskOn = /\brisk[-\s]?on\b|\brally\b|\bsurge\b|\boptimis\b/.test(s)
  const hawkish = /\bhawkish\b|\binflation\b|\byields?\s+(?:rise|jump|up)\b|\brates?\s+(?:rise|up)\b/.test(s)
  const dovish = /\bdovish\b|\brates?\s+(?:cut|cuts|down)\b|\byields?\s+(?:fall|down)\b/.test(s)

  if (riskOff || hawkish) return { wdo: '↑', win: '↓', confidence: 'média' }
  if (riskOn || dovish) return { wdo: '↓', win: '↑', confidence: 'média' }
  return { wdo: '≈', win: '≈', confidence: 'baixa' }
}

async function buildWebNewsModule() {
  const windowHours = Math.max(6, Number(env('NEWS_WEB_WINDOW_HOURS', '24')) || 24)
  const maxItems = Math.max(5, Math.min(80, Number(env('NEWS_WEB_MAX_ITEMS', '40')) || 40))

  const rawUrls = String(env('NEWS_WEB_RSS_URLS', '') || '').trim()
  const defaultWebRssUrls = [
    'https://news.google.com/rss/search?q=Fed%20inflation%20Treasury%20yields%20Dollar%20DXY&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=global%20markets%20risk%20on%20risk%20off%20credit%20spreads&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=Brazil%20fiscal%20Congress%20Haddad%20Lula%20Copom%20BCB&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    'https://news.google.com/rss/search?q=oil%20OPEC%20Brent%20WTI%20supply%20geopolitics&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=iron%20ore%20China%20steel%20property&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=soybeans%20corn%20coffee%20sugar%20weather%20South%20America&hl=en-US&gl=US&ceid=US:en',
  ]

  const urls = rawUrls
    ? Array.from(new Set(rawUrls.split(/[\n,;]+/g).map(x => x.trim()).filter(Boolean)))
    : defaultWebRssUrls

  const now = Date.now()
  const windowMs = windowHours * 60 * 60 * 1000

  const pulled = await Promise.allSettled(
    urls.map(async url => {
      const xml = await fetchTextWithTimeout(url, 6500)
      return { url, items: parseRssItems(xml) }
    }),
  )

  const all: Array<{
    id: string
    title: string
    url: string
    publishedAt: string | null
    source: string | null
    bucket: string
    driver: string
    impact: { wdo: string; win: string }
    confidence: string
  }> = []

  for (const r of pulled) {
    if (r.status !== 'fulfilled') continue
    const host = (() => {
      try {
        return new URL(r.value.url).hostname
      } catch {
        return ''
      }
    })()
    for (const it of r.value.items) {
      const publishedMs = it.pubDate ? Date.parse(it.pubDate) : NaN
      const within = Number.isFinite(publishedMs) ? now - publishedMs <= windowMs : true
      if (!within) continue

      const title = sanitizeNoNumbers(it.title)
      if (!title || !it.link) continue

      const bucket = classifyWebBucket(title, it.link)
      const impactInfo = classifyWebImpact(title)
      const publishedAt = Number.isFinite(publishedMs) ? new Date(publishedMs).toISOString() : null
      const id = `${it.link}::${title}`.slice(0, 320)

      all.push({
        id,
        title,
        url: it.link,
        publishedAt,
        source: sanitizeNoNumbers(it.source || host) || host || null,
        bucket,
        driver: '',
        impact: { wdo: impactInfo.wdo, win: impactInfo.win },
        confidence: impactInfo.confidence,
      })
    }
  }

  const byId = new Map<string, (typeof all)[number]>()
  for (const x of all) byId.set(x.id, x)
  const merged = Array.from(byId.values()).sort((a, b) => {
    const am = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const bm = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return bm - am
  })

  const items = merged.slice(0, maxItems)
  const sources = Array.from(new Set(items.map(x => x.source).filter(Boolean))).slice(0, 12)

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    provider: 'web_news_module',
    windowHours,
    sources,
    summary: {
      globalTop: [],
      brasilTop: [],
      commoditiesTop: [],
      sentiment: 'Neutro',
      bullish: [],
      bearish: [],
      conflicts: [],
      thesis: null,
    },
    items,
  }
}

 

async function mergeSinaQuoteIntoMarketQuotes(
  outDir: string,
  input: { seriesKey: string; asset: Asset; price: number; change?: number | null },
) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as MarketQuotes
  if (!parsed || !Array.isArray(parsed.assets) || !parsed.series || !parsed.meta) return

  const generatedAt = String(parsed.meta.generatedAt || new Date().toISOString())
  const assets: Asset[] = parsed.assets
  const series: Record<string, MarketPoint[]> = parsed.series
  const key = String(input.seriesKey || '').trim()
  if (!key) return

  const hasAsset = new Set(assets.map(a => String(a && a.symbol ? a.symbol : '')))
  if (!hasAsset.has(key)) assets.push(input.asset)

  const points = Array.isArray(series[key]) ? series[key] : []
  const prev = points.length ? points[points.length - 1] : null
  const point: MarketPoint = { t: generatedAt, price: input.price }

  if (typeof input.change === 'number' && Number.isFinite(input.change) && input.change !== 0) {
    point.change = input.change
    if (prev && typeof prev.price === 'number' && prev.price !== 0) {
      const pct = (input.change / prev.price) * 100
      if (Number.isFinite(pct) && pct !== 0) point.changePct = pct
    }
  } else if (prev && typeof prev.price === 'number') {
    const change = input.price - prev.price
    if (Number.isFinite(change) && change !== 0) point.change = change
    if (prev.price !== 0) {
      const pct = (change / prev.price) * 100
      if (Number.isFinite(pct) && pct !== 0) point.changePct = pct
    }
  }

  series[key] = prev && prev.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])

  assets.sort((a, b) => String(a.symbol || '').localeCompare(String(b.symbol || '')))
  parsed.assets = assets
  parsed.series = series
  await writeFile(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`, 'utf-8')
}

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

async function resolveDefaultCsvPath(cwd: string) {
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

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const outDir = resolveFromProject(
    (args.out as string) ||
      path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'assets', 'data'),
  )
  const intervalMinutes = Number(args.interval || 30)
  const retentionDays = Number(args.retentionDays || 5)
  const timestamp = args.timestamp as string | undefined

  if (args.addonsOnly === true) {
    let webNewsPayload: unknown = null
    try {
      const payload = await buildOptionsGammaSummary()
      await writeJsonAndJs(outDir, 'options_gamma_summary', 'OPTIONS_GAMMA_SUMMARY_DATA', payload)
      process.stdout.write('OK • options_gamma_summary.json\n')
    } catch (e) {
      process.stderr.write(
        `WARN • Falha ao gerar options_gamma_summary.json: ${String(e instanceof Error ? e.message : e)}\n`,
      )
    }

    try {
      const payload = await buildWebNewsModule()
      webNewsPayload = payload
      await writeJsonAndJs(outDir, 'web_news_module', 'WEB_NEWS_MODULE_DATA', payload)
      process.stdout.write('OK • web_news_module.json\n')
    } catch (e) {
      process.stderr.write(
        `WARN • Falha ao gerar web_news_module.json: ${String(e instanceof Error ? e.message : e)}\n`,
      )
    }

    try {
      const payload = await buildForeignFlowFromScrape(outDir)
      await writeJsonAndJs(outDir, 'foreign_flow', 'FOREIGN_FLOW_DATA', payload)
      if (payload.ok === true) process.stdout.write('OK • foreign_flow.json\n')
      else process.stderr.write(`WARN • foreign_flow indisponível: ${payload.message}\n`)
    } catch (e) {
      process.stderr.write(`WARN • Falha ao gerar foreign_flow.json: ${String(e instanceof Error ? e.message : e)}\n`)
    }

    try {
      const payload = await buildFocusSummaryFromBcb(outDir)
      await writeJsonAndJs(outDir, 'focus_summary', 'FOCUS_SUMMARY_DATA', payload)
      if (payload.ok === true) process.stdout.write('OK • focus_summary.json\n')
      else process.stderr.write(`WARN • focus_summary indisponível: ${payload.message}\n`)
    } catch (e) {
      process.stderr.write(`WARN • Falha ao gerar focus_summary.json: ${String(e instanceof Error ? e.message : e)}\n`)
    }

    try {
      const jsonPath = path.join(outDir, 'market_quotes.json')
      const raw = await readFile(jsonPath, 'utf-8')
      const market = JSON.parse(raw)
      const payload = buildPetrobrasModule({
        market,
        webNews:
          webNewsPayload && typeof webNewsPayload === 'object' ? (webNewsPayload as WebNewsModule) : null,
      })
      await writeJsonAndJs(outDir, 'petrobras_module', 'PETROBRAS_MODULE_DATA', payload)
      process.stdout.write('OK • petrobras_module.json\n')
    } catch (e) {
      process.stderr.write(`WARN • Falha ao gerar petrobras_module.json: ${String(e instanceof Error ? e.message : e)}\n`)
    }

    await exportDashboardPdf()
    await exportDashboardPdfLite()
    await exportWdoWinDashboardsPdfLite()
    return
  }

  const csvPath = resolveFromProject((args.csv as string) || (await resolveDefaultCsvPath(PROJECT_ROOT)))

  await buildMarketHistory({
    csvPath,
    outDir,
    intervalMinutes,
    retentionDays,
    timestamp,
  })

  if (envBool('SINA_DCE_IO_ENABLED', true)) {
    try {
      const code = env('SINA_DCE_IO_CODE', 'nf_I0')
      const hqUrl = `https://hq.sinajs.cn/list=${encodeURIComponent(code)}`
      const hqRaw = await fetchTextWithTimeout(hqUrl, 4500, {
        'User-Agent': 'Mozilla/5.0',
        Referer: 'https://gu.sina.cn/ft/hq/nf.php?symbol=i0',
      })
      const parsed = parseSinaHqVar(hqRaw)
      if (!parsed) throw new Error('Sina HQ: parse falhou')
      await mergeSinaQuoteIntoMarketQuotes(outDir, {
        seriesKey: 'DCE_I0',
        asset: {
          symbol: 'DCE_I0',
          name: parsed.name ? `Minério de Ferro Dalian (Sina • ${parsed.name})` : 'Minério de Ferro Dalian (Sina • I0)',
          exchange: 'DCE',
          category: 'commodities',
          tags: ['china'],
        },
        price: parsed.price,
        change: parsed.change,
      })
      process.stdout.write(`OK • Dalian I0=${parsed.price} (Sina)\n`)
    } catch (e) {
      process.stderr.write(`WARN • Falha ao capturar Dalian I0 (Sina): ${String(e instanceof Error ? e.message : e)}\n`)
    }
  }

  try {
    const payload = await buildOptionsGammaSummary()
    await writeJsonAndJs(outDir, 'options_gamma_summary', 'OPTIONS_GAMMA_SUMMARY_DATA', payload)
    process.stdout.write('OK • options_gamma_summary.json\n')
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar options_gamma_summary.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const payload = await buildWebNewsModule()
    await writeJsonAndJs(outDir, 'web_news_module', 'WEB_NEWS_MODULE_DATA', payload)
    process.stdout.write('OK • web_news_module.json\n')
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar web_news_module.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const payload = await buildForeignFlowFromScrape(outDir)
    await writeJsonAndJs(outDir, 'foreign_flow', 'FOREIGN_FLOW_DATA', payload)
    if (payload.ok === true) process.stdout.write('OK • foreign_flow.json\n')
    else process.stderr.write(`WARN • foreign_flow indisponível: ${payload.message}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar foreign_flow.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const payload = await buildFocusSummaryFromBcb(outDir)
    await writeJsonAndJs(outDir, 'focus_summary', 'FOCUS_SUMMARY_DATA', payload)
    if (payload.ok === true) process.stdout.write('OK • focus_summary.json\n')
    else process.stderr.write(`WARN • focus_summary indisponível: ${payload.message}\n`)
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar focus_summary.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  try {
    const raw = await readFile(path.join(outDir, 'market_quotes.json'), 'utf-8')
    const market = JSON.parse(raw)
    const webNewsRaw = await readFile(path.join(outDir, 'web_news_module.json'), 'utf-8').catch(() => '')
    const webNews = webNewsRaw ? JSON.parse(webNewsRaw) : null
    const payload = buildPetrobrasModule({ market, webNews })
    await writeJsonAndJs(outDir, 'petrobras_module', 'PETROBRAS_MODULE_DATA', payload)
    process.stdout.write('OK • petrobras_module.json\n')
  } catch (e) {
    process.stderr.write(`WARN • Falha ao gerar petrobras_module.json: ${String(e instanceof Error ? e.message : e)}\n`)
  }

  await exportDashboardPdf()
  await exportDashboardPdfLite()
  await exportWdoWinDashboardsPdfLite()
}

main().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
