import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeFlowSentinel } from './lib/flow-sentinel.js'
import type { MarketPoint, MarketQuotes } from './types.ts'

type EconomicCalendarItem = {
  id: string
  time: string
  currency: string
  impact: 'ALTO' | 'MÉDIO' | 'BAIXO'
  event: string
  wdo?: string
  win?: string
}

type EconomicCalendarPayload = {
  meta?: { generatedAt?: string; attemptedAt?: string; status?: string }
  items?: EconomicCalendarItem[]
}

type OptionsSummary = {
  ok: boolean
  generatedAt?: string
  items?: {
    WDO?: {
      spot?: number | null
      regime?: string | null
      keyLevels?: {
        gammaFlip?: number | null
        callWall?: number | null
        putWall?: number | null
        effectiveCallWall?: number | null
        effectivePutWall?: number | null
      }
    }
    WIN?: {
      spot?: number | null
      regime?: string | null
      keyLevels?: {
        gammaFlip?: number | null
        callWall?: number | null
        putWall?: number | null
        effectiveCallWall?: number | null
        effectivePutWall?: number | null
      }
    }
  }
}

type WebNewsModulePayload = {
  ok: boolean
  generatedAt?: string
  summary?: {
    globalTop?: string[]
    brasilTop?: string[]
    commoditiesTop?: string[]
    sentiment?: string
    conflicts?: string[]
  }
}

export type TelegramCard = {
  key: 'macro_a' | 'macro_b' | 'panel' | 'deep_dive' | 'mercosul_fx'
  filename: string
  caption: string
  html: string
}

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf-8')
    const parsed = safeParseJson<T>(raw)
    return parsed
  } catch {
    return null
  }
}

async function readTextSafe(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

async function readTextPrefer(filePaths: string[]) {
  for (const filePath of filePaths) {
    const raw = await readTextSafe(filePath)
    if (raw) return raw
  }
  return null
}

function fmtBrtNow() {
  const d = new Date()
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (t: string) => parts.find(p => p.type === t)?.value || ''
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${get('hour')}:${get('minute')}`,
    iso: d.toISOString(),
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function fmtPct(v: number | null) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'n/d'
  const s = v >= 0 ? `+${round2(v)}` : String(round2(v))
  return `${s}%`
}

function arrowFromPct(v: number | null, neutralAbs = 0.08) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'n/d'
  if (v > neutralAbs) return '↑'
  if (v < -neutralAbs) return '↓'
  return '≈'
}

function getLatestPoint(series: MarketPoint[] | undefined | null) {
  if (!series || series.length === 0) return null
  return series[series.length - 1] || null
}

function trendPct(series: MarketPoint[] | undefined | null, pointsBack: number) {
  if (!series || series.length < 2) return null
  const last = series[series.length - 1]
  const idx = Math.max(0, series.length - 1 - Math.max(1, pointsBack))
  const prev = series[idx]
  if (!last || !prev) return null
  if (!Number.isFinite(last.price) || !Number.isFinite(prev.price) || prev.price === 0) return null
  return ((last.price - prev.price) / prev.price) * 100
}

function resolveSeriesKey(quotes: MarketQuotes, candidates: string[]) {
  const keys = quotes && quotes.series ? Object.keys(quotes.series) : []
  for (const c of candidates) {
    if (keys.includes(c)) return c
  }
  const lc = new Map(keys.map(k => [k.toLowerCase(), k]))
  for (const c of candidates) {
    const k = lc.get(c.toLowerCase())
    if (k) return k
  }
  return null
}

function resolveSeriesKeyByAssetMatchers(quotes: MarketQuotes, matchers: RegExp[]) {
  const assets = quotes && Array.isArray(quotes.assets) ? quotes.assets : []
  const keys = quotes && quotes.series ? Object.keys(quotes.series) : []
  const keySet = new Set(keys)
  const lc = new Map(keys.map(k => [k.toLowerCase(), k]))

  for (const m of matchers || []) {
    for (const a of assets) {
      const symbol = String(a && a.symbol ? a.symbol : '').trim()
      const name = String(a && a.name ? a.name : '').trim()
      if (!symbol) continue
      if (!m.test(symbol) && !m.test(name)) continue
      if (keySet.has(symbol)) return symbol
      const k = lc.get(symbol.toLowerCase())
      if (k) return k
    }
  }
  return null
}

type CalendarCountryKey = 'BR' | 'EUA' | 'CHINA/HK'

function pickCalendarDayByCountry(payload: EconomicCalendarPayload | null, perCountryLimit = 10) {
  const items = payload && Array.isArray(payload.items) ? payload.items : []
  const parseTime = (t: string) => {
    const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/)
    if (!m) return 9999
    return Number(m[1]) * 60 + Number(m[2])
  }
  const keyOf = (currency: string): CalendarCountryKey | null => {
    const c = String(currency || '').toUpperCase().trim()
    if (c === 'BRL') return 'BR'
    if (c === 'USD') return 'EUA'
    if (c === 'CNY' || c === 'CNH' || c === 'HKD') return 'CHINA/HK'
    return null
  }

  const groups: Record<CalendarCountryKey, EconomicCalendarItem[]> = { BR: [], EUA: [], 'CHINA/HK': [] }
  for (const it of items) {
    if (!it) continue
    if (it.impact === 'BAIXO') continue
    const k = keyOf(it.currency)
    if (!k) continue
    groups[k].push(it)
  }

  const sortAndLimit = (xs: EconomicCalendarItem[]) =>
    xs
      .slice()
      .sort((a, b) => parseTime(a.time) - parseTime(b.time))
      .slice(0, Math.max(1, Math.min(30, Math.floor(perCountryLimit))))

  return {
    BR: sortAndLimit(groups.BR),
    EUA: sortAndLimit(groups.EUA),
    'CHINA/HK': sortAndLimit(groups['CHINA/HK']),
  }
}

function calendarSummaryLine(groups: Record<CalendarCountryKey, EconomicCalendarItem[]>, perCountry = 2) {
  const cut = (xs: EconomicCalendarItem[]) => xs.slice(0, Math.max(0, Math.min(6, Math.floor(perCountry))))
  const fmt = (k: CalendarCountryKey) =>
    `${k}: ${cut(groups[k]).map(x => `${x.time}`).join(' • ') || 'n/d'}`
  return `${fmt('BR')} | ${fmt('EUA')} | ${fmt('CHINA/HK')}`
}

async function fetchJson<T>(url: string, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const r = await fetch(url, { signal: controller.signal })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

function htmlShell(title: string, subtitle: string, body: string, wrapWidth = 1080) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root{--bg:#0b0f14;--card:#0f1722;--muted:#9fb0c2;--text:#e9f1fb;--line:#223043;--accent:#53b1fd;--good:#22c55e;--bad:#ef4444;--mid:#eab308;}
    html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:Segoe UI, Roboto, Arial, sans-serif;}
    .wrap{width:${Math.max(900, Math.min(2000, Math.floor(wrapWidth)))}px;margin:0 auto;padding:32px;}
    .card{background:linear-gradient(180deg, rgba(83,177,253,.08), rgba(83,177,253,0)) , var(--card);border:1px solid var(--line);border-radius:18px;padding:26px 26px 22px;}
    .top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px;}
    .title{font-size:34px;font-weight:800;letter-spacing:.4px;line-height:1.1;}
    .subtitle{margin-top:6px;font-size:18px;color:var(--muted);}
    .stamp{font-size:14px;color:var(--muted);text-align:right;white-space:nowrap;}
    .grid{display:grid;grid-template-columns:1fr;gap:14px;}
    .box{border:1px solid var(--line);border-radius:14px;padding:14px 14px 12px;background:rgba(255,255,255,.02);}
    .h{font-size:16px;font-weight:800;letter-spacing:.25px;margin:0 0 10px 0;color:#d7e6f7;}
    table{width:100%;border-collapse:collapse;font-size:15px;}
    td{padding:7px 0;border-top:1px solid rgba(34,48,67,.55);vertical-align:top;}
    tr:first-child td{border-top:none;}
    .k{color:var(--muted);width:44%;}
    .v{font-weight:700;}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.02);font-size:13px;color:var(--muted);}
    .pillGood{border-color:rgba(34,197,94,.35);color:var(--good);background:rgba(34,197,94,.08);}
    .pillBad{border-color:rgba(239,68,68,.35);color:var(--bad);background:rgba(239,68,68,.08);}
    .pillMid{border-color:rgba(234,179,8,.35);color:var(--mid);background:rgba(234,179,8,.08);}
    .arrowUp{color:var(--good);font-weight:900;}
    .arrowDown{color:var(--bad);font-weight:900;}
    .arrowEq{color:var(--mid);font-weight:900;}
    .muted{color:var(--muted);}
    .small{font-size:13px;}
    .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .list{margin:0;padding:0 0 0 16px;}
    .list li{margin:6px 0;}
    .mgrid{display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;margin:2px 0 12px 0;}
    .mcard{border:1px solid rgba(34,48,67,.8);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);min-height:92px;display:flex;flex-direction:column;gap:6px;}
    .micon{font-size:16px;opacity:.9;line-height:1;}
    .mval{font-size:24px;font-weight:900;letter-spacing:.4px;line-height:1.1;}
    .mlabel{font-size:12px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;}
    .mchg{font-size:13px;color:var(--muted);line-height:1.2;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="top">
        <div>
          <div class="title">${escapeHtml(title)}</div>
          <div class="subtitle">${escapeHtml(subtitle)}</div>
        </div>
        <div class="stamp">${escapeHtml(new Date().toISOString())}</div>
      </div>
      ${body}
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function arrowClass(a: string) {
  if (a === '↑') return 'arrowUp'
  if (a === '↓') return 'arrowDown'
  if (a === '≈') return 'arrowEq'
  return 'muted'
}

function lineRow(k: string, valueHtml: string) {
  return `<tr><td class="k">${escapeHtml(k)}</td><td class="v">${valueHtml}</td></tr>`
}

function valueArrow(a: string, pct: string) {
  return `<span class="${arrowClass(a)}">${escapeHtml(a)}</span> <span class="muted">${escapeHtml(pct)}</span>`
}

function top3FromSummary(xs: string[] | undefined | null) {
  const arr = Array.isArray(xs) ? xs.filter(Boolean) : []
  return arr.slice(0, 3)
}

function stripMd(s: string) {
  return String(s || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractNumberedLines(raw: string | null, start: RegExp, maxItems: number) {
  if (!raw) return []
  const lines = raw.split(/\r?\n/g)
  const startIdx = lines.findIndex(l => start.test(l))
  if (startIdx < 0) return []
  const out: string[] = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (out.length) break
      continue
    }
    if (/^#{1,6}\s+/.test(line)) break
    const m = line.match(/^\d+\.\s*(.+)$/)
    if (!m) continue
    out.push(stripMd(m[1]))
    if (out.length >= maxItems) break
  }
  return out
}

function extractTableConflitos(raw: string | null, maxItems: number) {
  if (!raw) return []
  const lines = raw.split(/\r?\n/g)
  const startIdx = lines.findIndex(l => /^#{1,6}\s*MATRIZ DE REA(?:CAO|ÇÃO)\s+CRUZADA\b/i.test(l.trim()))
  if (startIdx < 0) return []
  const out: string[] = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (out.length) break
      continue
    }
    if (/^#{1,6}\s+/.test(line)) {
      if (out.length) break
      continue
    }
    if (!line.startsWith('|')) continue
    const cols = line
      .split('|')
      .map(x => x.trim())
      .filter(Boolean)
    if (cols.length < 3) continue
    if (/^Cenário$/i.test(cols[0])) continue
    if (/^-{2,}$/.test(cols[0])) continue
    out.push(stripMd(`${cols[0]} → ${cols[2]}`))
    if (out.length >= maxItems) break
  }
  return out
}

function extractEtToBrtHint(raw: string | null) {
  if (!raw) return ''
  const lines = raw.split(/\r?\n/g).map(x => x.trim())
  const idx = lines.findIndex(l => /^##\s*(Conversão de horários:|CONVERSAO ET->BRT\b)/i.test(l))
  if (idx < 0) return ''
  const wanted = new Set(['8h30', '10h00', '14h00'])
  const picks: Array<{ et: string; brtSummer: string; brtWinter: string }> = []
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    if (/^#{1,6}\s+/.test(line) && i > idx + 1) break
    if (!line.startsWith('|')) continue
    const cols = line
      .split('|')
      .map(x => x.trim())
      .filter(Boolean)
    if (cols.length < 3) continue
    if (!wanted.has(cols[0])) continue
    picks.push({ et: cols[0], brtSummer: cols[1], brtWinter: cols[2] })
  }
  if (!picks.length) return ''
  return `ET→BRT: ${picks.map(p => `${p.et}→${p.brtSummer}/${p.brtWinter}`).join(' • ')}`
}

function extractChinaKeyIndicators(raw: string | null, maxItems: number) {
  if (!raw) return []
  const lines = raw.split(/\r?\n/g)
  const idx = lines.findIndex(l => /##\s*1\.\s*INDICADORES DE ATIVIDADE ECONÔMICA E PIB/i.test(l))
  if (idx < 0) return []
  const start = lines.findIndex((l, i) => i > idx && /###\s*Alta Relevância/i.test(l))
  if (start < 0) return []
  const out: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    if (/^#{1,6}\s+/.test(line)) break
    if (!line.startsWith('|')) continue
    const cols = line
      .split('|')
      .map(x => x.trim())
      .filter(Boolean)
    if (!cols.length) continue
    if (/^\*\*GDP/.test(cols[0]) || /\*\*/.test(cols[0])) {
      out.push(stripMd(cols[0]))
    } else if (cols[0] && !/^Indicador/i.test(cols[0])) {
      out.push(stripMd(cols[0]))
    }
    if (out.length >= maxItems) break
  }
  return out
}

function safeTextLine(s: string | null | undefined) {
  const v = String(s || '').trim()
  return v ? v : 'n/d'
}

function computeEmPulse(quotes: MarketQuotes) {
  const basket = [
    { w: 0.35, key: resolveSeriesKey(quotes, ['USD/MXN - US Dollar Mexican Peso', 'USD/MXN', 'USDMXN']) },
    { w: 0.35, key: resolveSeriesKey(quotes, ['USD/ZAR - US Dollar South African Rand', 'USD/ZAR', 'USDZAR']) },
    { w: 0.15, key: resolveSeriesKey(quotes, ['USD/CLP - US Dollar Chilean Peso', 'USD/CLP', 'USDCLP']) },
    { w: 0.15, key: resolveSeriesKey(quotes, ['USD/TRY - US Dollar Turkish Lira', 'USD/TRY', 'USDTRY']) },
  ].filter(x => !!x.key) as Array<{ w: number; key: string }>

  if (!basket.length) return { state: 'n/d', score: null }

  const lastPct = (key: string) => {
    const pt = getLatestPoint(quotes.series[key])
    const v = pt && typeof pt.changePct === 'number' ? pt.changePct : null
    return v
  }

  let sumW = 0
  let sum = 0
  for (const it of basket) {
    const v = lastPct(it.key)
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    sumW += it.w
    sum += it.w * v
  }
  if (sumW <= 0) return { state: 'n/d', score: null }

  const score = sum / sumW
  const neutral = 0.12
  const state = score > neutral ? 'pressão EM' : score < -neutral ? 'fluxo EM favorável' : 'EM misto'
  return { state, score }
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..')

export async function buildOperationalTelegramCards(params: {
  baseUrl: string
  sourceDataDir: string
  sessionLabel?: string
}) {
  const now = fmtBrtNow()
  const sessionLabel = String(params.sessionLabel || 'Pré-mercado').trim() || 'Pré-mercado'

  const ideasDir = path.resolve(PROJECT_ROOT, 'Ideias')
  const [ideasBr, ideasUs, ideasCn] = await Promise.all([
    readTextPrefer([path.join(ideasDir, 'Relatorios Brasil (padrao).txt'), path.join(ideasDir, 'Relatorios Brasil.txt')]),
    readTextPrefer([path.join(ideasDir, 'Relatorios USA (padrao).txt'), path.join(ideasDir, 'Relatorios USA.txt')]),
    readTextPrefer([path.join(ideasDir, 'Relatorios CNY (padrao).txt'), path.join(ideasDir, 'Relatorios CNY,txt')]),
  ])

  const brAgendaPadrao = extractNumberedLines(ideasBr, /^##\s*AGENDA \(ALTA FREQUÊNCIA\)/i, 5)
  const brAgenda = brAgendaPadrao.length ? brAgendaPadrao : extractNumberedLines(ideasBr, /^###\s*Resumo dos mais/i, 5)
  const usEtBrt = extractEtToBrtHint(ideasUs)
  const usMatrix = extractTableConflitos(ideasUs, 4)
  const cnKeyPadrao = extractNumberedLines(ideasCn, /^##\s*GATILHOS-CHAVE\b/i, 8)
  const cnKey = cnKeyPadrao.length ? cnKeyPadrao : extractChinaKeyIndicators(ideasCn, 6)

  const ideasSupplementHtml =
    brAgenda.length || usEtBrt || usMatrix.length || cnKey.length
      ? `<div class="grid">
          <div class="box">
            <div class="h">SE–ENTÃO — referências (não é agenda do dia)</div>
            <div class="cols">
              <div class="box">
                <div class="h" style="margin:0 0 8px 0;">Brasil (alta frequência)</div>
                <ul class="list small">${brAgenda.length ? brAgenda.map(x => `<li><span class="muted">${escapeHtml(x)}</span></li>`).join('') : '<li><span class="muted">n/d</span></li>'}</ul>
              </div>
              <div class="box">
                <div class="h" style="margin:0 0 8px 0;">EUA (macro)</div>
                <div class="small muted" style="margin-bottom:8px;">${escapeHtml(usEtBrt || 'ET→BRT n/d')}</div>
                <ul class="list small">${usMatrix.length ? usMatrix.map(x => `<li><span class="muted">${escapeHtml(x)}</span></li>`).join('') : '<li><span class="muted">Matriz n/d</span></li>'}</ul>
              </div>
            </div>
          </div>
          <div class="box">
            <div class="h">China/HK (principais gatilhos)</div>
            <ul class="list small">${cnKey.length ? cnKey.map(x => `<li><span class="muted">${escapeHtml(x)}</span></li>`).join('') : '<li><span class="muted">n/d</span></li>'}</ul>
          </div>
        </div>`
      : ''

  const quotesPath = path.join(params.sourceDataDir, 'market_quotes.json')
  const calendarPath = path.join(params.sourceDataDir, 'economic_calendar.json')

  const quotes = await readJsonSafe<MarketQuotes>(quotesPath)
  const calendar = await readJsonSafe<EconomicCalendarPayload>(calendarPath)

  const web = await fetchJson<WebNewsModulePayload>(`${params.baseUrl}/api/news/web/module?limit=40`, 7500)
  const options = await fetchJson<OptionsSummary>(`${params.baseUrl}/api/options/summary`, 6500)

  const sym = (cs: string[]) => (quotes ? resolveSeriesKey(quotes, cs) : null)
  const symRx = (matchers: RegExp[]) =>
    quotes ? resolveSeriesKeyByAssetMatchers(quotes, matchers) : null
  const qSeries = (cs: string[]) => (quotes && sym(cs) ? quotes.series[sym(cs)!] : null)

  const winKey = sym(['WINc1', 'WIN', 'IBOV', '.BVSP'])
  const wdoKey = sym(['WDOc1', 'WDO', 'USD/BRL', 'USD/BRL - US Dollar Brazil Real'])

  const winSeries = winKey && quotes ? quotes.series[winKey] : null
  const wdoSeries = wdoKey && quotes ? quotes.series[wdoKey] : null

  const win30_90 = trendPct(winSeries, 6)
  const winDay = trendPct(winSeries, 32)
  const wdo30_90 = trendPct(wdoSeries, 6)
  const wdoDay = trendPct(wdoSeries, 32)

  const sentiment = safeTextLine(web && web.ok && web.summary ? web.summary.sentiment : null)
  const conflicts = web && web.ok && web.summary && Array.isArray(web.summary.conflicts) ? web.summary.conflicts : []

  const driversGlobal = top3FromSummary(web && web.ok && web.summary ? web.summary.globalTop : [])
  const driversBr = top3FromSummary(web && web.ok && web.summary ? web.summary.brasilTop : [])
  const driversCom = top3FromSummary(web && web.ok && web.summary ? web.summary.commoditiesTop : [])

  const agendaDay = pickCalendarDayByCountry(calendar, 10)
  const agendaLine = calendarSummaryLine(agendaDay, 3)
  const agendaTodaySupplementHtml = (() => {
    const itemLi = (x: EconomicCalendarItem) => {
      const title = `<span class="pill">${escapeHtml(x.time)} • ${escapeHtml(x.impact)} • ${escapeHtml(x.currency)}</span> <span class="muted">${escapeHtml(x.event)}</span>`
      const wdo = `<div class="small muted" style="margin-top:4px;">WDO: ${escapeHtml(x.wdo || '—')}</div>`
      const win = `<div class="small muted">WIN: ${escapeHtml(x.win || '—')}</div>`
      return `<li>${title}${wdo}${win}</li>`
    }
    const list = (xs: EconomicCalendarItem[]) =>
      `<ul class="list small">${xs.length ? xs.map(itemLi).join('') : '<li><span class="muted">n/d</span></li>'}</ul>`
    return `<div class="grid">
      <div class="box">
        <div class="h">CALENDÁRIO ECONÔMICO (Investing • hoje)</div>
        <div class="cols">
          <div class="box">
            <div class="h" style="margin:0 0 8px 0;">Brasil (BRL)</div>
            ${list(agendaDay.BR)}
          </div>
          <div class="box">
            <div class="h" style="margin:0 0 8px 0;">EUA (USD)</div>
            ${list(agendaDay.EUA)}
          </div>
        </div>
      </div>
      <div class="box">
        <div class="h">China/HK (CNY/CNH)</div>
        ${list(agendaDay['CHINA/HK'])}
      </div>
    </div>`
  })()

  const pull = (cs: string[]) => {
    const series = qSeries(cs)
    const pt = series ? getLatestPoint(series) : null
    const pct = pt && typeof pt.changePct === 'number' ? pt.changePct : null
    const a = arrowFromPct(pct)
    return { a, pct: fmtPct(pct) }
  }

  const pullKey = (key: string | null) => (key ? pull([key]) : { a: 'n/d', pct: 'n/d' })

  const lastOf = (cs: string[]) => {
    const series = qSeries(cs)
    const pt = series ? getLatestPoint(series) : null
    const price = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null
    const pct =
      pt && typeof pt.changePct === 'number' && Number.isFinite(pt.changePct)
        ? pt.changePct
        : series
          ? trendPct(series, 1)
          : null
    const a = arrowFromPct(pct)
    return { price, pct, a }
  }

  const diShort = pull(['DI1F27', 'DI1N27', 'DI1F26', 'DI1F25', 'DDIc5', 'DDIc6'])
  const diLong = pull(['DI1F35', 'DI1F33', 'DI1F32', 'DI1F31', 'DDIc6'])
  const diShape =
    diShort.a !== 'n/d' && diLong.a !== 'n/d'
      ? diShort.a === '↑' && diLong.a === '↓'
        ? 'FLATTEN'
        : diShort.a === '↓' && diLong.a === '↑'
          ? 'STEEPEN'
          : '≈'
      : 'n/d'

  const brRisk = pull(['BRGV5YUSAC=R'])
  const vxewz = pull(['.VXEWZ'])

  const oWdo = options && options.ok && options.items ? options.items.WDO : null
  const oWin = options && options.ok && options.items ? options.items.WIN : null

  const emPulse = quotes ? computeEmPulse(quotes) : { state: 'n/d', score: null }
  const emNeutral = 0.12
  const emMode =
    typeof emPulse.score === 'number' && Number.isFinite(emPulse.score)
      ? emPulse.score > emNeutral
        ? 'risk_off'
        : emPulse.score < -emNeutral
          ? 'risk_on'
          : 'mixed'
      : 'n/d'
  const emScore = fmtPct(typeof emPulse.score === 'number' && Number.isFinite(emPulse.score) ? emPulse.score : null)
  const emPillClass = emMode === 'risk_on' ? 'pillGood' : emMode === 'risk_off' ? 'pillBad' : emMode === 'mixed' ? 'pillMid' : ''
  const emPillLabel = emMode === 'risk_on' ? 'RISK-ON' : emMode === 'risk_off' ? 'RISK-OFF' : emMode === 'mixed' ? 'MISTO' : 'n/d'
  const emPill = `<span class="pill ${escapeHtml(emPillClass)}">${escapeHtml(emPillLabel)}</span>`
  const emThresholdLabel = `limiar ±${emNeutral}%`

  const mercosulComponents = (() => {
    const pick = (label: string, matcher: RegExp, invertForScore: boolean) => {
      const key = symRx([matcher])
      const pt = key && quotes ? getLatestPoint(quotes.series[key]) : null
      const pct = pt && typeof pt.changePct === 'number' && Number.isFinite(pt.changePct) ? pt.changePct : null
      const a = arrowFromPct(pct)
      const score = typeof pct === 'number' && Number.isFinite(pct) ? (invertForScore ? -pct : pct) : null
      return { label, key, pct, a, score }
    }
    return [
      pick('USD/BRL (BR)', /^USD\/BRL\b/i, true),
      pick('USD/UYU (UY)', /^USD\/UYU\b/i, true),
      pick('USD/PYG (PY)', /^USD\/PYG\b/i, true),
      pick('USD/ARS (AR)', /^USD\/ARS\b/i, true),
      pick('Ibovespa', /(^\.BVSP$|\bIbovespa\b)/i, false),
      pick('EWZ', /^EWZ\b/i, false),
    ]
  })()
  const mercosulPulse = (() => {
    const avg = (xs: Array<number | null>) => {
      const ns = xs.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
      if (!ns.length) return null
      return ns.reduce((a, b) => a + b, 0) / ns.length
    }
    const fxStrength = avg(mercosulComponents.slice(0, 4).map(x => x.score))
    const eqStrength = avg(mercosulComponents.slice(4).map(x => x.score))
    const hasFx = typeof fxStrength === 'number' && Number.isFinite(fxStrength)
    const hasEq = typeof eqStrength === 'number' && Number.isFinite(eqStrength)
    const score = hasFx && hasEq ? 0.7 * fxStrength + 0.3 * eqStrength : hasFx ? fxStrength : hasEq ? eqStrength : null
    let state = '—'
    if (typeof score === 'number' && Number.isFinite(score)) {
      if (score > 0.25) state = 'Entrada (LatAm/BR forte)'
      else if (score < -0.25) state = 'Saída (USD/Stress LatAm)'
      else state = 'Misto / neutro'
    }
    const mode: 'good' | 'bad' | 'mid' = typeof score === 'number' && Number.isFinite(score) ? (score > 0.25 ? 'good' : score < -0.25 ? 'bad' : 'mid') : 'mid'
    return { fxStrength, eqStrength, score, state, mode }
  })()

  const fmtLevel = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : 'n/d')
  const minutesSinceIso = (iso: string | undefined) => {
    if (!iso) return null
    const t = Date.parse(iso)
    if (!Number.isFinite(t)) return null
    return Math.max(0, Math.round((Date.now() - t) / 60000))
  }
  const fmtAge = (m: number | null) => (typeof m === 'number' && Number.isFinite(m) ? `${m}m` : 'n/d')

  const quotesAge = fmtAge(quotes && quotes.meta ? minutesSinceIso(quotes.meta.generatedAt) : null)
  const optionsAge = fmtAge(options ? minutesSinceIso(options.generatedAt) : null)
  const webAge = fmtAge(web ? minutesSinceIso(web.generatedAt) : null)
  const coverage = quotes && quotes.meta ? quotes.meta.coverage : undefined
  const missingCritical = coverage && Array.isArray(coverage.missingCritical) ? coverage.missingCritical : []
  const missingCriticalLabel = missingCritical.length
    ? `${missingCritical.slice(0, 3).join(', ')}${missingCritical.length > 3 ? '…' : ''}`
    : '—'
  const vixKey = sym(['VIX', '.VIX', '.VIX9D']) || symRx([/\bVIX\b/i, /\bVolatility\b/i, /\bVolatilidade\b/i])
  const vixMove = pullKey(vixKey)
  const vixA = vixMove.a

  const dxyKey = sym(['.DXY', 'DXY', 'DX']) || symRx([/\bIndi[cç]e D[oó]lar\b/i, /\bUS Dollar Index\b/i])
  const dxyMove = pullKey(dxyKey)
  const dxyA = dxyMove.a
  const us10yKey =
    sym(['US10YT=RR', 'TNc2=']) ||
    symRx([/\bUnited States 10-Year\b/i, /\bEUA\b\s+a\s+10\s+anos\b/i, /\bEstados Unidos\b.*\b10\b.*anos\b/i])
  const us10y = pullKey(us10yKey)
  const us10yA = us10y.a
  const chinaA50Key = sym(['CHINA50']) || symRx([/\bChina A50\b/i])
  const chinaA50 = pullKey(chinaA50Key)
  const chinaA50A = chinaA50.a

  const oreKey = sym(['TIOc1', 'SM58Fc1']) || symRx([/\bmin[eé]rio\b/i, /\biron ore\b/i])
  const ore = pullKey(oreKey)
  const oreA = ore.a

  const dalianOreKey = sym(['DCE_I0'])
  const dalianOre = pullKey(dalianOreKey)
  const dalianOreA = dalianOre.a

  const brentKey = sym(['LCO', 'BRN']) || symRx([/\bbrent\b/i])
  const brent = pullKey(brentKey)
  const brentA = brent.a

  const copperKey = sym(['HG']) || symRx([/\bcobre\b/i, /\bcopper\b/i])
  const copper = pullKey(copperKey)
  const copperA = copper.a

  const sojaKey = sym(['ZS']) || symRx([/\bsoja\b/i, /\bsoy\b/i])
  const soja = pullKey(sojaKey)
  const sojaA = soja.a
  const brlA = arrowFromPct(wdo30_90)
  const winA = arrowFromPct(win30_90)

  const buildFallbackDrivers = () => {
    const global: string[] = []
    const brasil: string[] = []
    const commodities: string[] = []

    if (dxyA === '↑') global.push('USD forte (DXY↑)')
    else if (dxyA === '↓') global.push('USD fraco (DXY↓)')

    if (us10yA === '↑') global.push('Yields↑ (US10Y)')
    else if (us10yA === '↓') global.push('Yields↓ (US10Y)')

    if (vixA === '↑') global.push('Vol↑ (VIX)')
    else if (vixA === '↓') global.push('Vol↓ (VIX)')

    if (chinaA50A === '↑') global.push('China forte (A50↑)')
    else if (chinaA50A === '↓') global.push('China fraca (A50↓)')

    if (brlA === '↑') brasil.push('Real fraco (USD/BRL↑)')
    else if (brlA === '↓') brasil.push('Real forte (USD/BRL↓)')

    if (winA === '↑') brasil.push('Bolsa↑ (WIN)')
    else if (winA === '↓') brasil.push('Bolsa↓ (WIN)')

    if (diShape !== 'n/d') brasil.push(`Curva DI: ${diShape}`)
    if (brRisk.a === '↑') brasil.push('CDS BR↑')
    else if (brRisk.a === '↓') brasil.push('CDS BR↓')

    if (oreA !== 'n/d') commodities.push(`Minério ${oreA}`)
    if (brentA !== 'n/d') commodities.push(`Brent ${brentA}`)
    if (copperA !== 'n/d') commodities.push(`Cobre ${copperA}`)
    if (sojaA !== 'n/d') commodities.push(`Soja ${sojaA}`)

    return {
      global: global.length ? global.slice(0, 3) : ['—'],
      brasil: brasil.length ? brasil.slice(0, 3) : ['—'],
      commodities: commodities.length ? commodities.slice(0, 3) : ['—'],
    }
  }

  const fallbackDrivers = buildFallbackDrivers()
  const thesisDriversGlobal = driversGlobal.length ? driversGlobal : fallbackDrivers.global
  const thesisDriversBr = driversBr.length ? driversBr : fallbackDrivers.brasil
  const thesisDriversCom = driversCom.length ? driversCom : fallbackDrivers.commodities
  const miniArrow = (label: string, a: string) =>
    `<span class="muted">${escapeHtml(label)}</span><span class="${escapeHtml(arrowClass(a))}" style="margin-left:4px;">${escapeHtml(a)}</span>`
  const intelPill = (mode: 'good' | 'bad' | 'mid', label: string) => {
    const cls = mode === 'good' ? 'pillGood' : mode === 'bad' ? 'pillBad' : 'pillMid'
    return `<span class="pill ${escapeHtml(cls)}">${escapeHtml(label)}</span>`
  }
  const modeFromCounts = (onCount: number, offCount: number, required: number) => {
    if (onCount >= required) return 'risk_on'
    if (offCount >= required) return 'risk_off'
    return 'mixed'
  }
  const pillFromRiskMode = (mode: 'risk_on' | 'risk_off' | 'mixed' | 'n/d') => {
    if (mode === 'risk_on') return intelPill('good', 'RISK-ON')
    if (mode === 'risk_off') return intelPill('bad', 'RISK-OFF')
    if (mode === 'mixed') return intelPill('mid', 'MISTO')
    return `<span class="muted">n/d</span>`
  }

  const miniMove = (label: string, a: string, pct: string) =>
    `${miniArrow(label, a)} <span class="muted">${escapeHtml(pct)}</span>`

  const riskRadarRequired = 3
  const cdsA = brRisk.a
  const riskRadarParts = [
    { label: 'VIX', a: vixA },
    { label: 'DXY', a: dxyA },
    { label: 'US10Y', a: us10yA },
    { label: 'CDS', a: cdsA },
  ]
  const riskRadarOff = riskRadarParts.filter(x => x.a === '↑').length
  const riskRadarOn = riskRadarParts.filter(x => x.a === '↓').length
  const riskRadarMode = modeFromCounts(riskRadarOn, riskRadarOff, riskRadarRequired)
  const riskRadarDetails = riskRadarParts.map(x => miniArrow(x.label, x.a)).join(' <span class="muted">•</span> ')
  const riskRadar = `${pillFromRiskMode(riskRadarMode)} <span class="muted">${escapeHtml(`${riskRadarOff}/${riskRadarParts.length} OFF • ${riskRadarOn}/${riskRadarParts.length} ON • ≥${riskRadarRequired}/${riskRadarParts.length}`)}</span> <span class="muted">•</span> ${riskRadarDetails}`

  const audusd = lastOf(['AUD/USD - Australian Dollar US Dollar', 'AUD/USD', 'AUDUSD'])
  const nzdusd = lastOf(['NZD/USD - New Zealand Dollar US Dollar', 'NZD/USD', 'NZDUSD'])
  const usdjpy = lastOf(['USD/JPY - US Dollar Japanese Yen', 'USD/JPY', 'USDJPY'])
  const usdchf = lastOf(['USD/CHF - US Dollar Swiss Franc', 'USD/CHF', 'USDCHF'])
  const usdsek = lastOf(['USD/SEK - US Dollar Swedish Krona', 'USD/SEK', 'USDSEK'])
  const usdcad = lastOf(['USD/CAD - US Dollar Canadian Dollar', 'USD/CAD', 'USDCAD'])
  const usdrub = lastOf(['USD/RUB - US Dollar Russian Ruble', 'USD/RUB', 'USDRUB'])
  const usdbrl = lastOf(['USD/BRL - US Dollar Brazil Real', 'USD/BRL', 'USDBRL', 'WDOc1', 'WDO'])
  const dxy = lastOf(['.DXY', 'DXY'])

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
  const norm = (v: number, unit: number) => (Number.isFinite(v) && Number.isFinite(unit) && unit > 0 ? clamp(v / unit, -2, 2) : 0)

  const audjpyPct =
    typeof audusd.pct === 'number' && typeof usdjpy.pct === 'number'
      ? clamp(((1 + audusd.pct / 100) * (1 + usdjpy.pct / 100) - 1) * 100, -99, 99)
      : null

  let carryStatus = 'Neutro'
  if (typeof audusd.pct !== 'number' || typeof usdjpy.pct !== 'number') {
    carryStatus = 'Dados insuficientes'
  } else if (typeof audjpyPct === 'number') {
    const severe = usdjpy.pct <= -0.8 && audusd.pct <= -0.6
    if (audjpyPct <= -1.0 && severe) carryStatus = 'Unwinding (severo)'
    else if (audjpyPct <= -1.0) carryStatus = 'Unwinding'
    else if (audjpyPct >= 1.0) carryStatus = 'Building'
  }
  const carryMode =
    carryStatus.startsWith('Building') ? ('risk_on' as const) : carryStatus.startsWith('Unwinding') ? ('risk_off' as const) : ('mixed' as const)
  const carryScoreRaw =
    5 +
    1.8 * norm(audjpyPct || 0, 1.0) +
    1.0 * norm(-(dxy.pct || 0), 0.7) +
    1.2 * norm(-(usdbrl.pct || 0), 0.7)
  const carryScore10 = clamp(Math.round(carryScoreRaw), 0, 10)
  const carryLine =
    `${pillFromRiskMode(carryMode)} <span class="muted">${escapeHtml(`score ${carryScore10}/10 • ${carryStatus}`)}</span>`

  const betaRiskParts = [
    { vote: audusd.a === '↑' ? 'on' : audusd.a === '↓' ? 'off' : 'n/d', show: miniArrow('AUD/USD', audusd.a) },
    { vote: nzdusd.a === '↑' ? 'on' : nzdusd.a === '↓' ? 'off' : 'n/d', show: miniArrow('NZD/USD', nzdusd.a) },
    { vote: usdcad.a === '↓' ? 'on' : usdcad.a === '↑' ? 'off' : 'n/d', show: miniArrow('USD/CAD', usdcad.a) },
    { vote: usdrub.a === '↓' ? 'on' : usdrub.a === '↑' ? 'off' : 'n/d', show: miniArrow('USD/RUB', usdrub.a) },
  ]
  const betaSafeParts = [
    { vote: usdjpy.a === '↓' ? 'off' : usdjpy.a === '↑' ? 'on' : 'n/d', show: miniArrow('USD/JPY', usdjpy.a) },
    { vote: usdchf.a === '↓' ? 'off' : usdchf.a === '↑' ? 'on' : 'n/d', show: miniArrow('USD/CHF', usdchf.a) },
    { vote: usdsek.a === '↓' ? 'off' : usdsek.a === '↑' ? 'on' : 'n/d', show: miniArrow('USD/SEK', usdsek.a) },
    { vote: dxy.a === '↑' ? 'off' : dxy.a === '↓' ? 'on' : 'n/d', show: miniArrow('DXY', dxy.a) },
  ]
  const betaRiskOn = betaRiskParts.filter(x => x.vote === 'on').length
  const betaSafeOff = betaSafeParts.filter(x => x.vote === 'off').length
  const betaRequired = 3
  const betaMode =
    betaRiskOn >= betaRequired && betaSafeOff <= 1
      ? ('risk_on' as const)
      : betaSafeOff >= betaRequired && betaRiskOn <= 1
        ? ('risk_off' as const)
        : ('mixed' as const)
  const betaLine =
    `${pillFromRiskMode(betaMode)} <span class="muted">${escapeHtml(`A ${betaRiskOn}/${betaRiskParts.length} (≥${betaRequired}) • B ${betaSafeOff}/${betaSafeParts.length} (≥${betaRequired})`)}</span>`

  const chinaBrMode =
    chinaA50A === 'n/d' || oreA === 'n/d' ? ('n/d' as const) : chinaA50A === '↓' && oreA === '↓' ? 'risk_off' : chinaA50A === '↑' && oreA === '↑' ? 'risk_on' : 'mixed'
  const chinaBrLabel = chinaBrMode === 'risk_off' ? 'PRESSÃO BR' : chinaBrMode === 'risk_on' ? 'SUPORTE BR' : chinaBrMode === 'mixed' ? 'MISTO' : 'n/d'
  const chinaBrIntel =
    chinaBrMode === 'n/d'
      ? `<span class="muted">n/d</span>`
      : `${intelPill(chinaBrMode === 'risk_on' ? 'good' : chinaBrMode === 'risk_off' ? 'bad' : 'mid', chinaBrLabel)} <span class="muted">•</span> ${miniArrow('A50', chinaA50A)} <span class="muted">•</span> ${miniArrow('Minério', oreA)}`

  const brComRequired = 2
  const brComParts = [
    { label: 'Minério', a: oreA },
    { label: 'Brent', a: brentA },
    { label: 'Cobre', a: copperA },
    { label: 'Soja', a: sojaA },
  ].filter(x => x.a !== 'n/d')
  const brComDown = brComParts.filter(x => x.a === '↓').length
  const brComUp = brComParts.filter(x => x.a === '↑').length
  const brCommoditiesMode =
    !brComParts.length ? ('n/d' as const) : modeFromCounts(brComUp, brComDown, brComRequired)
  const brComLabel = brCommoditiesMode === 'risk_off' ? 'PRESSÃO BR' : brCommoditiesMode === 'risk_on' ? 'SUPORTE BR' : brCommoditiesMode === 'mixed' ? 'MISTO' : 'n/d'
  const brCommoditiesIntel =
    brCommoditiesMode === 'n/d'
      ? `<span class="muted">n/d</span>`
      : `${intelPill(brCommoditiesMode === 'risk_on' ? 'good' : brCommoditiesMode === 'risk_off' ? 'bad' : 'mid', brComLabel)} <span class="muted">•</span> <span class="muted">${escapeHtml(`${brComDown}/${brComParts.length} ↓ • ${brComUp}/${brComParts.length} ↑ • ≥${brComRequired}/${brComParts.length}`)}</span> <span class="muted">•</span> ${brComParts.map(x => miniArrow(x.label, x.a)).join(' <span class="muted">•</span> ')}`

  const macroSignals = [
    { k: 'FX', mode: emMode },
    { k: 'Radar', mode: riskRadarMode },
    { k: 'China', mode: chinaBrMode },
    { k: 'Commod', mode: brCommoditiesMode },
  ].filter(x => x.mode !== 'n/d') as Array<{ k: string; mode: 'risk_on' | 'risk_off' | 'mixed' }>
  const macroOn = macroSignals.filter(x => x.mode === 'risk_on').length
  const macroOff = macroSignals.filter(x => x.mode === 'risk_off').length
  const macroRiskMode =
    !macroSignals.length ? ('n/d' as const) : macroOn >= 2 && macroOn >= macroOff + 1 ? 'risk_on' : macroOff >= 2 && macroOff >= macroOn + 1 ? 'risk_off' : 'mixed'
  const macroRiskComputed =
    macroRiskMode === 'n/d'
      ? `<span class="muted">n/d</span>`
      : `${pillFromRiskMode(macroRiskMode)} <span class="muted">${escapeHtml(`FX:${emPillLabel} • Radar:${riskRadarMode === 'risk_on' ? 'RISK-ON' : riskRadarMode === 'risk_off' ? 'RISK-OFF' : 'MISTO'} • China:${chinaBrLabel} • Com:${brComLabel}`)}</span>`
  const maxQuotesAgeMin = quotes && quotes.meta ? Math.max(45, Math.max(10, quotes.meta.intervalMinutes) * 4) : 60
  const quotesAgeMin = quotes && quotes.meta ? minutesSinceIso(quotes.meta.generatedAt) : null
  const macroQualityIssues: string[] = []
  if (coverage && coverage.ok === false) macroQualityIssues.push('cobertura')
  if (typeof quotesAgeMin === 'number' && quotesAgeMin > maxQuotesAgeMin) macroQualityIssues.push(`quotes>${maxQuotesAgeMin}m`)
  const macroRisk =
    macroQualityIssues.length ? `${intelPill('mid', 'INCOMPLETO')} <span class="muted">${escapeHtml(macroQualityIssues.join(' • '))}</span>` : macroRiskComputed
  const fxDivergences = (() => {
    if (emMode !== 'risk_on' && emMode !== 'risk_off') return '—'
    const out: string[] = []
    if (emMode === 'risk_on') {
      if (dxyA === '↑') out.push('DXY↑')
      if (vixA === '↑') out.push('VIX↑')
      if (brlA === '↑') out.push('USD/BRL↑')
    }
    if (emMode === 'risk_off') {
      if (dxyA === '↓') out.push('DXY↓')
      if (vixA === '↓') out.push('VIX↓')
      if (brlA === '↓') out.push('USD/BRL↓')
    }
    return out.length ? out.join(' • ') : '—'
  })()

  const g10Sentinel = quotes ? computeFlowSentinel({ assets: quotes.assets, series: quotes.series, generatedAt: quotes.meta.generatedAt }) : null
  const riskBlockScore = g10Sentinel ? g10Sentinel.riskBlock.score : null
  const protBlockScore = g10Sentinel ? g10Sentinel.protectionBlock.score : null
  const deltaAdj = g10Sentinel ? g10Sentinel.composite : null
  const regimeMode = g10Sentinel ? g10Sentinel.regime.mode : ('n/d' as const)
  const regimeLabel = g10Sentinel ? g10Sentinel.regime.label : 'n/d'
  const regimeAction = g10Sentinel ? g10Sentinel.regime.action : 'n/d'
  const thermo10 = g10Sentinel && typeof g10Sentinel.thermo.score10 === 'number' ? g10Sentinel.thermo.score10 : null
  const oilUp = g10Sentinel ? g10Sentinel.oil.score : null
  const oilIntel = g10Sentinel ? g10Sentinel.oil.intel : 'n/d'

  const g10Divergences = (() => {
    if (regimeMode !== 'risk_on' && regimeMode !== 'risk_off') return '—'
    const out: string[] = []
    if (regimeMode === 'risk_on') {
      if (dxyA === '↑') out.push('DXY↑')
      if (vixA === '↑') out.push('VIX↑')
    }
    if (regimeMode === 'risk_off') {
      if (dxyA === '↓') out.push('DXY↓')
      if (vixA === '↓') out.push('VIX↓')
    }
    return out.length ? out.join(' • ') : '—'
  })()

  const riskBlockAction = g10Sentinel ? g10Sentinel.riskBlock.action.label : 'n/d'
  const protBlockAction = g10Sentinel ? g10Sentinel.protectionBlock.action.label : 'n/d'
  const pickWall = (o: (typeof oWdo) | (typeof oWin), side: 'call' | 'put') => {
    const k = o && o.keyLevels ? o.keyLevels : null
    if (!k) return null
    const eff = side === 'call' ? k.effectiveCallWall : k.effectivePutWall
    const raw = side === 'call' ? k.callWall : k.putWall
    if (typeof eff === 'number' && Number.isFinite(eff)) return eff
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw
    return null
  }
  const fmtWalls = (o: (typeof oWdo) | (typeof oWin)) => `${fmtLevel(pickWall(o, 'call'))} / ${fmtLevel(pickWall(o, 'put'))}`

  const usdmxn = lastOf(['USD/MXN - US Dollar Mexican Peso', 'USD/MXN', 'USDMXN'])
  const usdzar = lastOf(['USD/ZAR - US Dollar South African Rand', 'USD/ZAR', 'USDZAR'])
  const usdclp = lastOf(['USD/CLP - US Dollar Chilean Peso', 'USD/CLP', 'USDCLP'])
  const usdtry = lastOf(['USD/TRY - US Dollar Turkish Lira', 'USD/TRY', 'USDTRY'])
  const emPairs = [
    { label: 'USD/MXN', ...usdmxn },
    { label: 'USD/ZAR', ...usdzar },
    { label: 'USD/CLP', ...usdclp },
    { label: 'USD/TRY', ...usdtry },
  ]
  const emPairsHtml = `<table>${emPairs
    .map(x => lineRow(x.label, valueArrow(x.a, fmtPct(typeof x.pct === 'number' ? x.pct : null))))
    .join('')}</table>`

  const metricCard = (icon: string, valueHtml: string, label: string, changeHtml: string) =>
    `<div class="mcard">
      <div class="micon">${escapeHtml(icon)}</div>
      <div class="mval">${valueHtml}</div>
      <div class="mlabel">${escapeHtml(label)}</div>
      <div class="mchg">${changeHtml}</div>
    </div>`

  const g10MetricsRow = `<div class="mgrid">
    ${metricCard('💠', escapeHtml(fmtPct(riskBlockScore)), 'FX Bloco A', `<span class="muted">${escapeHtml(riskBlockAction)}</span>`)}
    ${metricCard('🛡️', escapeHtml(fmtPct(protBlockScore)), 'FX Bloco B', `<span class="muted">${escapeHtml(protBlockAction)}</span>`)}
    ${metricCard('🛢️', escapeHtml(fmtPct(oilUp)), 'Petróleo (Brent/WTI)', `<span class="muted">${escapeHtml(oilIntel)}</span>`)}
    ${metricCard('🧭', escapeHtml(regimeLabel), 'Regime', `<span class="muted">Δ ${escapeHtml(fmtPct(deltaAdj))}</span>`)}
    ${metricCard('⏱️', escapeHtml(typeof thermo10 === 'number' ? `${thermo10}/10` : 'n/d'), 'Termômetro', `<span class="muted">${escapeHtml(regimeAction)}</span>`)}
  </div>`

  const emMetricsRow = `<div class="mgrid">
    ${metricCard('🌍', escapeHtml(emScore), 'EM Pulse', `${emPill} <span class="muted">${escapeHtml(emThresholdLabel)}</span>`)}
    ${metricCard('🇧🇷', escapeHtml(fmtPct(typeof mercosulPulse.score === 'number' ? mercosulPulse.score : null)), 'Mercosul', `${intelPill(mercosulPulse.mode, mercosulPulse.state)}`)}
    ${metricCard('💵', `${valueArrow(dxyMove.a, dxyMove.pct)}`, 'DXY', `<span class="muted">contexto USD</span>`)}
    ${metricCard('🧨', `${valueArrow(vixMove.a, vixMove.pct)}`, 'VIX', `<span class="muted">contexto vol</span>`)}
    ${metricCard('🛰️', escapeHtml(macroSignals.length ? macroRiskMode.toUpperCase().replace('_', '-') : 'N/D'), 'Macro', `${macroRisk}`)}
  </div>`

  const macroBodyA = htmlShell(
    'MENSAGEM 1/5 — MACRO & TÁTICO',
    `${sessionLabel} B3 — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="box">
        <div class="h">VIÉS (abertura × dia)</div>
        <table>
          ${lineRow('WIN (30–90m)', valueArrow(arrowFromPct(win30_90), fmtPct(win30_90)))}
          ${lineRow('WIN (dia)', valueArrow(arrowFromPct(winDay), fmtPct(winDay)))}
          ${lineRow('WDO (30–90m)', valueArrow(arrowFromPct(wdo30_90), fmtPct(wdo30_90)))}
          ${lineRow('WDO (dia)', valueArrow(arrowFromPct(wdoDay), fmtPct(wdoDay)))}
          ${lineRow('Sentimento (manchetes)', escapeHtml(sentiment))}
          ${lineRow('Fluxo Emergentes', `${emPill} ${escapeHtml(emPulse.state)} <span class="muted">(score ${escapeHtml(emScore)} • ${escapeHtml(emThresholdLabel)})</span>`)}
          ${lineRow(
            'Pressão EM (WDO/WIN)',
            '<span class="muted">RISK-OFF → tende a WDO↑ / WIN↓ • RISK-ON → tende a WDO↓ / WIN↑ • filtro, não gatilho.</span>',
          )}
          ${lineRow('Divergências (FX)', escapeHtml(fxDivergences))}
          ${lineRow('Risk-on/off (VIX/DXY/US10Y/CDS)', riskRadar)}
          ${lineRow('Carry trade (FX)', carryLine)}
          ${lineRow('Beta (FX) Oceania/Ásia', betaLine)}
          ${lineRow('Macro Risk (final)', macroRisk)}
        </table>
        ${conflicts.length ? `<div class="small muted" style="margin-top:10px;">${escapeHtml(conflicts[0]!)}</div>` : ''}
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">SAÚDE DOS DADOS</div>
          <table>
            ${lineRow('Quotes (idade)', escapeHtml(quotesAge))}
            ${lineRow('Notícias (idade)', escapeHtml(webAge))}
            ${lineRow('Opções (idade)', escapeHtml(optionsAge))}
            ${lineRow('Cobertura crítica', escapeHtml(coverage ? (coverage.ok ? 'OK' : 'INCOMPLETA') : 'n/d'))}
            ${lineRow('Críticos faltando', escapeHtml(coverage && !coverage.ok ? missingCriticalLabel : '—'))}
          </table>
        </div>
        <div class="box">
          <div class="h">ATIVOS (referência)</div>
          <table>
            ${lineRow('WIN (símbolo)', escapeHtml(winKey || 'n/d'))}
            ${lineRow('WDO (símbolo)', escapeHtml(wdoKey || 'n/d'))}
            ${lineRow('Fonte', escapeHtml(quotes && quotes.meta ? quotes.meta.source : 'n/d'))}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">GLOBAL (core)</div>
          <table>
            ${lineRow('S&P Fut (ES)', valueArrow(pull(['ESH26', 'ES']).a, pull(['ESH26', 'ES']).pct))}
            ${lineRow('Nasdaq Fut (NQ)', valueArrow(pull(['NQH26', 'NQ']).a, pull(['NQH26', 'NQ']).pct))}
            ${lineRow('VIX', valueArrow(vixMove.a, vixMove.pct))}
            ${lineRow('US10Y', valueArrow(us10y.a, us10y.pct))}
            ${lineRow('DXY', valueArrow(dxyMove.a, dxyMove.pct))}
          </table>
        </div>
        <div class="box">
          <div class="h">COMMODITIES (impacto BR)</div>
          <table>
            ${lineRow('Minério (Investing)', valueArrow(pull(['TIOc1', 'SM58Fc1']).a, pull(['TIOc1', 'SM58Fc1']).pct))}
            ${lineRow('Minério Dalian (Sina)', valueArrow(dalianOreA, dalianOre.pct))}
            ${lineRow('Brent', valueArrow(pull(['LCO']).a, pull(['LCO']).pct))}
            ${lineRow('WTI', valueArrow(pull(['CL']).a, pull(['CL']).pct))}
            ${lineRow('Cobre', valueArrow(pull(['HG', 'HGc1']).a, pull(['HG', 'HGc1']).pct))}
            ${lineRow('Soja', valueArrow(pull(['ZS']).a, pull(['ZS']).pct))}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">BRASIL (core)</div>
          <table>
            ${lineRow('Curva DI (curta)', valueArrow(diShort.a, diShort.pct))}
            ${lineRow('Curva DI (longa)', valueArrow(diLong.a, diLong.pct))}
            ${lineRow('Shape', escapeHtml(diShape))}
            ${lineRow('Risco BR (CDS 5Y)', valueArrow(brRisk.a, brRisk.pct))}
            ${lineRow('VXEWZ', valueArrow(vxewz.a, vxewz.pct))}
          </table>
        </div>
        <div class="box">
        <div class="h">AGENDA (hoje • resumo)</div>
        <table>
          ${lineRow('Itens (≠ baixo)', escapeHtml(`BR ${agendaDay.BR.length} • EUA ${agendaDay.EUA.length} • CHINA/HK ${agendaDay['CHINA/HK'].length}`))}
          ${lineRow('Horários', `<span class="muted">${escapeHtml(agendaLine)}</span>`)}
          ${lineRow('Detalhe', '<span class="muted">Calendário completo + reações WDO/WIN na Mensagem 4/5.</span>')}
        </table>
        </div>
      </div>

    </div>`,
  )

  const macroBodyB = htmlShell(
    'MENSAGEM 2/5 — NÍVEIS (WDO/WIN)',
    `Opções/gamma — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="cols">
        <div class="box">
          <div class="h">NÍVEIS — WDO (opções/gamma)</div>
          <table>
            ${lineRow('Regime', escapeHtml(oWdo && oWdo.regime ? oWdo.regime : 'n/d'))}
            ${lineRow('Gamma Flip', escapeHtml(oWdo && oWdo.keyLevels ? fmtLevel(oWdo.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('Call/Put Wall', escapeHtml(fmtWalls(oWdo)))}
          </table>
        </div>
        <div class="box">
          <div class="h">NÍVEIS — WIN (opções/gamma)</div>
          <table>
            ${lineRow('Regime', escapeHtml(oWin && oWin.regime ? oWin.regime : 'n/d'))}
            ${lineRow('Gamma Flip', escapeHtml(oWin && oWin.keyLevels ? fmtLevel(oWin.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('Call/Put Wall', escapeHtml(fmtWalls(oWin)))}
          </table>
        </div>
      </div>
      <div class="cols">
        <div class="box">
          <div class="h">SENTINELA DE FLUXO (FX)</div>
          ${g10MetricsRow}
          <table>
            ${lineRow('FX Bloco A', `<span class="v">${escapeHtml(riskBlockAction)}</span>`)}
            ${lineRow('FX Bloco B', `<span class="v">${escapeHtml(protBlockAction)}</span>`)}
            ${lineRow('Petróleo & Geopolítica', `<span class="muted">${escapeHtml(oilIntel)}</span>`)}
            ${lineRow('Regime → Execução', `<span class="v">${escapeHtml(regimeLabel)}</span> <span class="muted">•</span> <span class="muted">${escapeHtml(regimeAction)}</span>`)}
            ${lineRow('Divergências (contexto)', escapeHtml(g10Divergences))}
          </table>
          <div class="small muted" style="margin-top:10px;">
            Execução: use Regime/Termômetro como contexto e só então execute nos níveis de WDO/WIN. Use a “regra dos 30%” em dias de tendência forte.
          </div>
        </div>
        <div class="box">
          <div class="h">FLUXO EMERGENTES</div>
          ${emMetricsRow}
          <table>
            ${lineRow('Fluxo Emergentes', `${emPill} <span class="muted">${escapeHtml(emPulse.state)} • score ${escapeHtml(emScore)}</span>`)}
            ${lineRow('Divergências (FX)', escapeHtml(fxDivergences))}
            ${lineRow('Carry trade (FX)', carryLine)}
            ${lineRow('Beta (FX) Oceania/Ásia', betaLine)}
            ${lineRow('Radar (stress)', riskRadar)}
          </table>
          <div style="margin-top:12px;">
            <div class="h" style="margin:0 0 8px 0;">Componentes (USD vs EM)</div>
            ${emPairsHtml}
          </div>
          <div class="h" style="margin-top:12px;">Guia (execução)</div>
          <ul class="list small">
            <li><span class="pill">Ordem</span> <span class="muted">1) Regime (Sentinela FX) → 2) Fluxo Emergentes → 3) Níveis WDO/WIN.</span></li>
            <li><span class="pill">Confirmação</span> <span class="muted">confluência entre DXY/VIX/US10Y/CDS e microestrutura.</span></li>
            <li><span class="pill">Regra</span> <span class="muted">“30%” em dias de tendência forte para evitar caça de topo/fundo.</span></li>
          </ul>
          <div class="small muted" style="margin-top:10px;">
            Qualidade: quotes ${escapeHtml(quotesAge)} • opções ${escapeHtml(optionsAge)} • web ${escapeHtml(webAge)} • faltantes ${escapeHtml(missingCriticalLabel)}
          </div>
        </div>
      </div>
    </div>`,
    1320,
  )

  const panelBody = htmlShell(
    'MENSAGEM 3/5 — PAINEL DE VARIAÇÕES',
    `Painel global — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="cols">
        <div class="box">
          <div class="h">ÍNDICES</div>
          <table>
            ${lineRow('S&P Fut (ES)', valueArrow(pull(['ESH26', 'ES']).a, pull(['ESH26', 'ES']).pct))}
            ${lineRow('Nasdaq Fut (NQ)', valueArrow(pull(['NQH26', 'NQ']).a, pull(['NQH26', 'NQ']).pct))}
            ${lineRow('Dow', valueArrow(pull(['.DJI']).a, pull(['.DJI']).pct))}
            ${lineRow('DAX', valueArrow(pull(['DE40']).a, pull(['DE40']).pct))}
            ${lineRow('FTSE', valueArrow(pull(['UK100']).a, pull(['UK100']).pct))}
            ${lineRow('Nikkei', valueArrow(pull(['JP225']).a, pull(['JP225']).pct))}
            ${lineRow('Hang Seng', valueArrow(pull(['HSIQG6']).a, pull(['HSIQG6']).pct))}
            ${lineRow('China A50', valueArrow(pull(['CHINA50']).a, pull(['CHINA50']).pct))}
          </table>
        </div>
        <div class="box">
          <div class="h">STRESS & MOEDAS</div>
          <table>
            ${lineRow('VIX', valueArrow(vixMove.a, vixMove.pct))}
            ${lineRow('DXY', valueArrow(dxyMove.a, dxyMove.pct))}
            ${lineRow('US10Y', valueArrow(us10y.a, us10y.pct))}
            ${lineRow('CDS BR 5Y', valueArrow(pull(['BRGV5YUSAC=R']).a, pull(['BRGV5YUSAC=R']).pct))}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">INTEL — CHINA ⇄ BR</div>
          <table>
            ${lineRow('Regra (A50 + Minério)', chinaBrIntel)}
          </table>
        </div>
        <div class="box">
          <div class="h">INTEL — COMMODITIES BR</div>
          <table>
            ${lineRow('Regra (cesta)', brCommoditiesIntel)}
          </table>
        </div>
      </div>

      <div class="cols">
        <div class="box">
          <div class="h">COMMODITIES (flash)</div>
          <table>
            ${lineRow('Minério (Investing)', valueArrow(pull(['TIOc1', 'SM58Fc1']).a, pull(['TIOc1', 'SM58Fc1']).pct))}
            ${lineRow('Minério Dalian (Sina)', valueArrow(dalianOreA, dalianOre.pct))}
            ${lineRow('Brent', valueArrow(pull(['LCO']).a, pull(['LCO']).pct))}
            ${lineRow('WTI', valueArrow(pull(['CL']).a, pull(['CL']).pct))}
            ${lineRow('Cobre', valueArrow(pull(['HG', 'HGc1']).a, pull(['HG', 'HGc1']).pct))}
            ${lineRow('Ouro', valueArrow(pull(['GC']).a, pull(['GC']).pct))}
            ${lineRow('Soja', valueArrow(pull(['ZS']).a, pull(['ZS']).pct))}
            ${lineRow('Boi', valueArrow(pull(['LE']).a, pull(['LE']).pct))}
            ${lineRow('Café', valueArrow(pull(['KC']).a, pull(['KC']).pct))}
          </table>
        </div>
        <div class="box">
          <div class="h">CHECKLIST RÁPIDO</div>
          <table>
            ${lineRow('Risco dominante', escapeHtml(thesisDriversGlobal[0] || '—'))}
            ${lineRow('Brasil (driver)', escapeHtml(thesisDriversBr[0] || '—'))}
            ${lineRow('Commodities (driver)', escapeHtml(thesisDriversCom[0] || '—'))}
            ${lineRow('Pares emergentes', escapeHtml(emPulse.state))}
          </table>
        </div>
      </div>
    </div>`,
  )

  const deepDiveBody = htmlShell(
    'MENSAGEM 4/5 — DEEP DIVE',
    `Cenário & correlações — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="box">
        <div class="h">TESE DO DIA (síntese)</div>
        <ul class="list">
          <li><span class="pill">Global</span> <span class="muted">${escapeHtml(thesisDriversGlobal.join(' / ') || '—')}</span></li>
          <li><span class="pill">Brasil</span> <span class="muted">${escapeHtml(thesisDriversBr.join(' / ') || '—')}</span></li>
          <li><span class="pill">Commodities</span> <span class="muted">${escapeHtml(thesisDriversCom.join(' / ') || '—')}</span></li>
          <li><span class="pill">EM (oculto)</span> <span class="muted">${escapeHtml(emPulse.state)}</span></li>
        </ul>
      </div>

      ${agendaTodaySupplementHtml}
      ${ideasSupplementHtml}

      <div class="cols">
        <div class="box">
          <div class="h">MICROESTRUTURA (opções/gamma)</div>
          <table>
            ${lineRow('WDO — Regime', escapeHtml(oWdo && oWdo.regime ? oWdo.regime : 'n/d'))}
            ${lineRow('WDO — Gamma Flip', escapeHtml(oWdo && oWdo.keyLevels ? fmtLevel(oWdo.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('WDO — Call Wall', escapeHtml(fmtLevel(pickWall(oWdo, 'call'))))}
            ${lineRow('WDO — Put Wall', escapeHtml(fmtLevel(pickWall(oWdo, 'put'))))}
            ${lineRow('WIN — Regime', escapeHtml(oWin && oWin.regime ? oWin.regime : 'n/d'))}
            ${lineRow('WIN — Gamma Flip', escapeHtml(oWin && oWin.keyLevels ? fmtLevel(oWin.keyLevels.gammaFlip) : 'n/d'))}
            ${lineRow('WIN — Call Wall', escapeHtml(fmtLevel(pickWall(oWin, 'call'))))}
            ${lineRow('WIN — Put Wall', escapeHtml(fmtLevel(pickWall(oWin, 'put'))))}
          </table>
        </div>
        <div class="box">
          <div class="h">GATILHOS (operacionais)</div>
          <ul class="list">
            <li><span class="pill">Confirmação</span> <span class="muted">confluência entre DXY/US10Y, risco BR e microestrutura.</span></li>
            <li><span class="pill">Invalidação</span> <span class="muted">mudança abrupta no bloco global ou perda de coerência entre WDO e WIN.</span></li>
            <li><span class="pill">Calendário</span> <span class="muted">${escapeHtml(agendaLine)} • ver bloco de calendário nesta imagem.</span></li>
          </ul>
        </div>
      </div>

      <div class="box">
        <div class="h">PARÁGRAFO EMERGENTES (sem tickers)</div>
        <div class="muted">
          Quando o fluxo em pares emergentes está favorável, a assimetria costuma reduzir o prêmio de risco local e melhora a “tolerância” do mercado a ruídos.
          Quando há pressão em emergentes, o canal de contágio costuma dominar e exige mais confirmação por commodities/juros/risco Brasil antes de operar direção.
        </div>
      </div>
    </div>`,
  )

  const mercosulFxBody = htmlShell(
    'MENSAGEM 5/5 — MERCOSUL + SENTINELA DE FLUXO (FX)',
    `${sessionLabel} B3 — ${now.date} • ${now.time} BRT`,
    `<div class="grid">
      <div class="cols">
        <div class="box">
          <div class="h">MERCOSUL PULSE (70% FX + 30% Proxies)</div>
          <table>
            ${mercosulComponents.map(x => lineRow(x.label, valueArrow(x.a, fmtPct(x.pct)))).join('')}
            ${lineRow('Mercosul Score', `${intelPill(mercosulPulse.mode, mercosulPulse.state)} <span class="muted">${escapeHtml(fmtPct(mercosulPulse.score))}</span>`)}
          </table>
        </div>
        <div class="box">
          <div class="h">SENTINELA DE FLUXO (FX EMERGENTES)</div>
          <table>
            ${lineRow('Flow Sentinel (FX)', `${emPill} ${escapeHtml(emPulse.state)} <span class="muted">(score ${escapeHtml(emScore)} • ${escapeHtml(emThresholdLabel)})</span>`)}
            ${lineRow(
              'Operacional (WDO/WIN)',
              '<span class="muted">RISK-OFF → tende a WDO↑ / WIN↓ • RISK-ON → tende a WDO↓ / WIN↑ • filtro, não gatilho.</span>',
            )}
            ${lineRow('Divergências (FX)', escapeHtml(fxDivergences))}
            ${lineRow('Carry trade (FX)', carryLine)}
            ${lineRow('Risco BR (CDS/VXEWZ)', `${miniMove('CDS', brRisk.a, brRisk.pct)} <span class="muted">•</span> ${miniMove('VXEWZ', vxewz.a, vxewz.pct)}`)}
          </table>
        </div>
      </div>
    </div>`,
  )

  const cards: TelegramCard[] = [
    {
      key: 'macro_a',
      filename: `telegram_1_macro_a_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 1/5 (${sessionLabel}) — ${now.date} ${now.time} BRT`,
      html: macroBodyA,
    },
    {
      key: 'macro_b',
      filename: `telegram_2_macro_b_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 2/5 (Níveis WDO/WIN) — ${now.date} ${now.time} BRT`,
      html: macroBodyB,
    },
    {
      key: 'panel',
      filename: `telegram_3_painel_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 3/5 (Painel de Variações) — ${now.date} ${now.time} BRT`,
      html: panelBody,
    },
    {
      key: 'deep_dive',
      filename: `telegram_4_deepdive_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 4/5 (Deep Dive) — ${now.date} ${now.time} BRT`,
      html: deepDiveBody,
    },
    {
      key: 'mercosul_fx',
      filename: `telegram_5_mercosul_fx_${now.date.replaceAll('/', '')}_${now.time.replace(':', '')}.png`,
      caption: `EDI Macro Desk — 5/5 (Mercosul + Fluxo FX) — ${now.date} ${now.time} BRT`,
      html: mercosulFxBody,
    },
  ]

  return { ok: true, generatedAt: now.iso, cards }
}

export async function renderTelegramCardsToPng(cards: TelegramCard[]) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1320, height: 720 }, deviceScaleFactor: 2 })
    const out: Array<{ key: TelegramCard['key']; filename: string; caption: string; png: Buffer }> = []
    for (const c of cards) {
      const width = c.key === 'macro_b' ? 1320 : 1080
      await page.setViewportSize({ width, height: 720 })
      await page.setContent(c.html, { waitUntil: 'load' })
      const buf = await page.screenshot({ type: 'png', fullPage: true })
      out.push({ key: c.key, filename: c.filename, caption: c.caption, png: Buffer.from(buf) })
    }
    return { ok: true as const, images: out }
  } finally {
    await browser.close()
  }
}

export async function sendTelegramPhotos(params: {
  botToken: string
  chatId: string
  messageThreadId?: number | null
  items: Array<{ filename: string; caption: string; png: Buffer }>
}) {
  if (!params.botToken) return { ok: false as const, error: 'missing_bot_token' }
  if (!params.chatId) return { ok: false as const, error: 'missing_chat_id' }

  const out: Array<{ filename: string; ok: boolean; messageId?: number; error?: string }> = []
  for (const it of params.items) {
    const url = `https://api.telegram.org/bot${params.botToken}/sendPhoto`
    const form = new FormData()
    form.append('chat_id', params.chatId)
    if (typeof params.messageThreadId === 'number' && Number.isFinite(params.messageThreadId)) {
      form.append('message_thread_id', String(params.messageThreadId))
    }
    form.append('caption', it.caption)
    const photoBytes = new Uint8Array(it.png)
    form.append('photo', new Blob([photoBytes], { type: 'image/png' }), it.filename)
    try {
      const r = await fetch(url, { method: 'POST', body: form })
      const j = (await r.json()) as { ok?: boolean; result?: { message_id?: number }; description?: string }
      if (!j || !j.ok) {
        out.push({ filename: it.filename, ok: false, error: j && j.description ? String(j.description) : 'telegram_error' })
        continue
      }
      out.push({ filename: it.filename, ok: true, messageId: j.result && typeof j.result.message_id === 'number' ? j.result.message_id : undefined })
    } catch (e) {
      out.push({ filename: it.filename, ok: false, error: String(e instanceof Error ? e.message : e) })
    }
  }
  const okCount = out.filter(x => x.ok).length
  if (okCount === 0) {
    const firstError = out.find(x => !x.ok && x.error)?.error
    return { ok: false as const, error: firstError ? String(firstError) : 'telegram_send_failed', results: out }
  }
  return { ok: true as const, results: out }
}

function escapeTelegramHtml(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function trimTelegramText(s: string, maxLen = 3800) {
  const t = String(s || '').trim()
  if (!t) return ''
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1)).trim()}…`
}

export async function sendTelegramMessages(params: {
  botToken: string
  chatId: string
  messageThreadId?: number | null
  items: Array<{ text: string; disablePreview?: boolean }>
}) {
  if (!params.botToken) return { ok: false as const, error: 'missing_bot_token' }
  if (!params.chatId) return { ok: false as const, error: 'missing_chat_id' }

  const out: Array<{ ok: boolean; messageId?: number; error?: string }> = []
  for (const it of params.items) {
    const url = `https://api.telegram.org/bot${params.botToken}/sendMessage`
    const body: Record<string, unknown> = {
      chat_id: params.chatId,
      text: escapeTelegramHtml(trimTelegramText(it.text)),
      parse_mode: 'HTML',
      disable_web_page_preview: it.disablePreview !== false,
    }
    if (typeof params.messageThreadId === 'number' && Number.isFinite(params.messageThreadId)) {
      body.message_thread_id = params.messageThreadId
    }
    try {
      const doSend = async () => {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const j = (await r.json()) as {
          ok?: boolean
          result?: { message_id?: number }
          description?: string
          parameters?: { retry_after?: number }
        }
        return { r, j }
      }

      const first = await doSend()
      if (first.r.status === 429) {
        const retryAfter = first.j && first.j.parameters && typeof first.j.parameters.retry_after === 'number'
          ? first.j.parameters.retry_after
          : null
        const waitMs = retryAfter !== null && Number.isFinite(retryAfter) ? Math.max(250, Math.floor(retryAfter * 1000)) : 1500
        await new Promise(resolve => setTimeout(resolve, Math.min(20000, waitMs)))
        const second = await doSend()
        if (!second.j || !second.j.ok) {
          out.push({ ok: false, error: second.j && second.j.description ? String(second.j.description) : 'telegram_error' })
          continue
        }
        out.push({ ok: true, messageId: second.j.result && typeof second.j.result.message_id === 'number' ? second.j.result.message_id : undefined })
        continue
      }

      const j = first.j
      if (!j || !j.ok) {
        out.push({ ok: false, error: j && j.description ? String(j.description) : 'telegram_error' })
        continue
      }
      out.push({ ok: true, messageId: j.result && typeof j.result.message_id === 'number' ? j.result.message_id : undefined })
    } catch (e) {
      out.push({ ok: false, error: String(e instanceof Error ? e.message : e) })
    }
  }
  const okCount = out.filter(x => x.ok).length
  if (okCount === 0) {
    const firstError = out.find(x => !x.ok && x.error)?.error
    return { ok: false as const, error: firstError ? String(firstError) : 'telegram_send_failed', results: out }
  }
  return { ok: true as const, results: out }
}
