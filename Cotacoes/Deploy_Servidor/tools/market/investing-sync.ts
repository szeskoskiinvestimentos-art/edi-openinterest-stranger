import 'dotenv/config'
import { mkdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { rename } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import { parseArgs } from './lib/args.js'
import { loadCalendarMatrixDbs, matchCalendarMatrix } from './lib/calendar-matrix-db.js'
import { buildMarketHistory } from './market-history.js'
import type { Asset, MarketPoint, MarketQuotes } from './types.js'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function safeFileStamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

function env(name: string): string | undefined
function env(name: string, fallback: string): string
function env(name: string, fallback?: string) {
  const v = process.env[name]
  return v && v.trim() ? v.trim() : fallback
}

function envBool(name: string, fallback: boolean) {
  const v = env(name)
  if (!v) return fallback
  if (v === '1' || v.toLowerCase() === 'true' || v.toLowerCase() === 'yes') return true
  if (v === '0' || v.toLowerCase() === 'false' || v.toLowerCase() === 'no') return false
  return fallback
}

function envNumber(name: string, fallback: number) {
  const v = Number(env(name))
  return Number.isFinite(v) ? v : fallback
}

const BRT_TZ = 'America/Sao_Paulo'

function brtYmd(d = new Date()) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const year = String(parts.find(p => p.type === 'year')?.value || '')
  const month = String(parts.find(p => p.type === 'month')?.value || '')
  const day = String(parts.find(p => p.type === 'day')?.value || '')
  if (!year || !month || !day) return ''
  return `${year}-${month}-${day}`
}

function brtMinuteOfDay(d = new Date()) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRT_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  const hour = Number(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = Number(parts.find(p => p.type === 'minute')?.value || '0')
  return hour * 60 + minute
}

function safeParseMs(iso?: string | null) {
  if (!iso) return null
  const ms = new Date(String(iso)).getTime()
  return Number.isFinite(ms) ? ms : null
}

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf-8')
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
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

function parseSinaHqVar(raw: string) {
  const m = String(raw || '').match(/var\s+hq_str_[^=]+="([^"]*)"/)
  if (!m) return null
  const payload = String(m[1] || '')
  if (!payload) return null
  const parts = payload.split(',')
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

async function getLastCalendarAttempt(outDir: string) {
  const jsonPath = path.join(outDir, 'economic_calendar.json')
  const prev = await readJsonSafe<Partial<EconomicCalendarPayload>>(jsonPath)
  const meta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as EconomicCalendarPayload['meta']) : null
  const attemptedAt = safeParseMs(meta?.attemptedAt || meta?.generatedAt || null)
  return {
    attemptedAt,
    status: meta?.status,
    unchanged: !!meta?.unchanged,
  }
}

async function getLastDiUpdatedAt(outDir: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const prev = await readJsonSafe<Partial<MarketQuotes>>(jsonPath)
  const meta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as MarketQuotes['meta']) : null
  const diUpdatedAt = safeParseMs((meta as { diUpdatedAt?: string } | null)?.diUpdatedAt || null)
  return diUpdatedAt
}

async function setDiUpdatedAt(outDir: string, iso: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const parsed = await readJsonSafe<Partial<MarketQuotes>>(jsonPath)
  if (!parsed || !parsed.meta) return
  ;(parsed.meta as MarketQuotes['meta'] & { diUpdatedAt?: string }).diUpdatedAt = iso
  try {
    await writeFile(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8')
    await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`, 'utf-8')
  } catch {
    void 0
  }
}

function diScheduleIntervalMinutes(now = new Date()) {
  const m = brtMinuteOfDay(now)
  const min0600 = 6 * 60
  const min0900 = 9 * 60
  const min1900 = 19 * 60
  if (m < min0600) return null
  if (m < min0900) return 60
  if (m < min1900) return 15
  return null
}

function shouldRunDiCatchUpAfterClose(now: Date, lastDiUpdatedAtMs: number | null) {
  if (!lastDiUpdatedAtMs) return false
  const nowMin = brtMinuteOfDay(now)
  const min1900 = 19 * 60
  if (nowMin < min1900) return false
  const lastDate = brtYmd(new Date(lastDiUpdatedAtMs))
  const today = brtYmd(now)
  if (!lastDate || !today || lastDate !== today) return false
  const lastMin = brtMinuteOfDay(new Date(lastDiUpdatedAtMs))
  return lastMin < min1900
}

function browserChannel() {
  const v = (env('INVESTING_BROWSER', 'chrome') || 'chrome').toLowerCase()
  if (v === 'chromium') return undefined
  if (v === 'msedge' || v === 'edge') return 'msedge'
  return 'chrome'
}

function executablePath() {
  const v = env('INVESTING_CHROME_EXECUTABLE_PATH')
  return v || undefined
}

function launchArgs() {
  const out = ['--disable-blink-features=AutomationControlled']
  return out
}

function shouldUseChannel(exePath?: string) {
  return !exePath
}

function launchOptions(headless: boolean) {
  const channel = browserChannel()
  const exePath = executablePath()
  const useChannel = shouldUseChannel(exePath)
  return {
    headless,
    acceptDownloads: true,
    ...(useChannel && channel ? { channel } : {}),
    ...(!useChannel && exePath ? { executablePath: exePath } : {}),
    args: launchArgs(),
  } as const
}

async function launchPersistentContextWithRetry(userDataDir: string, headless: boolean) {
  const options = launchOptions(headless)
  const exePath = executablePath()
  const channel = browserChannel()
  process.stdout.write(`BROWSER • ${exePath ? `exe=${exePath}` : `channel=${channel || 'chromium'}`}\n`)
  try {
    return await chromium.launchPersistentContext(userDataDir, options)
  } catch (err) {
    void err
    const altDir = `${userDataDir}-alt`
    try {
      await rename(userDataDir, `${userDataDir}.broken_${Date.now()}`)
    } catch (renameErr) {
      void renameErr
    }
    process.stdout.write(`RETRY • profile=${altDir}\n`)
    return await chromium.launchPersistentContext(altDir, options)
  }
}

async function dumpDebug(page: import('playwright').Page, debugDir: string, prefix: string) {
  await mkdir(debugDir, { recursive: true })
  const stamp = safeFileStamp()
  const pngPath = path.join(debugDir, `${prefix}_${stamp}.png`)
  const htmlPath = path.join(debugDir, `${prefix}_${stamp}.html`)
  const txtPath = path.join(debugDir, `${prefix}_${stamp}.txt`)
  await page.screenshot({ path: pngPath, fullPage: true })
  const html = await page.content()
  await writeFile(htmlPath, html, 'utf-8')
  await writeFile(txtPath, `url=${page.url()}\n`, 'utf-8')
  process.stdout.write(`DEBUG • ${pngPath}\n`)
  process.stdout.write(`DEBUG • ${htmlPath}\n`)
  process.stdout.write(`DEBUG • ${txtPath}\n`)
}

function parsePtNumber(raw: string) {
  const s = String(raw || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\d,.-]/g, '')
    .trim()
  if (!s) return null
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const v = Number(normalized)
  return Number.isFinite(v) ? v : null
}

function monthCodeFromText(text: string) {
  const s = String(text || '').toLowerCase()
  if (/\bjan\b|\bjaneiro\b/.test(s)) return 'F'
  if (/\bfev\b|\bfevereiro\b|\bfeb\b/.test(s)) return 'G'
  if (/\bmar\b|\bmarço\b|\bmarco\b/.test(s)) return 'H'
  if (/\babr\b|\babril\b|\bapr\b/.test(s)) return 'J'
  if (/\bmai\b|\bmaio\b|\bmay\b/.test(s)) return 'K'
  if (/\bjun\b|\bjunho\b/.test(s)) return 'M'
  if (/\bjul\b|\bjulho\b/.test(s)) return 'N'
  if (/\bago\b|\bagosto\b|\baug\b/.test(s)) return 'Q'
  if (/\bset\b|\bsetembro\b|\bsep\b/.test(s)) return 'U'
  if (/\bout\b|\boutubro\b|\boct\b/.test(s)) return 'V'
  if (/\bnov\b|\bnovembro\b/.test(s)) return 'X'
  if (/\bdez\b|\bdezembro\b|\bdec\b/.test(s)) return 'Z'
  return null
}

function inferDiSymbolFromMaturityText(maturity: string) {
  const direct = String(maturity || '').match(/\bDI1([FGHJKMNQUVXZ])(\d{2})\b/i)
  if (direct) return `DI1${direct[1].toUpperCase()}${direct[2]}`

  const s = String(maturity || '').replace(/\s+/g, ' ').trim()
  const parts = s.match(/([A-Za-zÀ-ÿ]{3,})\s*\/\s*(\d{2,4})/)
  if (!parts) return null

  const code = monthCodeFromText(parts[1])
  if (!code) return null

  const yRaw = parts[2]
  const yy = yRaw.length === 4 ? yRaw.slice(-2) : yRaw.padStart(2, '0')
  return `DI1${code}${yy}`
}

type DiQuote = {
  symbol: string
  rate: number
  changePct?: number | null
}

async function scrapeDiFromInfoMoney(debugDir: string, headless: boolean, userDataDir?: string) {
  const url = 'https://www.infomoney.com.br/ferramentas/juros-futuros-di/'

  const context = userDataDir ? await launchPersistentContextWithRetry(userDataDir, headless) : null
  const browser = context ? null : await chromium.launch(launchOptions(headless))
  const page = context ? await context.newPage() : await browser!.newPage()
  try {
    await gotoWithRetries(page, url)
    await tryDismissBanners(page)
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 })
    } catch {
      void 0
    }

    await page.waitForSelector('#contratos_di_futuro', { timeout: 60000 }).catch(() => null)

    await page
      .waitForFunction(
        () => {
          const rows = Array.from(document.querySelectorAll('#contratos_di_futuro tbody tr, table tbody tr'))
          if (rows.length < 10) return false
          return rows.some(r => /\bDI1[FGHJKMNQUVXZ]\d{2}\b/i.test(String(r.textContent || '')))
        },
        { timeout: 90000 },
      )
      .catch(() => null)

    for (let i = 0; i < 18; i++) {
      const before = await page.evaluate(() => document.querySelectorAll('table tbody tr').length)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(550)
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 })
      } catch {
        void 0
      }
      const after = await page.evaluate(() => document.querySelectorAll('table tbody tr').length)
      if (after <= before && i >= 3) break
    }
    await page.evaluate(() => window.scrollTo(0, 0))

    const extracted = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'))
      const out: { headers: string[]; rows: string[][] }[] = []

      for (let ti = 0; ti < tables.length; ti++) {
        const t = tables[ti] as HTMLTableElement

        const headers: string[] = []
        const headTh = t.querySelectorAll('thead th')
        if (headTh && headTh.length) {
          for (let i = 0; i < headTh.length; i++) {
            let v = String((headTh[i] as HTMLElement).innerText || '')
            v = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
            headers.push(v)
          }
        } else {
          const anyTh = t.querySelectorAll('tr th')
          for (let i = 0; i < anyTh.length; i++) {
            let v = String((anyTh[i] as HTMLElement).innerText || '')
            v = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
            headers.push(v)
          }
        }

        const rows: string[][] = []
        const bodyRows = t.querySelectorAll('tbody tr')
        const baseRows = bodyRows && bodyRows.length ? Array.from(bodyRows) : Array.from(t.querySelectorAll('tr'))

        for (let ri = 0; ri < baseRows.length; ri++) {
          const tr = baseRows[ri] as HTMLTableRowElement
          const cells = tr.querySelectorAll('td,th')
          const row: string[] = []
          let hasAny = false
          for (let ci = 0; ci < cells.length; ci++) {
            let v = String((cells[ci] as HTMLElement).innerText || '')
            v = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
            if (v) hasAny = true
            row.push(v)
          }
          if (hasAny) rows.push(row)
        }

        out.push({ headers, rows })
      }

      return out
    })

    const headerScore = (h: string[]) => {
      const j = h.join(' ').toLowerCase()
      const hasVenc = /venc|vcto|vencimento/.test(j) ? 1 : 0
      const hasTaxa = /taxa|ultimo|último|ajuste/.test(j) ? 1 : 0
      return hasVenc + hasTaxa
    }

    const picked =
      extracted
        .map(t => ({ ...t, score: headerScore(t.headers), n: t.rows.length }))
        .sort((a, b) => b.score - a.score || b.n - a.n)[0] || null

    const headers = picked && picked.headers ? picked.headers : []
    const rows = picked && picked.rows ? picked.rows : []

    const idxVenc = (() => {
      const i = headers.findIndex(h => /venc|vcto|vencimento/i.test(h))
      return i >= 0 ? i : 0
    })()

    const idxCode = (() => {
      const i = headers.findIndex(h => /c[oó]digo|codigo|c[oó]d\./i.test(h))
      return i >= 0 ? i : -1
    })()

    const idxTaxa = (() => {
      const i = headers.findIndex(h => /taxa|ultimo|último|ajuste/i.test(h))
      if (i >= 0) return i
      return Math.max(0, Math.min(2, headers.length - 1))
    })()

    const idxVar = (() => {
      const i = headers.findIndex(h => /varia/i.test(h))
      return i >= 0 ? i : -1
    })()

    const parseSignedPercent = (raw: string) => {
      const s = String(raw || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
      if (!s) return null
      const n = parsePtNumber(s)
      if (n === null) return null
      if (/-/.test(s)) return -Math.abs(n)
      return Math.abs(n)
    }

    const out: DiQuote[] = []
    for (const r of rows) {
      if (!r || r.length < 2) continue
      const codeCell = idxCode >= 0 ? String(r[idxCode] || '').trim() : ''
      const symbolFromCode = codeCell && /^DI1[FGHJKMNQUVXZ]\d{2}$/i.test(codeCell) ? codeCell.toUpperCase() : null

      const maturity = String(r[idxVenc] || '').trim()
      const symbol = symbolFromCode || inferDiSymbolFromMaturityText(maturity)
      if (!symbol) continue

      const rawRate = String(r[idxTaxa] || '').trim()
      let rate = parsePtNumber(rawRate)
      if (rate === null) {
        const fallbackCell = r.find(x => /%/.test(String(x)) || /\d+,\d+/.test(String(x)))
        rate = fallbackCell ? parsePtNumber(fallbackCell) : null
      }
      if (rate === null) continue

      const varCell = idxVar >= 0 ? String(r[idxVar] || '').trim() : ''
      const changePct = parseSignedPercent(varCell)

      out.push({ symbol, rate, changePct })
    }

    const uniq = new Map<string, DiQuote>()
    for (const q of out) uniq.set(q.symbol, q)
    const result = Array.from(uniq.values()).slice(0, 120)
    if (!result.length) {
      await dumpDebug(page, debugDir, 'infomoney_di_empty')
      process.stderr.write('WARN • DI InfoMoney: tabela encontrada, mas não consegui extrair contratos/taxas.\n')
    }
    return result
  } catch (e) {
    try {
      await dumpDebug(page, debugDir, 'infomoney_di_error')
    } catch {
      void 0
    }
    process.stderr.write(`WARN • DI InfoMoney indisponível: ${String(e instanceof Error ? e.message : e)}\n`)
    return []
  } finally {
    if (context) await context.close()
    else await browser!.close()
  }
}

async function mergeDiIntoMarketQuotes(outDir: string, di: DiQuote[]) {
  if (!di.length) return

  const jsonPath = path.join(outDir, 'market_quotes.json')
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as MarketQuotes
  if (!parsed || !Array.isArray(parsed.assets) || !parsed.series || !parsed.meta) return

  const generatedAt = String(parsed.meta.generatedAt || new Date().toISOString())
  const assets: Asset[] = parsed.assets
  const series: Record<string, MarketPoint[]> = parsed.series

  const hasAsset = new Set(assets.map(a => String(a && a.symbol ? a.symbol : '')))

  for (const q of di) {
    if (!hasAsset.has(q.symbol)) {
      assets.push({
        symbol: q.symbol,
        name: `Brazil DI Future ${q.symbol}`,
        exchange: 'B3',
        category: 'rates',
        tags: ['risk_off'],
      })
      hasAsset.add(q.symbol)
    }

    const points = Array.isArray(series[q.symbol]) ? series[q.symbol] : []
    const prev = points.length ? points[points.length - 1] : null
    const point: MarketPoint = { t: generatedAt, price: q.rate }
    if (typeof q.changePct === 'number' && Number.isFinite(q.changePct) && q.changePct !== 0) {
      point.changePct = q.changePct
    } else if (prev && typeof prev.price === 'number') {
      const change = q.rate - prev.price
      if (Number.isFinite(change) && change !== 0) point.change = change
      if (prev.price !== 0) {
        const changePct = (change / prev.price) * 100
        if (Number.isFinite(changePct) && changePct !== 0) point.changePct = changePct
      }
    }

    const next =
      prev && prev.t === point.t
        ? points.slice(0, -1).concat([point])
        : points.concat([point])

    series[q.symbol] = next
  }

  assets.sort((a, b) => String(a.symbol || '').localeCompare(String(b.symbol || '')))
  parsed.assets = assets
  parsed.series = series
  parsed.meta.diUpdatedAt = new Date().toISOString()
  await writeFile(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`, 'utf-8')
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
  if (!hasAsset.has(key)) {
    assets.push(input.asset)
    hasAsset.add(key)
  }

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

  const next = prev && prev.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
  series[key] = next

  assets.sort((a, b) => String(a.symbol || '').localeCompare(String(b.symbol || '')))
  parsed.assets = assets
  parsed.series = series
  await writeFile(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`, 'utf-8')
}

type EconomicCalendarItem = {
  id: string
  time: string
  currency: string
  impact: 'ALTO' | 'MÉDIO' | 'BAIXO'
  event: string
  actual?: string
  forecast?: string
  previous?: string
  wdo: string
  win: string
  matrixKey?: string
  canonicalKey?: string
  mappedBy?: 'event' | 'rule' | 'fallback'
}

type EconomicCalendarPayload = {
  meta: {
    generatedAt: string
    attemptedAt?: string
    source: string
    timeZone: string
    status?: 'ok' | 'blocked' | 'fail'
    error?: string
    unchanged?: boolean
    matrix?: {
      mapped: number
      total: number
      requestedReports: Array<{ key: string; country: 'BR' | 'EUA' | 'CHINA/HK'; query: string }>
    }
  }
  items: EconomicCalendarItem[]
}

function impactFromImportance(n: number): 'ALTO' | 'MÉDIO' | 'BAIXO' {
  if (n >= 3) return 'ALTO'
  if (n === 2) return 'MÉDIO'
  return 'BAIXO'
}

function buildMacroReactions(currency: string, eventName: string) {
  const cur = String(currency || '').toUpperCase()
  const name = String(eventName || '').toLowerCase()

  const isInflation = /\b(ipca|cpi|pce|ppi|infla)\b/i.test(name)
  const isRates = /\b(copom|selic|rate decision|decis[aã]o de juros|banco central|fed|fomc)\b/i.test(name)
  const isJobs = /\b(payroll|desemprego|jobless|employment|seguro-?desemprego)\b/i.test(name)
  const isActivity = /\b(pib|gdp|pmi|industrial|produ[cç][aã]o|vendas|retail|housing|constru[cç][aã]o)\b/i.test(name)
  const isChina = /\bchina\b/i.test(name) || cur === 'CNY' || cur === 'CNH' || cur === 'HKD'

  const wdoTemplate = (upLabel: string, downLabel: string) => `Se ${upLabel}: ↑ | Se ${downLabel}: ↓`
  const winTemplate = (upLabel: string, downLabel: string) => `Se ${upLabel}: ↓ | Se ${downLabel}: ↑`

  if (isChina) {
    return {
      wdo: wdoTemplate('forte', 'fraco'),
      win: `Se forte: ↑ | Se fraco: ↓`,
    }
  }

  if (cur === 'BRL') {
    if (isInflation || isRates) {
      return {
        wdo: wdoTemplate('acima do consenso', 'abaixo do consenso'),
        win: winTemplate('acima do consenso', 'abaixo do consenso'),
      }
    }
    if (isActivity) {
      return {
        wdo: `Se fraco: ↑ | Se forte: ↓`,
        win: `Se forte: ↑ | Se fraco: ↓`,
      }
    }
    return {
      wdo: wdoTemplate('pior que o esperado', 'melhor que o esperado'),
      win: `Se melhor: ↑ | Se pior: ↓`,
    }
  }

  if (cur === 'USD') {
    if (isInflation || isRates || isJobs || isActivity) {
      return {
        wdo: wdoTemplate('forte/hawkish', 'fraco/dovish'),
        win: `Se forte/hawkish: ↓ | Se fraco/dovish: ↑`,
      }
    }
    return {
      wdo: wdoTemplate('surpresa positiva (USD forte)', 'surpresa negativa (USD fraco)'),
      win: `Se USD forte: ↓ | Se USD fraco: ↑`,
    }
  }

  if (isInflation || isRates || isJobs || isActivity) {
    return {
      wdo: wdoTemplate('forte', 'fraco'),
      win: `Se forte: ↓ | Se fraco: ↑`,
    }
  }

  return {
    wdo: wdoTemplate('surpresa positiva', 'surpresa negativa'),
    win: `Se positivo: ↓ | Se negativo: ↑`,
  }
}

async function scrapeEconomicCalendarFromInvestingWidget(
  debugDir: string,
  headless: boolean,
  userDataDir?: string,
  status?: {
    cloudflare?: boolean
    matrix?: EconomicCalendarPayload['meta']['matrix']
  },
  matrixDbs?: Awaited<ReturnType<typeof loadCalendarMatrixDbs>> | null,
) {
  const url =
    env('INVESTING_ECONOMIC_CALENDAR_URL') ||
    'https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,timeselector,filters&countries=110,32,6,37,5,39,35,7,72&calType=day&timeZone=12&lang=12'

  type ExtractedRow = {
    time: string
    currency: string
    importance: number
    event: string
    actual: string
    forecast: string
    previous: string
  }

  const context = userDataDir ? await launchPersistentContextWithRetry(userDataDir, headless) : null
  const browser = context ? null : await chromium.launch(launchOptions(headless))
  const page = context ? await context.newPage() : await browser!.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 })
    } catch {
      void 0
    }

    await tryDismissBanners(page)
    try {
      const cf = await page.evaluate(`(() => {
        const t = String(document.title || '').toLowerCase()
        const isMoment = /um momento|just a moment/.test(t)
        const hasChallengeScript = !!document.querySelector('script[src*="challenge-platform"], script[src*="/cdn-cgi/"]')
        const hasRay = !!document.querySelector('.ray-id code')
        return isMoment || hasChallengeScript || hasRay
      })()`)
      if (cf) {
        if (status) status.cloudflare = true
        await dumpDebug(page, debugDir, 'investing_calendar_cloudflare')
        process.stderr.write(
          'WARN • Calendário Investing bloqueado por challenge (Cloudflare). Rode "npm run market:calendar-login" para liberar o profile e depois atualize novamente.\n',
        )
        return []
      }
    } catch {
      void 0
    }
    await page.waitForTimeout(1200)
    try {
      await page.waitForFunction(() => {
        const n = document.querySelectorAll(
          'tr.js-event-item, tr[data-event-datetime], table tbody tr, table tr',
        ).length
        return n > 5
      }, { timeout: 45000 })
    } catch {
      void 0
    }

    const extracted = (await page.evaluate(`(() => {
      const normalize = (raw) =>
        String(raw || '')
          .replace(/\\u00a0/g, ' ')
          .replace(/\\s+/g, ' ')
          .trim()

      const textOf = (el) => {
        if (!el) return ''
        return normalize(el.innerText || el.textContent || '')
      }

      const rows = Array.from(document.querySelectorAll('tr.js-event-item, tr[data-event-datetime]'))
      const fallbackRows = Array.from(document.querySelectorAll('table tbody tr, table tr'))
      const out = []
      const list = rows.length ? rows : fallbackRows

      for (const tr of list) {
        const tds = Array.from(tr.querySelectorAll('td'))
        if (tds.length < 3) continue

        const timeCell = tr.querySelector('td.time') || tds[0] || null
        const timeRaw = textOf(timeCell)
        const time = normalize(String(timeRaw || '').replace(/\\(.*?\\)/g, ''))

        const currencyCell = tr.querySelector('td.flagCur') || tr.querySelector('td.currency') || tds[1] || null
        const currencyRaw = textOf(currencyCell)
        const currencyMatch = String(currencyRaw || '').match(/\\b[A-Z]{3}\\b/)
        const currency = String(currencyMatch ? currencyMatch[0] : (String(currencyRaw || '').split(/\\s+/)[0] || '')).toUpperCase()

        const impCell = tr.querySelector('td.sentiment') || tr.querySelector('td.importance') || tds[2] || null
        const importance = impCell
          ? Math.max(
              impCell.querySelectorAll('i').length,
              impCell.querySelectorAll('svg').length,
              impCell.querySelectorAll('img').length,
              impCell.querySelectorAll('[class*="Bullish"],[class*="bullish"],[class*="sentiment"]').length
            )
          : 0

        const eventCell =
          tr.querySelector('td.event') ||
          tr.querySelector('td:nth-child(4)') ||
          (tds.length > 3 ? tds[3] : null)
        const event = textOf(eventCell)

        const actualCell = tr.querySelector('td.act') || tr.querySelector('td.actual') || (tds.length > 4 ? tds[4] : null)
        const actual = textOf(actualCell)

        const forecastCell = tr.querySelector('td.fore') || tr.querySelector('td.forecast') || (tds.length > 5 ? tds[5] : null)
        const forecast = textOf(forecastCell)

        const previousCell = tr.querySelector('td.prev') || tr.querySelector('td.previous') || (tds.length > 6 ? tds[6] : null)
        const previous = textOf(previousCell)

        const isTimeLike = /^\\d{1,2}:\\d{2}$/.test(time) || /^\\d+\\s*min$/i.test(time)
        if (!isTimeLike || !event) continue

        out.push({ time, currency, importance, event, actual, forecast, previous })
      }

      return out
    })()`)) as ExtractedRow[]

    if (!extracted.length) {
      await dumpDebug(page, debugDir, 'investing_calendar_empty')
      process.stderr.write('WARN • Calendário Investing: não consegui extrair linhas.\n')
      return []
    }

    const requestedReports: Array<{ key: string; country: 'BR' | 'EUA' | 'CHINA/HK'; query: string }> = []
    let mapped = 0

    const items: EconomicCalendarItem[] = extracted
      .map(x => {
        const importance = Number.isFinite(x.importance) ? x.importance : 0
        const impact = impactFromImportance(importance)
        const fromDb = matchCalendarMatrix(matrixDbs, x.currency, x.event)
        const reactions = fromDb ? { wdo: fromDb.wdo, win: fromDb.win } : buildMacroReactions(x.currency, x.event)
        const id = `${x.currency}_${x.time}_${x.event}`.replace(/[^\w.-]+/g, '_').slice(0, 140)
        if (fromDb) {
          mapped++
          if (fromDb.reportRequest) requestedReports.push(fromDb.reportRequest)
        }
        const mappedBy: EconomicCalendarItem['mappedBy'] = fromDb ? fromDb.source : 'fallback'
        return {
          id,
          time: x.time,
          currency: x.currency,
          impact,
          event: `${x.currency} • ${x.event}`,
          actual: x.actual || undefined,
          forecast: x.forecast || undefined,
          previous: x.previous || undefined,
          wdo: reactions.wdo,
          win: reactions.win,
          ...(fromDb ? { matrixKey: fromDb.matrixKey, canonicalKey: fromDb.canonicalKey } : {}),
          mappedBy,
        }
      })
      .filter(x => x.event && x.time)

    if (status) {
      status.matrix = { mapped, total: extracted.length, requestedReports }
    }

    return items
  } catch (e) {
    try {
      await dumpDebug(page, debugDir, 'investing_calendar_error')
    } catch {
      void 0
    }
    process.stderr.write(
      `WARN • Calendário Investing indisponível: ${String(e instanceof Error ? e.message : e)}\n`,
    )
    return []
  } finally {
    if (context) await context.close()
    else await browser!.close()
  }
}

async function writeEconomicCalendar(
  outDir: string,
  items: EconomicCalendarItem[],
  meta: Partial<EconomicCalendarPayload['meta']> = {},
) {
  const keepLastOnEmpty = envBool('INVESTING_CALENDAR_KEEP_LAST_ON_EMPTY', true)
  const jsonPath = path.join(outDir, 'economic_calendar.json')
  const attemptedAt = new Date().toISOString()
  if (keepLastOnEmpty && (!items || items.length === 0)) {
    try {
      const prevRaw = await readFile(jsonPath, 'utf-8')
      const prev = prevRaw ? (JSON.parse(prevRaw) as Partial<EconomicCalendarPayload>) : null
      const prevItems = prev && Array.isArray(prev.items) ? prev.items : []
      if (prevItems.length) {
        const prevMeta =
          prev && prev.meta && typeof prev.meta === 'object'
            ? (prev.meta as EconomicCalendarPayload['meta'])
            : null
        const payload: EconomicCalendarPayload = {
          meta: {
            generatedAt: String(prevMeta?.generatedAt || attemptedAt),
            source: String(prevMeta?.source || 'investing_calendar_widget'),
            timeZone: String(prevMeta?.timeZone || 'BRT'),
            ...(prevMeta?.attemptedAt ? { attemptedAt: prevMeta.attemptedAt } : {}),
            ...(prevMeta?.status ? { status: prevMeta.status } : {}),
            ...(prevMeta?.error ? { error: prevMeta.error } : {}),
            ...(typeof prevMeta?.unchanged === 'boolean' ? { unchanged: prevMeta.unchanged } : {}),
            ...meta,
            attemptedAt,
          },
          items: prevItems as EconomicCalendarItem[],
        }
        await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')
        await writeFile(
          path.join(outDir, 'economic_calendar.js'),
          `window.ECONOMIC_CALENDAR_DATA=${JSON.stringify(payload)};`,
          'utf-8',
        )
        process.stdout.write('WARN • CAL vazio: mantendo o último economic_calendar.json não-vazio.\n')
        return
      }
    } catch {
      void 0
    }
  }
  const payload: EconomicCalendarPayload = {
    meta: {
      generatedAt: meta.generatedAt || attemptedAt,
      attemptedAt,
      source: 'investing_calendar_widget',
      timeZone: 'BRT',
      ...(meta.status ? { status: meta.status } : {}),
      ...(meta.error ? { error: meta.error } : {}),
      ...(typeof meta.unchanged === 'boolean' ? { unchanged: meta.unchanged } : {}),
    },
    items,
  }
  await writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(
    path.join(outDir, 'economic_calendar.js'),
    `window.ECONOMIC_CALENDAR_DATA=${JSON.stringify(payload)};`,
    'utf-8',
  )
}

async function tryDismissBanners(page: import('playwright').Page) {
  const candidates = [
    page.getByRole('button', { name: /aceitar|aceito|concordo|ok|entendi/i }),
    page.getByRole('button', { name: /accept|agree|got it/i }),
    page.getByRole('button', { name: /continuar|continue/i }),
    page.locator('button:has-text("Aceitar")'),
    page.locator('button:has-text("Accept")'),
  ]
  for (const c of candidates) {
    try {
      await c.first().waitFor({ state: 'visible', timeout: 1200 })
      await c.first().click({ timeout: 1200 })
      return
    } catch {
      continue
    }
  }
}

async function isCloudflareChallenge(page: import('playwright').Page) {
  const url = page.url() || ''
  if (/\/cdn-cgi\/challenge-platform\//i.test(url)) return true
  try {
    const title = await page.title()
    if (/um momento|just a moment/i.test(title || '')) return true
  } catch {
    void 0
  }
  try {
    const h1 = await page.locator('h1').first().textContent({ timeout: 1500 })
    if (h1 && /um momento|just a moment|checking your browser/i.test(h1)) return true
  } catch {
    void 0
  }
  return false
}

function isRetryableNavigationError(err: unknown) {
  const msg = String(err instanceof Error ? err.message : err)
  if (/net::ERR_ABORTED/i.test(msg)) return true
  if (/frame was detached/i.test(msg)) return true
  if (/Target page, context or browser has been closed/i.test(msg)) return true
  return false
}

async function gotoWithRetries(page: import('playwright').Page, url: string) {
  let lastErr: unknown = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      return
    } catch (e) {
      lastErr = e
      if (!isRetryableNavigationError(e)) throw e
      await page.waitForTimeout(650 * attempt)
    }
  }
  throw lastErr
}

async function tryDownloadFromMenu(
  page: import('playwright').Page,
  downloadDir: string,
  brUrl: string,
  debugDir: string,
) {
  const actionsContainer = page.locator('.portfolioActionsContainer').first()
  const dots = actionsContainer.locator('.threeDotsIcon').first()
  try {
    await dots.waitFor({ state: 'visible', timeout: 3000 })
    await dots.click({ timeout: 3000, force: true })

    const pop = actionsContainer.locator('.portfolioActionsPop').first()
    try {
      await pop.waitFor({ state: 'visible', timeout: 2500 })
    } catch {
      void 0
    }

    const downloadRow = pop
      .locator(
        [
          '.js-open-download-portfolio-popup a[name="download"]',
          'a[name="download"]',
          'a:has-text("Download")',
          'button:has-text("Download")',
          'a:has-text("Export")',
          'button:has-text("Export")',
          'a:has-text("Exportar")',
          'button:has-text("Exportar")',
        ].join(','),
      )
      .first()
    await downloadRow.waitFor({ state: 'visible', timeout: 3000 })

    const href = await downloadRow.getAttribute('href')
    if (href && isInvestingNewsLikeUrl(href)) throw new Error('menu_download_redirects_to_news')

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null)
    await downloadRow.click({ timeout: 6000 })
    const direct = await downloadPromise
    if (direct) {
      const suggested = direct.suggestedFilename() || 'investing.csv'
      const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
      const outPath = path.join(downloadDir, outName)
      await direct.saveAs(outPath)
      return outPath
    }

    const downloadPopup = page.locator('#downloadPortfolio').first()
    await downloadPopup.waitFor({ state: 'visible', timeout: 5000 })

    const downloadBtn = downloadPopup.locator('.js-save').first()
    const downloadPromise2 = page.waitForEvent('download', { timeout: 30000 })
    await downloadBtn.click({ timeout: 6000 })

    const download = await downloadPromise2
    const suggested = download.suggestedFilename() || 'investing.csv'
    const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
    const outPath = path.join(downloadDir, outName)
    await download.saveAs(outPath)
    return outPath
  } catch {
    void 0
  }
  await ensurePortfolioPage(page, brUrl, debugDir)

  const advancedBtn = page.getByRole('button', { name: /advanced watchlist/i }).first()

  try {
    await advancedBtn.waitFor({ state: 'visible', timeout: 4000 })
  } catch {
    return null
  }

  const menuTriggers = [
    page.locator('.portfolioActionsContainer .threeDotsIcon'),
    advancedBtn.locator('xpath=following-sibling::*[self::button or self::a][1]'),
    advancedBtn.locator('xpath=../following-sibling::*[self::button or self::a][1]'),
    advancedBtn.locator('xpath=ancestor::*[self::div or self::section][1]').locator('button:has-text("⋮")'),
    advancedBtn
      .locator('xpath=ancestor::*[self::div or self::section][1]')
      .locator('[aria-haspopup="menu"], button[aria-haspopup], a[aria-haspopup]'),
    advancedBtn
      .locator('xpath=ancestor::*[self::div or self::section][1]')
      .locator('button[aria-label*="More"], button[aria-label*="more"], button[aria-label*="Mais"], button[aria-label*="Opções"], button[aria-label*="Options"], button[aria-label*="options"]'),
    page.locator('button[aria-label*="More"], button[aria-label*="more"], button[aria-label*="Mais"], button[aria-label*="Opções"], button[aria-label*="Options"], button[aria-label*="options"]'),
  ]

  for (const t of menuTriggers) {
    try {
      await t.first().waitFor({ state: 'visible', timeout: 1500 })
      await t.first().click({ timeout: 1500 })
    } catch {
      continue
    }

    const actions = page.locator('.portfolioActionsContainer').first()
    const pop = actions.locator('.portfolioActionsPop').first()
    try {
      await pop.waitFor({ state: 'visible', timeout: 2500 })
    } catch {
      void 0
    }

    const downloadRow = pop
      .locator(
        [
          '.js-open-download-portfolio-popup a[name="download"]',
          'a[name="download"]',
          'a:has-text("Download")',
          'button:has-text("Download")',
          'a:has-text("Export")',
          'button:has-text("Export")',
          'a:has-text("Exportar")',
          'button:has-text("Exportar")',
        ].join(','),
      )
      .first()

    try {
      await downloadRow.waitFor({ state: 'visible', timeout: 3000 })
    } catch {
      continue
    }

    try {
      const href = await downloadRow.getAttribute('href')
      if (href && isInvestingNewsLikeUrl(href)) throw new Error('menu_download_redirects_to_news')

      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null)
      await downloadRow.click({ timeout: 6000 })

      const direct = await downloadPromise
      if (direct) {
        const suggested = direct.suggestedFilename() || 'investing.csv'
        const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
        const outPath = path.join(downloadDir, outName)
        await direct.saveAs(outPath)
        return outPath
      }

      const downloadPopup = page.locator('#downloadPortfolio').first()
      await downloadPopup.waitFor({ state: 'visible', timeout: 5000 })
      const downloadBtn = downloadPopup.locator('.js-save').first()
      const downloadPromise2 = page.waitForEvent('download', { timeout: 30000 })
      await downloadBtn.click({ timeout: 6000 })

      const download = await downloadPromise2
      const suggested = download.suggestedFilename() || 'investing.csv'
      const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
      const outPath = path.join(downloadDir, outName)
      await download.saveAs(outPath)
      return outPath
    } catch {
      await ensurePortfolioPage(page, brUrl, debugDir)
      continue
    }
  }

  return null
}

async function openForLogin(userDataDir: string, url: string) {
  const context = await launchPersistentContextWithRetry(userDataDir, false)
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await tryDismissBanners(page)
  process.stdout.write(
    [
      '',
      'LOGIN INVESTING:',
      '- Faça login manualmente no navegador aberto',
      '- Quando terminar, feche a janela do navegador para encerrar',
      '',
    ].join('\n'),
  )
  await context.waitForEvent('close')
}

async function openInfoMoneyForLogin(userDataDir: string) {
  const url = 'https://www.infomoney.com.br/ferramentas/juros-futuros-di/'
  const context = await launchPersistentContextWithRetry(userDataDir, false)
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await tryDismissBanners(page)
  process.stdout.write(
    [
      '',
      'INFO MONEY (DI):',
      '- A página é pública (normalmente não exige login)',
      '- Se aparecer cookie/captcha, resolva manualmente no navegador aberto',
      '- Quando terminar, feche a janela do navegador para encerrar',
      '',
    ].join('\n'),
  )
  await context.waitForEvent('close')
}

function isInvestingPortfolioUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return false
  try {
    const u = new URL(raw)
    const host = u.hostname.toLowerCase()
    if (!host.endsWith('investing.com')) return false
    return /^\/portfolio\/?$/i.test(u.pathname) || /^\/portfolio\/.+/i.test(u.pathname)
  } catch {
    return /(^|\/)portfolio(\/|$)/i.test(raw)
  }
}

function isInvestingNewsLikeUrl(url: string) {
  const raw = String(url || '').trim()
  if (!raw) return false
  try {
    const u = new URL(raw)
    const host = u.hostname.toLowerCase()
    if (!host.endsWith('investing.com')) return false
    return /^\/news(\/|$)/i.test(u.pathname) || /^\/analysis(\/|$)/i.test(u.pathname)
  } catch {
    const s = raw.replace(/\\/g, '/')
    return /(^|\/)news(\/|$)/i.test(s) || /(^|\/)analysis(\/|$)/i.test(s)
  }
}

async function tryCloseNewsPopups(
  context: import('playwright').BrowserContext,
  main: import('playwright').Page,
  debugDir: string,
) {
  const closeIfNews = async (p: import('playwright').Page) => {
    if (!p || p === main) return
    try {
      await p.waitForLoadState('domcontentloaded', { timeout: 8000 })
    } catch {
      void 0
    }
    const u = p.url()
    if (isInvestingNewsLikeUrl(u)) {
      try {
        await dumpDebug(p, debugDir, 'investing_unwanted_news_popup')
      } catch {
        void 0
      }
      try {
        await p.close()
      } catch {
        void 0
      }
    }
  }

  context.on('page', p => {
    void closeIfNews(p)
  })
  main.on('popup', p => {
    void closeIfNews(p)
  })
}

async function ensurePortfolioPage(page: import('playwright').Page, brUrl: string, debugDir: string) {
  const u = page.url()
  if (isInvestingPortfolioUrl(u)) return true
  if (isInvestingNewsLikeUrl(u)) {
    try {
      await dumpDebug(page, debugDir, 'investing_redirected_to_news')
    } catch {
      void 0
    }
  }
  try {
    await page.goto(brUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 })
    } catch {
      void 0
    }
    await tryDismissBanners(page)
    return isInvestingPortfolioUrl(page.url())
  } catch {
    return false
  }
}

async function clickExportAndDownloadCsv(
  url: string,
  userDataDir: string,
  downloadDir: string,
  debugDir: string,
  headless: boolean,
) {
  await mkdir(downloadDir, { recursive: true })

  const context = await launchPersistentContextWithRetry(userDataDir, headless)
  let closed = false

  try {
    const page = await context.newPage()
    await tryCloseNewsPopups(context, page, debugDir)
    const brUrl = url.startsWith('https://www.investing.com/portfolio')
      ? url.replace('https://www.investing.com', 'https://br.investing.com')
      : url.startsWith('https://investing.com/portfolio')
        ? url.replace('https://investing.com', 'https://br.investing.com')
        : url
    try {
      await gotoWithRetries(page, brUrl)
    } catch (e) {
      try {
        await dumpDebug(page, debugDir, 'investing_portfolio_goto_error')
      } catch {
        void 0
      }
      if (headless && isRetryableNavigationError(e)) {
        await context.close()
        closed = true
        const next = await clickExportAndDownloadCsv(brUrl, userDataDir, downloadDir, debugDir, false)
        return next
      }
      throw e
    }
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 })
    } catch {
      void 0
    }
    await tryDismissBanners(page)

    const finalUrl = page.url()
    if (!/\/portfolio\/?/i.test(finalUrl) && /investing\.com\/portfolio/i.test(brUrl)) {
      try {
        await page.goto(brUrl, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle', { timeout: 15000 })
        await tryDismissBanners(page)
      } catch {
        void 0
      }
    }

    if (!(await ensurePortfolioPage(page, brUrl, debugDir))) {
      await dumpDebug(page, debugDir, 'investing_portfolio_not_loaded')
      throw new Error('Não consegui abrir a página do Portfolio do Investing (possível bloqueio/login). Rode o modo login e tente novamente.')
    }

    if (await isCloudflareChallenge(page)) {
      await dumpDebug(page, debugDir, 'investing_cloudflare')
      if (headless) {
        await context.close()
        closed = true
        const next = await clickExportAndDownloadCsv(brUrl, userDataDir, downloadDir, debugDir, false)
        return next
      }

      process.stdout.write(
        [
          '',
          'AÇÃO NECESSÁRIA (Investing/Cloudflare):',
          '- Um navegador foi aberto para validação anti-bot',
          '- Complete a verificação/captcha e aguarde a página do Portfolio carregar',
          '- Se houver login, faça login',
          '',
        ].join('\n'),
      )

      const started = Date.now()
      while (Date.now() - started < 180000) {
        if (!(await isCloudflareChallenge(page))) break
        await page.waitForTimeout(1000)
      }

      if (await isCloudflareChallenge(page)) {
        await dumpDebug(page, debugDir, 'investing_cloudflare_timeout')
        throw new Error('Investing/Cloudflare bloqueou o acesso. Abra o modo login e resolva manualmente.')
      }
    }

    const actionScope = page.locator('.portfolioActionsContainer, .portfolioHeader, [class*="portfolio"]').first()
    const exportCandidates = [
      actionScope.getByRole('button', { name: /exportar/i }),
      actionScope.getByRole('link', { name: /exportar/i }),
      actionScope.getByRole('button', { name: /export/i }),
      actionScope.getByRole('link', { name: /export/i }),
    ]

    for (const cand of exportCandidates) {
      try {
        const el = cand.first()
        await el.waitFor({ state: 'visible', timeout: 3500 })
        const href = await el.getAttribute('href')
        if (href && isInvestingNewsLikeUrl(href)) continue

        const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null)
        await el.click({ timeout: 6000 })

        const download = await downloadPromise
        if (!download) {
          await ensurePortfolioPage(page, brUrl, debugDir)
          continue
        }
        const suggested = download.suggestedFilename() || 'investing.csv'
        const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
        const outPath = path.join(downloadDir, outName)
        await download.saveAs(outPath)
        return outPath
      } catch {
        await ensurePortfolioPage(page, brUrl, debugDir)
        continue
      }
    }

    const menuDownload = await tryDownloadFromMenu(page, downloadDir, brUrl, debugDir)
    if (menuDownload) return menuDownload

    await dumpDebug(page, debugDir, 'export_not_found')
    throw new Error('Não encontrei o botão/link de exportação do Investing nesta página.')
  } finally {
    if (!closed) await context.close()
  }
}

type PortfolioSummary = {
  enabled: boolean
  status: 'ok' | 'skip' | 'fail'
  csvPath: string | null
  error?: string
}

type DiSummary = {
  enabled: boolean
  status: 'ok' | 'skip' | 'fail'
  count: number
  error?: string
}

type CalendarSummary = {
  enabled: boolean
  status: 'ok' | 'skip' | 'fail' | 'blocked'
  count: number
  error?: string
}

type UpdateSummary = {
  startedAt: string
  finishedAt: string
  mode: string
  outDir: string
  portfolio: PortfolioSummary
  di: DiSummary
  calendar: CalendarSummary
}

function writeSummary(summary: UpdateSummary) {
  process.stdout.write(`SUMMARY_JSON ${JSON.stringify(summary)}\n`)
}

async function runOnce(modeRaw: string) {
  const mode = String(modeRaw || 'once').toLowerCase()
  const startedAt = new Date().toISOString()
  const baseDir = env('MARKET_AUTOMATION_DIR', path.resolve(process.cwd(), '.edi-market-guardin'))
  const userDataDir = env('INVESTING_USER_DATA_DIR', path.join(baseDir, 'investing-profile'))
  const downloadDir = env('INVESTING_DOWNLOAD_DIR', path.join(baseDir, 'downloads'))
  const debugDir = path.join(baseDir, 'logs')

  const outDir = env(
    'MARKET_OUT_DIR',
    path.resolve(process.cwd(), 'dashboard', 'MERCADO', 'assets', 'data'),
  )
  const intervalMinutes = envNumber('MARKET_INTERVAL_MINUTES', 15)
  const retentionDays = envNumber('MARKET_RETENTION_DAYS', 10)

  const enableDiBase = envBool('INFOMONEY_DI_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'di')
  const enableCalendarBase =
    envBool('INVESTING_CALENDAR_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'calendar')
  const enablePortfolio =
    envBool('INVESTING_PORTFOLIO_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'portfolio')
  const exportRequired = envBool('INVESTING_EXPORT_REQUIRED', true)
  const headless = envBool('INVESTING_HEADLESS', true)
  const updateReason = String(env('MARKET_UPDATE_REASON', '') || '').toLowerCase()

  const applySchedule = (mode === 'once' || mode === 'all') && updateReason === 'schedule'
  const now = new Date()
  const nowMs = now.getTime()

  let enableDi = enableDiBase
  if (applySchedule && enableDiBase) {
    const diInterval = diScheduleIntervalMinutes(now)
    if (!diInterval) {
      const lastDiUpdatedAt = await getLastDiUpdatedAt(outDir)
      enableDi = shouldRunDiCatchUpAfterClose(now, lastDiUpdatedAt)
    } else {
      const lastDiUpdatedAt = await getLastDiUpdatedAt(outDir)
      if (lastDiUpdatedAt && nowMs - lastDiUpdatedAt < diInterval * 60 * 1000) enableDi = false
    }
  }

  let enableCalendar = enableCalendarBase
  if (applySchedule && enableCalendarBase) {
    const last = await getLastCalendarAttempt(outDir)
    const interval = last.status && last.status !== 'ok' ? 360 : last.unchanged ? 360 : 60
    if (last.attemptedAt && nowMs - last.attemptedAt < interval * 60 * 1000) enableCalendar = false
  }

  const url =
    env('INVESTING_PORTFOLIO_URL') ||
    'https://br.investing.com/portfolio/?portfolioID=ZWY2YGY0Mmo3YWFsZjc1NA%3D%3D'
  if (!env('INVESTING_PORTFOLIO_URL')) {
    process.stdout.write('WARN • INVESTING_PORTFOLIO_URL não configurada, usando fallback /portfolio/\n')
  }

  const summary: UpdateSummary = {
    startedAt,
    finishedAt: startedAt,
    mode,
    outDir,
    portfolio: { enabled: enablePortfolio, status: enablePortfolio ? 'fail' : 'skip', csvPath: null },
    di: { enabled: enableDi, status: enableDi ? 'fail' : 'skip', count: 0 },
    calendar: { enabled: enableCalendar, status: enableCalendar ? 'fail' : 'skip', count: 0 },
  }

  let csvPath: string | null = null
  let portfolioError: unknown = null
  const matrixDbs = await loadCalendarMatrixDbs().catch(() => null)

  if (enablePortfolio) {
    try {
      csvPath = await clickExportAndDownloadCsv(url, userDataDir, downloadDir, debugDir, headless)
      await buildMarketHistory({
        csvPath,
        outDir,
        intervalMinutes,
        retentionDays,
        timestamp: new Date().toISOString(),
      })
      summary.portfolio.status = 'ok'
      summary.portfolio.csvPath = csvPath
    } catch (e) {
      portfolioError = e
      summary.portfolio.status = 'fail'
      summary.portfolio.error = String(e instanceof Error ? e.message : e)
      process.stderr.write(
        `WARN • Falha ao exportar CSV do Investing: ${String(e instanceof Error ? e.message : e)}\n`,
      )
    }
  } else {
    const envEnabled = envBool('INVESTING_PORTFOLIO_ENABLED', true)
    if (!envEnabled) {
      process.stdout.write('SKIP • Portfolio Investing desativado (INVESTING_PORTFOLIO_ENABLED=false)\n')
    } else {
      process.stdout.write(`SKIP • Portfolio Investing (modo ${mode})\n`)
    }
    summary.portfolio.status = 'skip'
  }

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
      process.stderr.write(
        `WARN • Falha ao capturar Dalian I0 (Sina): ${String(e instanceof Error ? e.message : e)}\n`,
      )
    }
  }

  if (enableDi) {
    const attemptedAt = new Date().toISOString()
    let di: DiQuote[] = []
    try {
      const infoMoneyProfileDir = path.join(baseDir, 'infomoney-profile')
      di = await scrapeDiFromInfoMoney(debugDir, headless, infoMoneyProfileDir)
    } catch (e) {
      summary.di.status = 'fail'
      summary.di.error = String(e instanceof Error ? e.message : e)
      process.stderr.write(`WARN • DI InfoMoney indisponível: ${summary.di.error}\n`)
    }

    summary.di.count = di.length
    if (di.length) {
      try {
        await mergeDiIntoMarketQuotes(outDir, di)
        summary.di.status = 'ok'
        process.stdout.write(`OK • DI=${di.length} contratos (InfoMoney)\n`)
      } catch (e) {
        summary.di.status = 'fail'
        summary.di.error = String(e instanceof Error ? e.message : e)
        process.stderr.write(`WARN • Falha ao mesclar DI no market_quotes: ${summary.di.error}\n`)
      }
    } else if (summary.di.status !== 'fail') {
      summary.di.status = 'fail'
      summary.di.error = 'DI InfoMoney: lista vazia'
      process.stderr.write('WARN • DI InfoMoney: lista vazia (mantendo último).\n')
    }

    await setDiUpdatedAt(outDir, attemptedAt)
  } else {
    if (enableDiBase) {
      process.stdout.write('SKIP • DI InfoMoney (intervalo por agendamento)\n')
    } else if (!envBool('INFOMONEY_DI_ENABLED', true)) {
      process.stdout.write('SKIP • DI InfoMoney desativado (INFOMONEY_DI_ENABLED=false)\n')
    } else {
      process.stdout.write(`SKIP • DI InfoMoney (modo ${mode})\n`)
    }
    summary.di.status = 'skip'
  }

  if (enableCalendar) {
    const calendarStatus: { cloudflare?: boolean } = {}
    let calendar: EconomicCalendarItem[] = []
    try {
      calendar = await scrapeEconomicCalendarFromInvestingWidget(debugDir, headless, userDataDir, calendarStatus, matrixDbs)
    } catch (e) {
      summary.calendar.status = 'fail'
      summary.calendar.error = String(e instanceof Error ? e.message : e)
      process.stderr.write(`WARN • Calendário Investing indisponível: ${summary.calendar.error}\n`)
    }

    summary.calendar.count = calendar.length

    if (calendarStatus.cloudflare) {
      summary.calendar.status = 'blocked'
      await writeEconomicCalendar(outDir, [], { status: 'blocked' })
    } else if (!calendar.length) {
      summary.calendar.status = 'fail'
      summary.calendar.error = summary.calendar.error || 'Calendário Investing: lista vazia'
      await writeEconomicCalendar(outDir, [], { status: 'fail', error: summary.calendar.error })
    } else {
      const prevPath = path.join(outDir, 'economic_calendar.json')
      const prev = await readJsonSafe<Partial<EconomicCalendarPayload>>(prevPath)
      const prevItems = prev && Array.isArray(prev.items) ? prev.items : []
      const normalize = (items: EconomicCalendarItem[]) => items.slice().sort((a, b) => a.id.localeCompare(b.id))
      const unchanged = prevItems.length
        ? JSON.stringify(normalize(prevItems as EconomicCalendarItem[])) === JSON.stringify(normalize(calendar))
        : false
      const matrixMeta =
        calendarStatus && (calendarStatus as { matrix?: EconomicCalendarPayload['meta']['matrix'] }).matrix
          ? { matrix: (calendarStatus as { matrix?: EconomicCalendarPayload['meta']['matrix'] }).matrix }
          : {}
      await writeEconomicCalendar(outDir, calendar, { status: 'ok', unchanged, ...matrixMeta })
      summary.calendar.status = 'ok'
      process.stdout.write(`OK • CAL=${calendar.length} eventos (Investing)\n`)
    }
  } else {
    summary.calendar.status = 'skip'
  }

  const finishedAt = new Date().toISOString()
  summary.finishedAt = finishedAt
  writeSummary(summary)

  if (portfolioError && exportRequired) throw portfolioError

  process.stdout.write(`OK • CSV=${csvPath} • OUT=${outDir}\n`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const mode = (args.mode as string) || 'once'

  const baseDir = env('MARKET_AUTOMATION_DIR', path.resolve(process.cwd(), '.edi-market-guardin'))
  const userDataDir = env('INVESTING_USER_DATA_DIR', path.join(baseDir, 'investing-profile'))
  const url =
    env('INVESTING_PORTFOLIO_URL') ||
    'https://br.investing.com/portfolio/?portfolioID=ZWY2YGY0Mmo3YWFsZjc1NA%3D%3D'

  if (mode === 'login') {
    await openForLogin(userDataDir, url)
    return
  }

  if (mode === 'calendar-login') {
    const calUrl =
      env('INVESTING_ECONOMIC_CALENDAR_URL') ||
      'https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,timeselector,filters&countries=110,32,6,37,5,39,35,7,72&calType=day&timeZone=12&lang=12'
    await openForLogin(userDataDir, calUrl)
    return
  }

  if (mode === 'infomoney-login') {
    const infoMoneyProfileDir = path.join(baseDir, 'infomoney-profile')
    await openInfoMoneyForLogin(infoMoneyProfileDir)
    return
  }

  if (mode === 'daemon') {
    const minutes = envNumber('MARKET_INTERVAL_MINUTES', 15)
    while (true) {
      const startedAt = new Date()
      process.stdout.write(`RUN • ${startedAt.toISOString()}\n`)
      try {
        await runOnce('once')
      } catch (e) {
        process.stderr.write(String(e instanceof Error ? e.stack || e.message : e) + '\n')
      }
      await sleep(Math.max(5, minutes) * 60 * 1000)
    }
  }

  await runOnce(mode)
}

main().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
