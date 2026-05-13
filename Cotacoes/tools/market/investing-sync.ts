import * as dotenv from 'dotenv'
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { parseArgs } from './lib/args.js'
import { loadCalendarMatrixDbs, matchCalendarMatrix } from './lib/calendar-matrix-db.js'
import { buildMarketHistory } from './market-history.js'
import type { Asset, MarketPoint, MarketQuotes } from './types.js'

dotenv.config({ override: true, quiet: true })

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

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..')

function resolveFromProject(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p)
}

function resolveFromBase(baseDir: string, p: string) {
  return path.isAbsolute(p) ? p : path.resolve(baseDir, p)
}

function defaultAutomationDir() {
  return path.resolve(PROJECT_ROOT, '.edi-market-guardin')
}

function parseList(raw?: string | null) {
  const parts = String(raw || '')
    .split(/[\n,;]+/g)
    .map(s => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts))
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

async function fileExists(p: string) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function findLatestCsvInDirs(dirs: string[]) {
  const candidates = Array.from(new Set(dirs.map(d => String(d || '').trim()).filter(Boolean)))
  let best: { path: string; mtimeMs: number } | null = null

  for (const dir of candidates) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        if (!e.isFile()) continue
        const name = e.name || ''
        if (!name.toLowerCase().endsWith('.csv')) continue
        const full = path.join(dir, name)
        let st: Awaited<ReturnType<typeof stat>> | null = null
        try {
          st = await stat(full)
        } catch {
          st = null
        }
        if (!st) continue
        const mtimeMs = Number((st as unknown as { mtimeMs: number | bigint }).mtimeMs)
        if (!Number.isFinite(mtimeMs)) continue
        if (!best || mtimeMs > best.mtimeMs) best = { path: full, mtimeMs }
      }
    } catch {
      void 0
    }
  }

  return best
}

function normalizeCsvHeader(s: string) {
  return String(s || '')
    .trim()
    .replace(/^"+|"+$/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function looksLikeInvestingCsvHeaderLine(headerLine: string) {
  const raw = String(headerLine || '').trim()
  if (!raw) return false
  if (/^</.test(raw) && /html/i.test(raw)) return false
  const delimiter = raw.includes(';') ? ';' : raw.includes(',') ? ',' : raw.includes('\t') ? '\t' : null
  if (!delimiter) return false
  const headers = raw.split(delimiter).map(normalizeCsvHeader).filter(Boolean)
  if (headers.length < 3) return false

  const hasSymbol = headers.some(h => ['symbol', 'ticker', 'ativo', 'instrumento', 'codigo', 'codigos', 'cod.'].includes(h))
  const hasName = headers.some(h => ['name', 'nome'].includes(h))
  const hasLast = headers.some(h => ['last', 'ultimo', 'preco', 'preco de fechamento', 'price'].includes(h)) || headers.some(h => h.includes('ultimo') || h.includes('preco') || h.includes('price'))
  return hasSymbol && (hasLast || hasName)
}

async function validateInvestingCsvOrThrow(csvPath: string) {
  if (!envBool('INVESTING_CSV_VALIDATE', true)) return

  const st = await stat(csvPath)
  const minBytes = Math.max(256, envNumber('INVESTING_CSV_MIN_BYTES', 2048))
  if (!st || !Number.isFinite(st.size) || st.size < minBytes) {
    throw new Error(`CSV inválido (tamanho): ${path.basename(csvPath)} (${st && Number.isFinite(st.size) ? st.size : 'n/a'} bytes)`)
  }

  const raw = await readFile(csvPath, 'utf-8')
  const head = String(raw || '').trimStart().slice(0, 4096)
  if (!head) throw new Error(`CSV vazio: ${path.basename(csvPath)}`)
  if (/^<!doctype|^<html/i.test(head)) throw new Error(`CSV inválido (HTML): ${path.basename(csvPath)}`)

  const firstLine = String(raw.split(/\r?\n/)[0] || '').trim()
  if (!looksLikeInvestingCsvHeaderLine(firstLine)) {
    throw new Error(`CSV inválido (header inesperado): ${path.basename(csvPath)}`)
  }

  const minRows = Math.max(5, envNumber('INVESTING_CSV_MIN_ROWS', 50))
  const lines = raw.split(/\r?\n/).filter(l => String(l).trim().length > 0)
  if (lines.length - 1 < minRows) {
    throw new Error(`CSV inválido (poucas linhas): ${path.basename(csvPath)} (linhas=${Math.max(0, lines.length - 1)})`)
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

async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number, headers?: Record<string, string>) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Math.max(250, timeoutMs))
  try {
    const r = await fetch(url, { method: 'GET', headers, signal: controller.signal })
    if (!r.ok) {
      let head = ''
      try {
        const txt = await r.text()
        head = String(txt || '').trim().slice(0, 240)
      } catch {
        void 0
      }
      throw new Error(`HTTP ${r.status}${head ? ` • ${head}` : ''}`)
    }
    return (await r.json()) as T
  } finally {
    clearTimeout(t)
  }
}

async function fetchJsonPostWithTimeout<T>(url: string, timeoutMs: number, body: unknown, headers?: Record<string, string>) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), Math.max(250, timeoutMs))
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!r.ok) {
      let head = ''
      try {
        const txt = await r.text()
        head = String(txt || '').trim().slice(0, 240)
      } catch {
        void 0
      }
      throw new Error(`HTTP ${r.status}${head ? ` • ${head}` : ''}`)
    }
    return (await r.json()) as T
  } finally {
    clearTimeout(t)
  }
}

function numRaw(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v && typeof v === 'object' && 'raw' in v) return numRaw((v as { raw?: unknown }).raw)
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function strRaw(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'raw' in v) return strRaw((v as { raw?: unknown }).raw)
  if (v === null || v === undefined) return null
  const s = String(v)
  return s ? s : null
}

function findContractsDeep(v: unknown): unknown[] | null {
  if (!v) return null
  if (Array.isArray(v)) {
    for (const it of v) {
      const got = findContractsDeep(it)
      if (got) return got
    }
    return null
  }
  if (typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const direct = o.contracts
  if (Array.isArray(direct) && direct.length) {
    const first = direct[0] as Record<string, unknown>
    if (
      first &&
      typeof first === 'object' &&
      (Object.prototype.hasOwnProperty.call(first, 'contractSymbol') || Object.prototype.hasOwnProperty.call(first, 'symbol')) &&
      (Object.prototype.hasOwnProperty.call(first, 'expiration') || Object.prototype.hasOwnProperty.call(first, 'expirationDate'))
    ) {
      return direct
    }
  }
  for (const key of Object.keys(o)) {
    const got = findContractsDeep(o[key])
    if (got) return got
  }
  return null
}

function fmtMonthYearFromUnixSec(sec: number) {
  const d = new Date(sec * 1000)
  const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'short', year: 'numeric' }).formatToParts(d)
  const month = String(parts.find(p => p.type === 'month')?.value || '').replace('.', '')
  const year = String(parts.find(p => p.type === 'year')?.value || '')
  return `${month}/${year}`
}

async function writeZqCurveFile(
  outDir: string,
  opts: { timeoutMs: number; headless: boolean; investingUserDataDir: string; debugDir: string },
) {
  const enabled = envBool('MARKET_ZQ_CURVE_ENABLED', true)
  if (!enabled) return

  const timeoutMs = opts.timeoutMs
  const rootSymbol = env('MARKET_ZQ_CURVE_ROOT', 'ZQ=F')
  const items: Array<{
    vertex: string
    yahooSymbol: string
    expiration: number
    expirationFmt: string
    lastPrice: number
    impliedRatePct: number
    dayChange?: number | null
    dayChangePct?: number | null
  }> = []

  const max = Math.max(10, Math.min(600, envNumber('MARKET_ZQ_CURVE_MAX_CONTRACTS', 260)))
  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(rootSymbol)}?modules=futuresChain`
    const data = await fetchJsonWithTimeout<unknown>(url, Math.max(1500, timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const contracts = findContractsDeep(data) || []
    for (const c of contracts.slice(0, max)) {
      const c0 = c && typeof c === 'object' ? (c as Record<string, unknown>) : null
      const yahooSymbol = strRaw((c0 && (c0.contractSymbol ?? c0.symbol)) || null)
      const exp = numRaw((c0 && (c0.expiration ?? c0.expirationDate)) || null)
      const last = numRaw((c0 && c0.lastPrice) || null)
      const dayChange = numRaw((c0 && c0.change) || null)
      const dayChangePct = numRaw((c0 && c0.percentChange) || null)
      if (!yahooSymbol || !exp || last === null) continue
      const vertex = yahooSymbol.split('.')[0]
      const impliedRatePct = 100 - last
      items.push({
        vertex,
        yahooSymbol,
        expiration: exp,
        expirationFmt: fmtMonthYearFromUnixSec(exp),
        lastPrice: last,
        impliedRatePct,
        dayChange,
        dayChangePct,
      })
    }
  } catch {
    void 0
  }

  if (!items.length) {
    const monthCodes = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z']
    const monthsAhead = Math.max(12, Math.min(180, envNumber('MARKET_ZQ_CURVE_MONTHS_AHEAD', 84)))

    const toVertex = (d: Date) => {
      const m = d.getUTCMonth()
      const y = d.getUTCFullYear() % 100
      return `ZQ${monthCodes[m]}${String(y).padStart(2, '0')}`
    }

    const candidates: string[] = []
    const now = new Date()
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    for (let i = 0; i < monthsAhead; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))
      candidates.push(`${toVertex(d)}.CBT`)
    }

    type SparkLike = { indicators?: { quote?: Array<{ close?: Array<number | null> }> }; timestamp?: number[] }
    const extractLastTwoCloses = (chart: SparkLike | null) => {
      const closes = chart && chart.indicators && chart.indicators.quote && chart.indicators.quote[0] ? chart.indicators.quote[0].close || [] : []
      let last: number | null = null
      let prev: number | null = null
      for (let i = closes.length - 1; i >= 0; i--) {
        const v = closes[i]
        if (typeof v === 'number' && Number.isFinite(v)) {
          if (last === null) last = v
          else {
            prev = v
            break
          }
        }
      }
      return { last, prev }
    }

    const fetchSpark = async (symbols: string[]) => {
      const out = new Map<string, SparkLike>()
      if (!symbols.length) return out
      const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(','))}&range=5d&interval=1d`
      try {
        const data = await fetchJsonWithTimeout<YahooSparkResponse>(url, Math.max(1500, timeoutMs), {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
          Referer: 'https://finance.yahoo.com/',
        })
        const res = data && data.spark && Array.isArray(data.spark.result) ? data.spark.result : []
        for (const it of res) {
          const s = String(it && it.symbol ? it.symbol : '').trim()
          if (!s) continue
          const resp0 = it && it.response && Array.isArray(it.response) && it.response.length ? (it.response[0] as unknown) : null
          if (!resp0) continue
          out.set(s, resp0 as SparkLike)
        }
        return out
      } catch (e) {
        const msg = String(e instanceof Error ? e.message : e)
        const isBadRequest = /^HTTP\s+400\b/.test(msg)
        if (!isBadRequest || symbols.length <= 1) return out
        const mid = Math.ceil(symbols.length / 2)
        const left = await fetchSpark(symbols.slice(0, mid))
        const right = await fetchSpark(symbols.slice(mid))
        for (const [k, v] of left.entries()) out.set(k, v)
        for (const [k, v] of right.entries()) out.set(k, v)
        return out
      }
    }

    const chunkSize = 80
    for (let i = 0; i < candidates.length; i += chunkSize) {
      const batch = candidates.slice(i, i + chunkSize)
      const got = await fetchSpark(batch)
      for (const sym of batch) {
        const chart = got.get(sym) || null
        const extracted = extractLastTwoCloses(chart)
        const last = extracted.last
        const prev = extracted.prev
        if (last === null) continue
        const base = sym.split('.')[0]
        const mCode = base.slice(2, 3)
        const yy = Number(base.slice(3, 5))
        const month = monthCodes.indexOf(mCode)
        if (month < 0 || !Number.isFinite(yy)) continue
        const year = 2000 + yy
        const exp = Math.floor(Date.UTC(year, month, 1) / 1000)
        const dayChange = prev !== null ? (last - prev) : null
        const dayChangePct = prev !== null && prev !== 0 ? ((last - prev) / prev) * 100 : null
        items.push({
          vertex: base,
          yahooSymbol: sym,
          expiration: exp,
          expirationFmt: fmtMonthYearFromUnixSec(exp),
          lastPrice: last,
          impliedRatePct: 100 - last,
          dayChange,
          dayChangePct,
        })
        if (items.length >= max) break
      }
      if (items.length >= max) break
    }
  }

  items.sort((a, b) => a.expiration - b.expiration)

  const minContracts = Math.max(0, Math.min(600, envNumber('MARKET_ZQ_CURVE_MIN_CONTRACTS', 60)))
  if (items.length < minContracts) {
    try {
      const url = env(
        'MARKET_ZQ_CURVE_INVESTING_URL',
        'https://br.investing.com/rates-bonds/cbot-30-day-federal-funds-comp-c1-futures-contracts',
      )
      const context = await chromium.launchPersistentContext(opts.investingUserDataDir, {
        headless: opts.headless,
        acceptDownloads: false,
        viewport: { width: 1280, height: 720 },
      })
      const page = await context.newPage()
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
        try {
          await page.waitForTimeout(1200)
          await tryDismissBanners(page)
        } catch {
          void 0
        }
        try {
          await page.waitForFunction(() => {
            const tables = Array.from(document.querySelectorAll('table'))
            for (const t of tables) {
              const trs = Array.from(t.querySelectorAll('tbody tr'))
              for (const tr of trs) {
                const td0 = tr.querySelector('td')
                const m = String(td0 && td0.textContent ? td0.textContent : '').trim()
                if (/^[A-Za-zÀ-ÿ]{3}\.?\s+\d{2}$/.test(m)) return true
              }
            }
            return false
          }, { timeout: 15000 })
        } catch {
          void 0
        }

        const monthMap: Record<string, number> = {
          jan: 0,
          feb: 1,
          fev: 1,
          mar: 2,
          abr: 3,
          apr: 3,
          mai: 4,
          may: 4,
          jun: 5,
          jul: 6,
          ago: 7,
          aug: 7,
          set: 8,
          sep: 8,
          out: 9,
          oct: 9,
          nov: 10,
          dez: 11,
          dec: 11,
        }
        const monthCodes = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z']

        const rows: Array<{ m: string; last: string; chg?: string | null }> = []
        const seenRow = new Set<string>()
        let stable = 0
        for (let step = 0; step < 80; step++) {
          const got = (await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table')) as HTMLTableElement[]
            const out: Array<{ m: string; last: string; chg?: string | null }> = []
            for (const t of tables) {
              const trs = Array.from(t.querySelectorAll('tbody tr')) as HTMLTableRowElement[]
              for (const tr of trs) {
                const tds = Array.from(tr.querySelectorAll('td')) as HTMLTableCellElement[]
                if (tds.length < 2) continue
                const m = String(tds[0].textContent || '').trim()
                const last = String(tds[1].textContent || '').trim()
                const chg = tds.length >= 3 ? String(tds[2].textContent || '').trim() : ''
                if (!m || !last) continue
                if (!/^[A-Za-zÀ-ÿ]{3}\.?\s+\d{2}$/.test(m)) continue
                out.push({ m, last, chg: chg || null })
              }
            }
            return out
          })) as Array<{ m: string; last: string; chg?: string | null }>

          let added = 0
          for (const r of got) {
            const key = `${String(r.m || '').trim()}|${String(r.last || '').trim()}|${String(r.chg || '').trim()}`
            if (seenRow.has(key)) continue
            seenRow.add(key)
            rows.push(r)
            added++
          }

          if (added === 0) stable++
          else stable = 0
          if (stable >= 3) break

          await page.evaluate(() => window.scrollBy(0, Math.max(400, Math.floor(window.innerHeight * 0.85))))
          await page.waitForTimeout(450)
        }

        const seen = new Set<string>()
        for (const r of rows) {
          const mm = String(r.m || '').trim().replace('.', '')
          const lastRaw = String(r.last || '').replace(/\s/g, '').replace(',', '.')
          const chgRaw = String(r.chg || '').replace(/\s/g, '').replace(',', '.')
          const m = mm.split(/\s+/)
          if (m.length !== 2) continue
          const monKey = m[0].toLowerCase()
          const yy = Number(m[1])
          if (!Number.isFinite(yy)) continue
          const mon = monthMap[monKey]
          if (mon === undefined) continue
          const price = Number(lastRaw)
          if (!Number.isFinite(price)) continue
          const dayChange = chgRaw ? Number(chgRaw) : null
          const prev = dayChange !== null && Number.isFinite(dayChange) ? (price - dayChange) : null
          const dayChangePct = prev !== null && prev !== 0 ? (dayChange / prev) * 100 : null
          const year = 2000 + yy
          const vertex = `ZQ${monthCodes[mon]}${String(yy).padStart(2, '0')}`
          const yahooSymbol = `${vertex}.CBT`
          if (seen.has(yahooSymbol)) continue
          seen.add(yahooSymbol)
          const exp = Math.floor(Date.UTC(year, mon, 1) / 1000)
          items.push({
            vertex,
            yahooSymbol,
            expiration: exp,
            expirationFmt: fmtMonthYearFromUnixSec(exp),
            lastPrice: price,
            impliedRatePct: 100 - price,
            dayChange: dayChange !== null && Number.isFinite(dayChange) ? dayChange : null,
            dayChangePct: dayChangePct !== null && Number.isFinite(dayChangePct) ? dayChangePct : null,
          })
        }
      } catch (e) {
        try {
          await dumpDebug(page, opts.debugDir, 'zq_curve_investing_error')
        } catch {
          void 0
        }
        throw e
      } finally {
        await context.close().catch(() => void 0)
      }
    } catch {
      void 0
    }
  }

  const first = items.length ? items[0] : null
  const last = items.length ? items[items.length - 1] : null
  const slope = first && last ? last.impliedRatePct - first.impliedRatePct : null
  const riskMode = slope === null ? 'N/D' : slope > 0.05 ? 'RISK_OFF' : slope < -0.05 ? 'RISK_ON' : 'NEUTRO'

  const payload = {
    generatedAt: new Date().toISOString(),
    rootSymbol,
    contractCount: items.length,
    formula: 'implied_rate_pct = 100 - last_price',
    slopePct: slope,
    riskMode,
    items,
  }

  await writeFile(path.join(outDir, 'zq_curve.json'), JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'zq_curve.js'), `window.ZQ_CURVE_DATA=${JSON.stringify(payload)};`, 'utf-8')
}

async function writeUsTreasuryFuturesFile(outDir: string, opts: { timeoutMs: number }) {
  const enabled = envBool('MARKET_US_TSY_FUTURES_ENABLED', true)
  if (!enabled) return

  const timeoutMs = opts.timeoutMs
  const rootsRaw = env('MARKET_US_TSY_FUTURES_ROOTS', 'ZT=F,ZF=F,ZN=F,ZB=F,UB=F')
  const roots = String(rootsRaw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const tenorByRoot: Record<string, string> = {
    'ZT=F': '2Y',
    'ZF=F': '5Y',
    'ZN=F': '10Y',
    'ZB=F': '30Y',
    'UB=F': 'ULTRA',
  }

  type SparkLike = { indicators?: { quote?: Array<{ close?: Array<number | null> }> }; timestamp?: number[] }
  const fetchSpark = async (symbols: string[], opts2: { range: string; interval: string }) => {
    const out = new Map<string, SparkLike>()
    if (!symbols.length) return out
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(','))}&range=${encodeURIComponent(opts2.range)}&interval=${encodeURIComponent(opts2.interval)}`
    try {
      const data = await fetchJsonWithTimeout<YahooSparkResponse>(url, Math.max(1500, timeoutMs), {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      })
      const res = data && data.spark && Array.isArray(data.spark.result) ? data.spark.result : []
      for (const it of res) {
        const s = String(it && it.symbol ? it.symbol : '').trim()
        if (!s) continue
        const resp0 = it && it.response && Array.isArray(it.response) && it.response.length ? (it.response[0] as unknown) : null
        if (!resp0) continue
        out.set(s, resp0 as SparkLike)
      }
      return out
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e)
      const isBadRequest = /^HTTP\s+400\b/.test(msg)
      if (!isBadRequest || symbols.length <= 1) return out
      const mid = Math.ceil(symbols.length / 2)
      const left = await fetchSpark(symbols.slice(0, mid), opts2)
      const right = await fetchSpark(symbols.slice(mid), opts2)
      for (const [k, v] of left.entries()) out.set(k, v)
      for (const [k, v] of right.entries()) out.set(k, v)
      return out
    }
  }

  const sparkStats = (chart: SparkLike | null) => {
    const closes = chart && chart.indicators && chart.indicators.quote && chart.indicators.quote[0] ? chart.indicators.quote[0].close || [] : []
    const ts = chart && Array.isArray(chart.timestamp) ? chart.timestamp : null
    if (!Array.isArray(closes) || !closes.length) {
      return {
        price: null as number | null,
        change: null as number | null,
        changePct: null as number | null,
        asOf: null as string | null,
        rangePct: null as number | null,
      }
    }

    let firstIdx = -1
    let lastIdx = -1
    let lo: number | null = null
    let hi: number | null = null
    for (let i = 0; i < closes.length; i++) {
      const v = closes[i]
      if (typeof v !== 'number' || !Number.isFinite(v)) continue
      if (firstIdx < 0) firstIdx = i
      if (lo === null || v < lo) lo = v
      if (hi === null || v > hi) hi = v
    }
    for (let i = closes.length - 1; i >= 0; i--) {
      const v = closes[i]
      if (typeof v === 'number' && Number.isFinite(v)) {
        lastIdx = i
        break
      }
    }
    if (firstIdx < 0 || lastIdx < 0) {
      return {
        price: null as number | null,
        change: null as number | null,
        changePct: null as number | null,
        asOf: null as string | null,
        rangePct: null as number | null,
      }
    }

    const first = closes[firstIdx] as number
    const last = closes[lastIdx] as number
    const change = last - first
    const changePct = first !== 0 ? (change / first) * 100 : null
    const asOfTs = ts && ts[lastIdx] && Number.isFinite(ts[lastIdx]) ? ts[lastIdx] : null
    const asOf = asOfTs ? new Date(asOfTs * 1000).toISOString() : null
    const rangePct =
      lo !== null && hi !== null && last !== 0 && Number.isFinite(last) ? ((hi - lo) / last) * 100 : null

    return {
      price: Number.isFinite(last) ? last : null,
      change: Number.isFinite(change) && change !== 0 ? change : null,
      changePct: typeof changePct === 'number' && Number.isFinite(changePct) && changePct !== 0 ? changePct : null,
      asOf,
      rangePct: typeof rangePct === 'number' && Number.isFinite(rangePct) && rangePct !== 0 ? rangePct : null,
    }
  }

  const items: Array<{
    tenor: string
    rootSymbol: string
    vertex: string
    yahooSymbol: string
    expiration: number
    expirationFmt: string
    lastPrice: number
    dayChange?: number | null
    dayChangePct?: number | null
  }> = []

  for (const rootSymbol of roots) {
    try {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(rootSymbol)}?modules=futuresChain`
      const data = await fetchJsonWithTimeout<unknown>(url, Math.max(1500, timeoutMs), {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      })
      const contracts = findContractsDeep(data) || []
      const first = contracts.length ? contracts[0] : null
      const c0 = first && typeof first === 'object' ? (first as Record<string, unknown>) : null
      const yahooSymbol = strRaw((c0 && (c0.contractSymbol ?? c0.symbol)) || null)
      const exp = numRaw((c0 && (c0.expiration ?? c0.expirationDate)) || null)
      const last = numRaw((c0 && c0.lastPrice) || null)
      const dayChange = numRaw((c0 && c0.change) || null)
      const dayChangePct = numRaw((c0 && c0.percentChange) || null)
      if (!yahooSymbol || !exp || last === null) continue

      const vertex = yahooSymbol.split('.')[0]
      const tenor = tenorByRoot[rootSymbol] || rootSymbol.replace(/=F$/i, '').trim() || rootSymbol
      items.push({
        tenor,
        rootSymbol,
        vertex,
        yahooSymbol,
        expiration: exp,
        expirationFmt: fmtMonthYearFromUnixSec(exp),
        lastPrice: last,
        dayChange,
        dayChangePct,
      })
    } catch {
      void 0
    }
  }

  if (roots.length) {
    const haveRoot = new Set(items.map(it => String(it && it.rootSymbol ? it.rootSymbol : '').trim()))
    const missing = roots.filter(r => r && !haveRoot.has(r))
    if (missing.length) {
      const bySpark = new Map<string, SparkLike>()
      for (let i = 0; i < missing.length; i += 80) {
        const batch = missing.slice(i, i + 80)
        const got = await fetchSpark(batch, { range: '1d', interval: '5m' })
        for (const [k, v] of got.entries()) bySpark.set(k, v)
      }

      for (const rootSymbol of missing) {
        const ex = sparkStats(bySpark.get(rootSymbol) || null)
        if (ex.price === null) continue
        const tenor = tenorByRoot[rootSymbol] || rootSymbol.replace(/=F$/i, '').trim() || rootSymbol
        const vertex = rootSymbol.replace(/=F$/i, '').trim() || rootSymbol
        items.push({
          tenor,
          rootSymbol,
          vertex,
          yahooSymbol: rootSymbol,
          expiration: 0,
          expirationFmt: 'Contínuo',
          lastPrice: ex.price,
          dayChange: ex.change,
          dayChangePct: ex.changePct,
        })
      }
    }
  }

  const byTenor = new Map<string, (typeof items)[number]>()
  for (const it of items) {
    if (!it || !it.tenor) continue
    if (!byTenor.has(it.tenor)) byTenor.set(it.tenor, it)
  }

  const avgChangePct = (() => {
    const xs = items
      .map(it => (typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? it.dayChangePct : null))
      .filter((x): x is number => x !== null)
    if (!xs.length) return null
    return xs.reduce((a, b) => a + b, 0) / xs.length
  })()

  const slopeChangePct = (() => {
    const short = byTenor.get('2Y') || null
    const long = byTenor.get('30Y') || null
    const s = short && typeof short.dayChangePct === 'number' && Number.isFinite(short.dayChangePct) ? short.dayChangePct : null
    const l = long && typeof long.dayChangePct === 'number' && Number.isFinite(long.dayChangePct) ? long.dayChangePct : null
    if (s === null || l === null) return null
    return l - s
  })()

  const riskMode =
    avgChangePct === null ? 'N/D' : avgChangePct > 0.05 ? 'RISK_OFF' : avgChangePct < -0.05 ? 'RISK_ON' : 'NEUTRO'
  const shape = slopeChangePct === null ? 'N/D' : slopeChangePct > 0.05 ? 'STEEPEN' : slopeChangePct < -0.05 ? 'FLATTEN' : 'NEUTRO'

  const extrasRaw = env(
    'MARKET_US_TSY_FUTURES_EXTRAS',
    '^IRX,^FVX,^TNX,^TYX,SHY,IEI,IEF,TLH,TLT,SPTL,GOVT,VGSH,VGIT,VGLT,BIL,SGOV,TBIL,SHV,USFR,TFLO,FLOT,TIP,SCHP,VTIP,STIP,LTPZ,LQD,HYG,JNK,SHYG,IGSB',
  )
  const extraSymbols = String(extrasRaw || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const extraLabelBySymbol: Record<string, string> = {
    '^IRX': 'T-Bill 13W (yield)',
    '^FVX': 'US 5Y (yield)',
    '^TNX': 'US 10Y (yield)',
    '^TYX': 'US 30Y (yield)',
    SHY: 'SHY (1–3Y ETF)',
    IEI: 'IEI (3–7Y ETF)',
    IEF: 'IEF (7–10Y ETF)',
    TLH: 'TLH (10–20Y ETF)',
    TLT: 'TLT (20Y+ ETF)',
    SPTL: 'SPTL (Long Treasury ETF)',
    GOVT: 'GOVT (US Treasury ETF)',
    VGSH: 'VGSH (Short Treasury ETF)',
    VGIT: 'VGIT (Interm Treasury ETF)',
    VGLT: 'VGLT (Long Treasury ETF)',
    BIL: 'BIL (1–3M T-Bill ETF)',
    SGOV: 'SGOV (0–3M T-Bill ETF)',
    TBIL: 'TBIL (T-Bill ETF)',
    SHV: 'SHV (Short T-Bill ETF)',
    USFR: 'USFR (Floating Rate Treasury ETF)',
    TFLO: 'TFLO (Floating Rate Treasury ETF)',
    FLOT: 'FLOT (Floating Rate Notes ETF)',
    TIP: 'TIP (TIPS ETF)',
    SCHP: 'SCHP (TIPS ETF)',
    VTIP: 'VTIP (Short TIPS ETF)',
    STIP: 'STIP (0–5Y TIPS ETF)',
    LTPZ: 'LTPZ (Long TIPS ETF)',
    LQD: 'LQD (Crédito IG ETF)',
    HYG: 'HYG (Crédito HY ETF)',
    JNK: 'JNK (Crédito HY ETF)',
    SHYG: 'SHYG (Crédito HY curto ETF)',
    IGSB: 'IGSB (Crédito IG curto ETF)',
  }

  const extras: Array<{
    label: string
    yahooSymbol: string
    price: number | null
    dayChange?: number | null
    dayChangePct?: number | null
    intradayRangePct?: number | null
    signalScore?: number | null
    asOf?: string | null
  }> = []

  if (extraSymbols.length) {
    const bySpark = new Map<string, SparkLike>()
    for (let i = 0; i < extraSymbols.length; i += 80) {
      const batch = extraSymbols.slice(i, i + 80)
      const got = await fetchSpark(batch, { range: '1d', interval: '5m' })
      for (const [k, v] of got.entries()) bySpark.set(k, v)
    }

    const volWeight = Math.max(0, Math.min(2, envNumber('MARKET_US_TSY_FUTURES_VOL_WEIGHT', 0.35)))
    const calcScore = (dayPct: number | null, rangePct: number | null) => {
      if (dayPct === null || !Number.isFinite(dayPct)) return null as number | null
      const v = rangePct !== null && Number.isFinite(rangePct) ? rangePct : 0
      const mag = Math.abs(dayPct) + volWeight * v
      const score = dayPct >= 0 ? mag : -mag
      return Number.isFinite(score) ? score : null
    }

    for (const sym of extraSymbols) {
      const ex = sparkStats(bySpark.get(sym) || null)
      if (ex.price === null) continue
      const label = extraLabelBySymbol[sym] || sym
      const score = calcScore(ex.changePct, ex.rangePct)
      extras.push({
        label,
        yahooSymbol: sym,
        price: ex.price,
        dayChange: ex.change,
        dayChangePct: ex.changePct,
        intradayRangePct: ex.rangePct,
        signalScore: score,
        asOf: ex.asOf,
      })
    }
  }

  const creditVsTreasury = (() => {
    const idx = new Map<string, (typeof extras)[number]>()
    for (const it of extras) {
      const s = it && it.yahooSymbol ? String(it.yahooSymbol).trim() : ''
      if (!s) continue
      if (!idx.has(s)) idx.set(s, it)
    }

    const score = (sym: string) => {
      const it = idx.get(sym) || null
      const v = it && typeof it.signalScore === 'number' && Number.isFinite(it.signalScore) ? it.signalScore : null
      return v
    }

    const tlt = score('TLT')
    const hyg = score('HYG')
    const lqd = score('LQD')
    const jnk = score('JNK')
    const shyg = score('SHYG')

    const spreads: Array<{ k: string; val: number }> = []
    if (tlt !== null && hyg !== null) spreads.push({ k: 'HYG−TLT', val: hyg - tlt })
    if (tlt !== null && lqd !== null) spreads.push({ k: 'LQD−TLT', val: lqd - tlt })
    if (tlt !== null && jnk !== null) spreads.push({ k: 'JNK−TLT', val: jnk - tlt })
    if (tlt !== null && shyg !== null) spreads.push({ k: 'SHYG−TLT', val: shyg - tlt })

    if (!spreads.length) {
      return {
        ok: false,
        mode: 'N/D',
        avgSpreadScore: null as number | null,
        legs: { TLT: tlt, HYG: hyg, LQD: lqd, JNK: jnk, SHYG: shyg },
        spreads: [] as Array<{ key: string; spreadScore: number }>,
      }
    }

    const avgSpreadScore = spreads.reduce((a, b) => a + b.val, 0) / spreads.length
    const mode = avgSpreadScore > 0.18 ? 'RISK_ON' : avgSpreadScore < -0.18 ? 'FLIGHT_TO_QUALITY' : 'NEUTRO'

    return {
      ok: true,
      mode,
      avgSpreadScore,
      legs: { TLT: tlt, HYG: hyg, LQD: lqd, JNK: jnk, SHYG: shyg },
      spreads: spreads.map(s => ({ key: s.k, spreadScore: s.val })),
    }
  })()

  const payload = {
    generatedAt: new Date().toISOString(),
    roots,
    basis: 'futuresChain_or_spark',
    items,
    extras,
    creditVsTreasury,
    avgChangePct,
    slopeChangePct,
    riskMode,
    shape,
  }

  await writeFile(path.join(outDir, 'us_tsy_futures.json'), JSON.stringify(payload, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'us_tsy_futures.js'), `window.US_TSY_FUTURES_DATA=${JSON.stringify(payload)};`, 'utf-8')
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

  const lastCandidate = Number(parts[8])
  const altLast = Number(parts[7])
  const price = Number.isFinite(lastCandidate) ? lastCandidate : altLast
  if (!Number.isFinite(price)) return null
  const prevSettlement = Number(parts[10])
  const prevFallback = Number(parts[9])
  const base = Number.isFinite(prevSettlement) && prevSettlement !== 0 ? prevSettlement : prevFallback
  const change = Number.isFinite(base) ? (price - base) : NaN
  const changePct = Number.isFinite(base) && base !== 0 ? (change / base) * 100 : NaN
  return {
    name: name || null,
    price,
    change: Number.isFinite(change) ? change : null,
    changePct: Number.isFinite(changePct) ? changePct : null,
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

async function getLastPortfolioUpdatedAt(outDir: string) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const prev = await readJsonSafe<Partial<MarketQuotes>>(jsonPath)
  const meta = prev && prev.meta && typeof prev.meta === 'object' ? (prev.meta as MarketQuotes['meta']) : null
  const portfolioUpdatedAt = safeParseMs((meta as { portfolioUpdatedAt?: string } | null)?.portfolioUpdatedAt || null)
  return portfolioUpdatedAt
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
  input: { seriesKey: string; asset: Asset; price: number; change?: number | null; changePct?: number | null },
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
  const cleanedPoints =
    key === 'DCE_I0'
      ? points.filter(p => {
          const price = p && typeof p.price === 'number' && Number.isFinite(p.price) ? p.price : null
          const chg = p && typeof p.change === 'number' && Number.isFinite(p.change) ? p.change : null
          const chgPct = p && typeof p.changePct === 'number' && Number.isFinite(p.changePct) ? p.changePct : null
          if (price === null || chg === null || chgPct === null) return true
          if (Math.abs(chgPct) <= 30) return true
          if (Math.abs(chg) <= price * 0.3) return true
          return false
        })
      : points
  const prev = cleanedPoints.length ? cleanedPoints[cleanedPoints.length - 1] : null
  const point: MarketPoint = { t: generatedAt, price: input.price }

  if (typeof input.change === 'number' && Number.isFinite(input.change) && input.change !== 0) {
    point.change = input.change
    if (typeof input.changePct === 'number' && Number.isFinite(input.changePct) && input.changePct !== 0) {
      point.changePct = input.changePct
    }
  } else if (prev && typeof prev.price === 'number') {
    const change = input.price - prev.price
    if (Number.isFinite(change) && change !== 0) point.change = change
    if (prev.price !== 0) {
      const pct = (change / prev.price) * 100
      if (Number.isFinite(pct) && pct !== 0) point.changePct = pct
    }
  }

  const next = prev && prev.t === point.t ? cleanedPoints.slice(0, -1).concat([point]) : cleanedPoints.concat([point])
  series[key] = next

  assets.sort((a, b) => String(a.symbol || '').localeCompare(String(b.symbol || '')))
  parsed.assets = assets
  parsed.series = series
  await writeFile(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`, 'utf-8')
}

type YahooSparkQuote = {
  close?: Array<number | null>
}

type YahooSparkChartLike = {
  meta?: {
    symbol?: string
    currency?: string
  }
  timestamp?: number[]
  indicators?: {
    quote?: YahooSparkQuote[]
  }
}

type YahooSparkResultItem = {
  symbol?: string
  response?: YahooSparkChartLike[]
}

type YahooSparkResponse = {
  spark?: {
    result?: YahooSparkResultItem[]
    error?: unknown
  }
}

function parseSymbolOverrides(raw: string | undefined) {
  const out = new Map<string, string>()
  const text = String(raw || '').trim()
  if (!text) return out
  for (const part of text.split(/[;\n]+/g)) {
    const p = part.trim()
    if (!p) continue
    const idx = p.indexOf('=')
    if (idx <= 0) continue
    const left = p.slice(0, idx).trim()
    const right = p.slice(idx + 1).trim()
    if (!left || !right) continue
    out.set(left, right)
  }
  return out
}

function parseYahooSet(raw: string | undefined) {
  return new Set(parseList(raw).map(x => x.trim()).filter(Boolean))
}

function normalizeInvestingYahooCandidate(investingSymbol: string) {
  const raw = String(investingSymbol || '').trim()
  if (!raw) return ''

  const pair = raw.match(/^([A-Z0-9]{2,10})\/([A-Z0-9]{2,10})\b/)
  if (pair) return `${pair[1].toUpperCase()}/${pair[2].toUpperCase()}`

  return raw.replace(/\s+/g, ' ')
}

function isLikelyUnsupportedYahooSymbol(sym: string) {
  if (!sym) return true
  if (/=$/.test(sym)) return true
  if (/=RR$/i.test(sym)) return true
  if (/=R$/i.test(sym)) return true
  if (/=FEDR$/i.test(sym)) return true
  if (/^[A-Z0-9]+(?:M)?c\d+$/i.test(sym)) return true
  if (/^\./.test(sym)) return true
  if (/\s-\s/.test(sym)) return true
  if (/c\d+-/i.test(sym) || /-c\d+/i.test(sym)) return true
  if (/-BTC$/i.test(sym) && !/-USD$/i.test(sym)) return true
  if (sym.toUpperCase() === '^TYVIX') return true
  return false
}

function suggestYahooOverrideFromAuditItem(it: {
  assetSymbol: string
  yahooSymbol: string
  status: 'updated' | 'missing'
  reason?: string
}) {
  if (!it || it.status !== 'missing') return null
  const reason = String(it.reason || '')
  if (reason && reason !== 'not_returned') {
    const wantsFix = /=SA$/i.test(it.assetSymbol) || /=SA$/i.test(it.yahooSymbol) || /\s-\s/.test(it.assetSymbol) || /\s/.test(it.assetSymbol)
    if (!wantsFix) return null
  }

  const asset = String(it.assetSymbol || '').trim()
  if (!asset) return null

  const fixSa = asset.match(/^([A-Z]{4}\d{1,2})=SA$/i)
  if (fixSa) return `${fixSa[1].toUpperCase()}=${fixSa[1].toUpperCase()}.SA`

  const cryptoText = asset.match(/^([A-Z0-9]{2,10})\/(USD|USDT)\b/i)
  if (cryptoText) {
    const base = cryptoText[1].toUpperCase()
    const fiat = new Set([
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CHF',
      'AUD',
      'CAD',
      'NZD',
      'BRL',
      'MXN',
      'CNY',
      'CNH',
      'HKD',
      'SGD',
      'NOK',
      'SEK',
      'DKK',
      'ZAR',
      'TRY',
      'INR',
      'KRW',
      'TWD',
      'THB',
      'IDR',
      'MYR',
      'PHP',
      'PLN',
      'HUF',
      'CZK',
      'ILS',
      'SAR',
      'AED',
      'QAR',
      'KWD',
      'BHD',
      'OMR',
      'EGP',
      'ARS',
      'CLP',
      'COP',
      'PEN',
      'VND',
    ])
    const metals = new Set(['XAU', 'XAG'])
    if (!fiat.has(base) && !metals.has(base)) {
      return `${cryptoText[0].toUpperCase()}=${base}-${cryptoText[2].toUpperCase()}`
    }
  }

  const fxText = asset.match(/^([A-Z]{3})\/([A-Z]{3})\b/i)
  if (fxText) {
    const base = fxText[1].toUpperCase()
    const quote = fxText[2].toUpperCase()
    const fiat = new Set([
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CHF',
      'AUD',
      'CAD',
      'NZD',
      'BRL',
      'MXN',
      'CNY',
      'CNH',
      'HKD',
      'SGD',
      'NOK',
      'SEK',
      'DKK',
      'ZAR',
      'TRY',
      'INR',
      'KRW',
      'TWD',
      'THB',
      'IDR',
      'MYR',
      'PHP',
      'PLN',
      'HUF',
      'CZK',
      'ILS',
      'SAR',
      'AED',
      'QAR',
      'KWD',
      'BHD',
      'OMR',
      'EGP',
      'ARS',
      'CLP',
      'COP',
      'PEN',
      'VND',
    ])
    const metals = new Set(['XAU', 'XAG'])
    if ((fiat.has(base) || metals.has(base)) && fiat.has(quote)) return `${fxText[0].toUpperCase()}=${base}${quote}=X`
  }

  const suffix = asset.match(/^([A-Z0-9_]+)\.(O|K|PK)$/i)
  if (suffix) return `${suffix[0]}=${suffix[1]}`

  const brStock = asset.match(/^([A-Z]{4}\d{1,2})$/)
  if (brStock) return `${brStock[1]}=${brStock[1]}.SA`

  const cryptoUsdX = asset.match(/^([A-Z0-9]{2,10})USD=X$/i)
  if (cryptoUsdX) {
    const p = cryptoUsdX[1].toUpperCase()
    const fiat = new Set([
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CHF',
      'AUD',
      'CAD',
      'NZD',
      'BRL',
      'MXN',
      'CNY',
      'CNH',
      'HKD',
      'SGD',
      'NOK',
      'SEK',
      'DKK',
      'ZAR',
      'TRY',
      'INR',
      'KRW',
      'TWD',
      'THB',
      'IDR',
      'MYR',
      'PHP',
      'PLN',
      'HUF',
      'CZK',
      'ILS',
      'SAR',
      'AED',
      'QAR',
      'KWD',
      'BHD',
      'OMR',
      'EGP',
      'ARS',
      'CLP',
      'COP',
      'PEN',
      'VND',
    ])
    if (!fiat.has(p)) return `${asset}=${p}-USD`
  }

  return null
}

function yahooSymbolFromInvestingSymbol(investingSymbol: string, overrides: Map<string, string>) {
  const sym = normalizeInvestingYahooCandidate(investingSymbol)
  if (!sym) return null
  const overr = overrides.get(sym)
  if (overr) {
    const cand = normalizeInvestingYahooCandidate(overr)
    if (cand && isLikelyUnsupportedYahooSymbol(cand)) return null
    return overr
  }
  const overrRaw = overrides.get(String(investingSymbol || '').trim())
  if (overrRaw) {
    const cand = normalizeInvestingYahooCandidate(overrRaw)
    if (cand && isLikelyUnsupportedYahooSymbol(cand)) return null
    return overrRaw
  }

  const directMap: Record<string, string> = {
    '.BVSP': '^BVSP',
    '.CSI300': '000300.SS',
    '.DJI': '^DJI',
    '.DXY': 'DX-Y.NYB',
    '.GVZ': '^GVZ',
    '.MXX': '^MXX',
    '.NDX': '^NDX',
    '.OVX': '^OVX',
    '.SKEWX': '^SKEW',
    '.SSEC': '000001.SS',
    '.TNX': '^TNX',
    '.TYVIX': '^TYVIX',
    '.VIX9D': '^VIX9D',
    '.VXN': '^VXN',
    '.VVIX': '^VVIX',
    USDIDX: 'DX-Y.NYB',
    VIX: '^VIX',
    LCO: 'BZ=F',
  }
  if (directMap[sym]) return directMap[sym]

  const pairUsd = sym.match(/^([A-Z0-9]{2,10})\/(USD|USDT)$/)
  if (pairUsd) {
    const base = pairUsd[1].toUpperCase()
    const quote = pairUsd[2].toUpperCase()
    const fiat = new Set([
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'CHF',
      'AUD',
      'CAD',
      'NZD',
      'BRL',
      'MXN',
      'CNY',
      'CNH',
      'HKD',
      'SGD',
      'NOK',
      'SEK',
      'DKK',
      'ZAR',
      'TRY',
      'INR',
      'KRW',
      'TWD',
      'THB',
      'IDR',
      'MYR',
      'PHP',
      'PLN',
      'HUF',
      'CZK',
      'ILS',
      'SAR',
      'AED',
      'QAR',
      'KWD',
      'BHD',
      'OMR',
      'EGP',
      'ARS',
      'CLP',
      'COP',
      'PEN',
      'VND',
    ])
    const metals = new Set(['XAU', 'XAG'])
    if (fiat.has(base) || metals.has(base)) return `${base}${quote}=X`
    return `${base}-${quote}`
  }

  const cryptoPair = sym.match(/^([A-Z0-9]{2,10})\/(BTC|ETH)$/i)
  if (cryptoPair) return `${cryptoPair[1]}-${cryptoPair[2].toUpperCase()}`

  const fx = sym.match(/^([A-Z]{3})\/([A-Z]{3})$/)
  if (fx) return `${fx[1]}${fx[2]}=X`

  const ff = sym.match(/^FFc\d+$/i)
  if (ff) return 'ZQ=F'

  const usListed = sym.match(/^([A-Z0-9_]+)\.(O|K|PK)$/i)
  if (usListed) return usListed[1]

  const futuresMonth = sym.match(/^([A-Z]{1,3})([FGHJKMNQUVXZ])\d{2}$/)
  if (futuresMonth) {
    const root = futuresMonth[1]
    const futRoots = new Set([
      'ES',
      'NQ',
      'YM',
      'RTY',
      'CL',
      'NG',
      'HG',
      'GC',
      'SI',
      'ZC',
      'ZS',
      'ZM',
      'ZL',
      'ZW',
      'KE',
      'KC',
      'CT',
      'CC',
      'SB',
      'OJ',
      'LE',
      'HE',
      'PA',
      'PL',
      'RB',
      'HO',
      'BZ',
      'ZQ',
    ])
    if (futRoots.has(root)) return sym
  }

  if (isLikelyUnsupportedYahooSymbol(sym)) return null

  return sym
}

function parseYahooSymbolsSet(raw: string | undefined) {
  return new Set(parseList(raw).map(x => x.trim().toUpperCase()).filter(Boolean))
}

function getYahooFuturesRoots() {
  const cfg = parseYahooSymbolsSet(env('MARKET_YAHOO_FUTURES_ROOTS'))
  if (cfg.size) return cfg
  return new Set([
    'ES',
    'NQ',
    'YM',
    'RTY',
    'CL',
    'NG',
    'HG',
    'GC',
    'SI',
    'ZC',
    'ZS',
    'ZM',
    'ZL',
    'ZW',
    'KE',
    'KC',
    'CT',
    'CC',
    'SB',
    'OJ',
    'LE',
    'HE',
    'PA',
    'PL',
    'RB',
    'HO',
    'BZ',
    'LCO',
    'ZQ',
  ])
}

function yahooSymbolForAsset(assetSymbol: string, category: string | undefined, assetExchange: string | undefined, overrides: Map<string, string>) {
  const base = yahooSymbolFromInvestingSymbol(assetSymbol, overrides)
  if (!base) return null
  const ex = String(assetExchange || '').trim().toUpperCase()
  const isBr =
    ex === 'BVMF' ||
    ex === 'B3' ||
    ex === 'BMFBOVESPA' ||
    ex.endsWith('.SA') ||
    ex.includes('BOVESPA') ||
    ex.includes('BVMF') ||
    ex.includes('B3') ||
    ex.includes('BMF')
  if (/^[A-Z]{4}\d{1,2}$/.test(base) && !/\.SA$/i.test(base) && isBr) return `${base}.SA`
  const futRoots = getYahooFuturesRoots()
  const zqContract = base.match(/^ZQ[FGHJKMNQUVXZ]\d{2}$/)
  if (zqContract && envBool('MARKET_YAHOO_ZQ_CONTRACTS_CBT', true)) return `${base}.CBT`
  const fut = base.match(/^([A-Z]{1,3})([FGHJKMNQUVXZ])\d{2}$/)
  if (fut && envBool('MARKET_YAHOO_FUTURES_MONTHCODE_AS_F', true)) {
    const root = fut[1]
    if (futRoots.has(root)) return `${root}=F`
  }
  const cat = String(category || '').trim().toLowerCase()
  if (!cat) return base
  const futureCats = new Set(['commodities', 'agriculture', 'energy', 'metals'])
  if (!futureCats.has(cat)) return base
  if (!envBool('MARKET_YAHOO_FUTURES_SHORTCODE_AS_F', true)) return base
  if (/^[A-Z]{1,4}$/.test(base) && futRoots.has(base)) return `${base}=F`
  return base
}

function pruneByCutoff(points: MarketPoint[], cutoffMs: number) {
  const out: MarketPoint[] = []
  for (const p of points) {
    const t = p && typeof p.t === 'string' ? Date.parse(p.t) : NaN
    if (!Number.isFinite(t)) continue
    if (t >= cutoffMs) out.push(p)
  }
  return out
}

let cachedNonTickerFixableCfg: { symbols: Set<string>; categories: Set<string> } | null = null

function getNonTickerFixableCfg() {
  if (cachedNonTickerFixableCfg) return cachedNonTickerFixableCfg
  const symbols = new Set(parseList(env('MARKET_YAHOO_NONFIXABLE_SYMBOLS')).map(x => x.trim()).filter(Boolean))
  const categories = new Set(parseList(env('MARKET_YAHOO_NONFIXABLE_CATEGORIES')).map(x => x.trim().toLowerCase()).filter(Boolean))
  cachedNonTickerFixableCfg = { symbols, categories }
  return cachedNonTickerFixableCfg
}

function isNonTickerFixableMissing(category: string | undefined, yahooSymbol: string | undefined, reason: string | undefined) {
  const cat = String(category || '').toLowerCase()
  const y = String(yahooSymbol || '').trim()
  const r = String(reason || '').trim()
  if (r !== 'no_price' && r !== 'not_returned') return false
  const cfg = getNonTickerFixableCfg()
  if (cfg.symbols.has(y)) return true
  if (cfg.categories.has(cat)) return true
  if (y.startsWith('^')) return true
  if (cat === 'volatility' || cat === 'rates' || cat === 'bonds') return true
  const hard = new Set(['^GVZ', '^OVX', '^SKEW', '^VXN', '^VIX9D', '^VVIX', '^TNX'])
  if (hard.has(y)) return true
  return false
}

function parseScaleBounds(raw: string | undefined): [number, number] | null {
  const s = String(raw || '').trim()
  if (!s) return null
  const m = s.split(',').map(x => Number(x.trim()))
  if (m.length !== 2) return null
  const a = Number(m[0])
  const b = Number(m[1])
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  if (lo <= 0 || hi <= 0) return null
  return [lo, hi]
}

function getPriceScaleBoundsForCategory(catRaw: string | undefined): [number, number] {
  const cat = String(catRaw || '').trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_')
  const perCat = parseScaleBounds(env(`MARKET_YAHOO_PRICE_SCALE_${cat}`))
  if (perCat) return perCat
  const def = parseScaleBounds(env('MARKET_YAHOO_PRICE_SCALE_DEFAULT'))
  if (def) return def
  return [0.05, 20]
}

async function yahooSearchByName(q: string, timeoutMs: number) {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=en-US`
  try {
    const data = await fetchJsonWithTimeout<unknown>(url, Math.max(1500, timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const quotes =
      data && typeof data === 'object' && 'quotes' in data && Array.isArray((data as Record<string, unknown>).quotes)
        ? ((data as Record<string, unknown>).quotes as unknown[])
        : []
    return quotes
  } catch {
    return []
  }
}

type TradingViewSearchItem = {
  symbol?: string
  full_name?: string
  description?: string
  exchange?: string
  type?: string
}

type TradingViewScanResponse = {
  data?: Array<{ s?: string; d?: unknown[] }>
}

function normalizeLooseText(s: string) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tradingViewPreferredExchanges(asset: Asset) {
  const ex = String(asset.exchange || '').trim().toUpperCase()
  if (!ex) return [] as string[]
  if (ex === 'BVMF' || ex === 'B3' || ex.includes('BOVESPA')) return ['BMFBOVESPA']
  if (ex === 'HKEX' || ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX' || ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX' || ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX' || ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'HKEX') return ['HKEX']
  if (ex === 'BO') return ['BSE']
  if (ex === 'LON' && /futuros|metal|aluminio|cobre|niquel|zinco|chumbo|estanho/i.test(String(asset.name || ''))) return ['LME']
  return [ex]
}

function tradingViewPreferredType(category: string) {
  const cat = String(category || '').trim().toLowerCase()
  if (cat === 'fx_g10' || cat === 'fx_emerging' || cat === 'fx') return 'forex'
  if (cat === 'crypto') return 'crypto'
  if (cat === 'equities' || cat === 'emerging') return 'stock'
  if (cat === 'volatility') return 'index'
  if (cat === 'rates' || cat === 'bonds') return 'bond'
  if (cat === 'metals' || cat === 'commodities' || cat === 'agriculture' || cat === 'energy') return 'futures'
  return ''
}

function tradingViewQueryHints(asset: Asset) {
  const sym = String(asset.symbol || '').trim()
  const name = String(asset.name || '').trim()
  const out: string[] = []
  if (sym) out.push(sym)
  if (name) out.push(name)
  const normalized = normalizeLooseText(name)
  const baseMap: Array<[RegExp, string]> = [
    [/\balumin/i, 'aluminum'],
    [/\bcobre\b|\bcopper\b/, 'copper'],
    [/\bniquel\b|\bnickel\b/, 'nickel'],
    [/\bzinco\b|\bzinc\b/, 'zinc'],
    [/\bestanho\b|\btin\b/, 'tin'],
    [/\bchumbo\b|\blead\b/, 'lead'],
    [/\bminerio\b|\biron\b/, 'iron ore'],
    [/\btrigo\b|\bwheat\b/, 'wheat'],
    [/\bcelulos\b|\bpulp\b/, 'pulp'],
    [/\bcarbon\b|\bcredito\b/, 'carbon'],
  ]
  for (const [rx, hint] of baseMap) {
    if (rx.test(normalized)) out.push(hint)
  }
  return Array.from(new Set(out.filter(Boolean))).slice(0, 5)
}

async function tradingViewSymbolSearch(text: string, opts: { timeoutMs: number; exchange?: string | null }) {
  const q = String(text || '').trim()
  if (!q) return [] as TradingViewSearchItem[]
  const ex = String(opts.exchange || '').trim()
  const url =
    `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(q)}` +
    `&hl=1&lang=en` +
    (ex ? `&exchange=${encodeURIComponent(ex)}` : '')
  try {
    const data = await fetchJsonWithTimeout<unknown>(url, Math.max(1500, opts.timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Origin: 'https://www.tradingview.com',
      Referer: 'https://www.tradingview.com/',
      'Accept-Language': 'en-US,en;q=0.9',
    })
    const arr = Array.isArray(data) ? (data as TradingViewSearchItem[]) : []
    const stripTags = (s: string) => String(s || '').replace(/<[^>]+>/g, '').trim()
    return arr.map(it => {
      const full = stripTags(String(it.full_name || ''))
      if (full) return { ...it, full_name: full }
      const symbol = stripTags(String(it.symbol || ''))
      if (!symbol) return it
      const sourceId = stripTags(String((it as unknown as Record<string, unknown>).source_id || ''))
      if (sourceId && !sourceId.includes(' ')) return { ...it, full_name: `${sourceId}:${symbol}` }
      const exch = stripTags(String(it.exchange || ''))
      if (exch && !exch.includes(' ') && exch === exch.toUpperCase()) return { ...it, full_name: `${exch}:${symbol}` }
      return it
    })
  } catch {
    return []
  }
}

async function tradingViewScanLastPrice(scanTicker: string, timeoutMs: number) {
  const t = String(scanTicker || '').trim()
  if (!t) return null as null | { price: number; usedColumn: string; updateMode: string | null }
  const url = 'https://scanner.tradingview.com/global/scan'
  const headers = {
    'User-Agent': 'Mozilla/5.0',
    Origin: 'https://www.tradingview.com',
    Referer: 'https://www.tradingview.com/',
  }
  const candidates: Array<{ cols: string[]; usedColumn: string }> = [
    { cols: ['close|1', 'update_mode'], usedColumn: 'close|1' },
    { cols: ['close|5', 'update_mode'], usedColumn: 'close|5' },
    { cols: ['close', 'update_mode'], usedColumn: 'close' },
    { cols: ['close'], usedColumn: 'close' },
  ]
  for (const c of candidates) {
    try {
      const payload = { symbols: { tickers: [t], query: { types: [] } }, columns: c.cols }
      const body = await fetchJsonPostWithTimeout<TradingViewScanResponse>(url, Math.max(1500, timeoutMs), payload, headers)
      const row = body && Array.isArray(body.data) && body.data.length ? body.data[0] : null
      const d = row && Array.isArray(row.d) ? row.d : null
      if (!d || !d.length) continue
      const val = d[0]
      const price = typeof val === 'number' && Number.isFinite(val) ? val : Number.isFinite(Number(val)) ? Number(val) : null
      if (price === null || price <= 0) continue
      const updateMode = c.cols.includes('update_mode') && d.length >= 2 ? (d[1] !== null && d[1] !== undefined ? String(d[1]) : null) : null
      return { price, usedColumn: c.usedColumn, updateMode }
    } catch {
      void 0
    }
  }
  return null
}

async function mergeYahooQuotesIntoMarketQuotes(outDir: string, opts: { maxSymbols: number; timeoutMs: number }) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as MarketQuotes
  if (!parsed || !Array.isArray(parsed.assets) || !parsed.series || !parsed.meta) return

  const nowIso = new Date().toISOString()
  const retentionDays = Number(parsed.meta.retentionDays || 5)
  const cutoffMs = Date.now() - Math.max(1, retentionDays) * 24 * 60 * 60 * 1000

  const overrides = parseSymbolOverrides(env('MARKET_YAHOO_SYMBOL_OVERRIDES'))
  if (!overrides.has('CHINA50')) overrides.set('CHINA50', 'XIN9.FGI')
  const sx5e = overrides.get('SX5E.S')
  if (!sx5e || sx5e === '^STOXX50E') overrides.set('SX5E.S', 'SX5E.SW')
  if (!overrides.has('0P0000N9A6')) overrides.set('0P0000N9A6', '000016.SS')
  const axia = overrides.get('AXIA_p.K')
  if (!axia || axia === 'AXIA_p') overrides.set('AXIA_p.K', 'EBR')
  if (!overrides.has('CIGc')) overrides.set('CIGc', 'CIG')
  if (!overrides.has('HSIQJ6')) overrides.set('HSIQJ6', '^HSI')
  const jbs = overrides.get('JBSAY.PK')
  if (!jbs || jbs === 'JBSAY') overrides.set('JBSAY.PK', 'JBSS3.SA')
  if (!overrides.has('GPR')) overrides.set('GPR', 'RB=F')
  if (!overrides.has('FBR')) overrides.set('FBR', 'SUZ')
  if (!overrides.has('Wv1')) overrides.set('Wv1', 'ZW=F')
  const includeCategories = new Set(parseList(env('MARKET_YAHOO_INCLUDE_CATEGORIES')).map(x => x.toLowerCase()))
  const excludeCategories = new Set(parseList(env('MARKET_YAHOO_EXCLUDE_CATEGORIES')).map(x => x.toLowerCase()))
  const includeSymbols = parseYahooSet(env('MARKET_YAHOO_INCLUDE_SYMBOLS'))
  const excludeSymbols = parseYahooSet(env('MARKET_YAHOO_EXCLUDE_SYMBOLS'))
  excludeSymbols.add('.TYVIX')
  excludeSymbols.add('^TYVIX')
  excludeSymbols.add('AXIA_p.K')
  excludeSymbols.add('JBSAY.PK')
  const assets = parsed.assets
  const series: Record<string, MarketPoint[]> = parsed.series

  const assetBySymbol = new Map<string, Asset>()
  const byCategory = new Map<string, { assets: number; attempted: number; updated: number; missing: number }>()
  for (const a of assets) {
    const sym = String(a && a.symbol ? a.symbol : '').trim()
    if (!sym) continue
    assetBySymbol.set(sym, a)
    const cat = String(a && a.category ? a.category : 'n/d') || 'n/d'
    const cur = byCategory.get(cat) || { assets: 0, attempted: 0, updated: 0, missing: 0 }
    cur.assets += 1
    byCategory.set(cat, cur)
  }

  const plan: Array<{ assetSymbol: string; yahooSymbol: string }> = []
  for (const a of assets) {
    const assetSymbol = String(a && a.symbol ? a.symbol : '').trim()
    if (!assetSymbol) continue
    const category = String(a && a.category ? a.category : 'n/d').trim().toLowerCase()
    if (includeSymbols.size && !includeSymbols.has(assetSymbol)) continue
    if (excludeSymbols.has(assetSymbol)) continue
    const explicitSymbol = includeSymbols.size > 0 && includeSymbols.has(assetSymbol)
    if (!explicitSymbol) {
      if (includeCategories.size && !includeCategories.has(category)) continue
      if (excludeCategories.has(category)) continue
    }
    const yahooSymbol = yahooSymbolForAsset(assetSymbol, category, a && a.exchange ? String(a.exchange) : undefined, overrides)
    if (!yahooSymbol) continue
    plan.push({ assetSymbol, yahooSymbol })
  }

  const maxSymbols = Math.max(1, Math.min(2000, Math.trunc(opts.maxSymbols)))
  const uniqueYahoo = Array.from(new Set(plan.map(p => p.yahooSymbol))).slice(0, maxSymbols)
  if (!uniqueYahoo.length) return

  const byYahoo = new Map<string, YahooSparkChartLike>()
  const chunkSize = 80

  const fetchSpark = async (
    symbols: string[],
    opts2: { range: string; interval: string },
  ): Promise<Map<string, YahooSparkChartLike>> => {
    const out = new Map<string, YahooSparkChartLike>()
    if (!symbols.length) return out
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(','))}&range=${encodeURIComponent(opts2.range)}&interval=${encodeURIComponent(opts2.interval)}`
    try {
      const data = await fetchJsonWithTimeout<YahooSparkResponse>(url, Math.max(1500, opts.timeoutMs), {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      })
      const items = data && data.spark && Array.isArray(data.spark.result) ? data.spark.result : []
      for (const it of items) {
        const s = String(it && it.symbol ? it.symbol : '').trim()
        if (!s) continue
        const resp0 = it && Array.isArray(it.response) && it.response.length ? it.response[0] : null
        if (!resp0) continue
        out.set(s, resp0)
      }
      return out
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e)
      const isBadRequest = /^HTTP\s+400\b/.test(msg)
      if (!isBadRequest || symbols.length <= 1) return out
      const mid = Math.ceil(symbols.length / 2)
      const left = await fetchSpark(symbols.slice(0, mid), opts2)
      const right = await fetchSpark(symbols.slice(mid), opts2)
      for (const [k, v] of left.entries()) out.set(k, v)
      for (const [k, v] of right.entries()) out.set(k, v)
      return out
    }
  }

  const fetchInto = async (target: Map<string, YahooSparkChartLike>, symbols: string[], opts2: { range: string; interval: string }) => {
    for (let i = 0; i < symbols.length; i += chunkSize) {
      const batch = symbols.slice(i, i + chunkSize)
      const got = await fetchSpark(batch, opts2)
      for (const [k, v] of got.entries()) target.set(k, v)
    }
  }

  const selectedYahooSet = new Set(uniqueYahoo)
  const selectedPlan = plan.filter(p => selectedYahooSet.has(p.yahooSymbol))
  const skippedAssets = Math.max(0, plan.length - selectedPlan.length)

  await fetchInto(byYahoo, uniqueYahoo, { range: '1d', interval: '5m' })

  const extractSpark = (chart: YahooSparkChartLike | undefined | null) => {
    const closes = chart && chart.indicators && chart.indicators.quote && chart.indicators.quote[0] ? chart.indicators.quote[0].close : null
    const ts = chart && Array.isArray(chart.timestamp) ? chart.timestamp : null
    if (!closes || !Array.isArray(closes) || !closes.length) return { price: null as number | null, asOf: null as string | null, change: null as number | null, changePct: null as number | null }

    let firstIdx = -1
    let lastIdx = -1
    for (let i = 0; i < closes.length; i++) {
      const v = closes[i]
      if (typeof v === 'number' && Number.isFinite(v)) {
        firstIdx = i
        break
      }
    }
    for (let i = closes.length - 1; i >= 0; i--) {
      const v = closes[i]
      if (typeof v === 'number' && Number.isFinite(v)) {
        lastIdx = i
        break
      }
    }
    if (firstIdx < 0 || lastIdx < 0) return { price: null as number | null, asOf: null as string | null, change: null as number | null, changePct: null as number | null }

    const first = closes[firstIdx] as number
    const last = closes[lastIdx] as number
    const asOfTs = ts && ts[lastIdx] && Number.isFinite(ts[lastIdx]) ? ts[lastIdx] : null
    const asOf = asOfTs ? new Date(asOfTs * 1000).toISOString() : null

    const change = last - first
    const changePct = first !== 0 ? (change / first) * 100 : null
    return {
      price: last,
      asOf,
      change: Number.isFinite(change) && change !== 0 ? change : null,
      changePct: typeof changePct === 'number' && Number.isFinite(changePct) && changePct !== 0 ? changePct : null,
    }
  }

  let updated = 0
  let covered = 0
  let dailyFallbackUsed = 0
  let quoteFallbackUsed = 0
  let nameResolvedUsed = 0
  const updatedSymbols: string[] = []
  const missingSymbols: string[] = []
  const auditItems: Array<{
    assetSymbol: string
    category: string
    yahooSymbol: string
    status: 'updated' | 'missing'
    reason?: 'not_returned' | 'no_price' | 'price_mismatch'
    price?: number
    nonTickerFixable?: boolean
    dataInterval?: '5m' | '1d'
    resolvedBy?: 'symbol' | 'name' | 'tradingview'
    tradingViewSymbol?: string
    tradingViewUsedColumn?: string
    tradingViewUpdateMode?: string | null
  }> = []

  const dailyFallbackEnabled = envBool('MARKET_YAHOO_DAILY_FALLBACK_ENABLED', true)
  const dailyFallbackMax = Math.max(0, Math.min(800, Math.trunc(envNumber('MARKET_YAHOO_DAILY_FALLBACK_MAX_SYMBOLS', 160))))
  const dailyFallbackSymbols = new Set<string>()
  for (const p of selectedPlan) {
    const q = byYahoo.get(p.yahooSymbol)
    if (!q) {
      dailyFallbackSymbols.add(p.yahooSymbol)
      continue
    }
    const extracted = extractSpark(q)
    if (extracted.price === null) dailyFallbackSymbols.add(p.yahooSymbol)
  }

  const byYahooDaily = new Map<string, YahooSparkChartLike>()
  if (dailyFallbackEnabled && dailyFallbackSymbols.size) {
    const list = Array.from(dailyFallbackSymbols).slice(0, dailyFallbackMax)
    await fetchInto(byYahooDaily, list, { range: '5d', interval: '1d' })
  }

  const quoteFallbackEnabled = envBool('MARKET_YAHOO_QUOTE_FALLBACK_ENABLED', true)
  const quoteFallbackMax = Math.max(0, Math.min(1200, Math.trunc(envNumber('MARKET_YAHOO_QUOTE_FALLBACK_MAX_SYMBOLS', 240))))
  const byYahooQuote = new Map<
    string,
    { price: number; asOf: string | null; change: number | null; changePct: number | null }
  >()
  const fetchQuote = async (symbols: string[]) => {
    const out = new Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>()
    if (!symbols.length) return out
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`
    try {
      const data = await fetchJsonWithTimeout<unknown>(url, Math.max(1500, opts.timeoutMs), {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
        Referer: 'https://finance.yahoo.com/',
      })
      const items =
        data &&
        typeof data === 'object' &&
        'quoteResponse' in data &&
        (data as Record<string, unknown>).quoteResponse &&
        typeof (data as Record<string, unknown>).quoteResponse === 'object' &&
        'result' in ((data as Record<string, unknown>).quoteResponse as Record<string, unknown>) &&
        Array.isArray(((data as Record<string, unknown>).quoteResponse as Record<string, unknown>).result)
          ? (((data as Record<string, unknown>).quoteResponse as Record<string, unknown>).result as unknown[])
          : []
      for (const it of items) {
        const it0 = it && typeof it === 'object' ? (it as Record<string, unknown>) : null
        const s = String(it0 && it0.symbol ? it0.symbol : '').trim()
        const price = typeof (it0 && it0.regularMarketPrice) === 'number' && Number.isFinite(it0.regularMarketPrice as number) ? (it0.regularMarketPrice as number) : null
        if (!s || price === null) continue
        const ts =
          typeof (it0 && it0.regularMarketTime) === 'number' && Number.isFinite(it0.regularMarketTime as number)
            ? (it0.regularMarketTime as number)
            : null
        const asOf = ts ? new Date(ts * 1000).toISOString() : null
        const change =
          typeof (it0 && it0.regularMarketChange) === 'number' &&
          Number.isFinite(it0.regularMarketChange as number) &&
          (it0.regularMarketChange as number) !== 0
            ? (it0.regularMarketChange as number)
            : null
        const changePct =
          typeof (it0 && it0.regularMarketChangePercent) === 'number' &&
          Number.isFinite(it0.regularMarketChangePercent as number) &&
          (it0.regularMarketChangePercent as number) !== 0
            ? (it0.regularMarketChangePercent as number)
            : null
        out.set(s, { price, asOf, change, changePct })
      }
      return out
    } catch {
      return out
    }
  }
  if (quoteFallbackEnabled && dailyFallbackSymbols.size) {
    const list = Array.from(dailyFallbackSymbols).slice(0, quoteFallbackMax)
    for (let i = 0; i < list.length; i += 80) {
      const batch = list.slice(i, i + 80)
      const got = await fetchQuote(batch)
      for (const [k, v] of got.entries()) byYahooQuote.set(k, v)
    }
  }

  const nameSearchEnabled = envBool('MARKET_YAHOO_NAME_SEARCH_ENABLED', false)
  const nameSearchMax = Math.max(0, Math.min(200, envNumber('MARKET_YAHOO_NAME_SEARCH_MAX', 20)))
  const nameSearchAllowed = new Set(['EQUITY', 'ETF', 'INDEX', 'CURRENCY', 'CRYPTOCURRENCY', 'FUTURE'])
  const nameOverrideSuggested = new Set<string>()
  const nameResolvedCache = new Map<string, string>()

  const tradingViewEnabled = envBool('MARKET_TRADINGVIEW_FALLBACK_ENABLED', true)
  const tradingViewMax = Math.max(0, Math.min(240, Math.trunc(envNumber('MARKET_TRADINGVIEW_FALLBACK_MAX', 40))))
  const tradingViewTimeoutMs = Math.max(1500, envNumber('MARKET_TRADINGVIEW_TIMEOUT_MS', Math.max(6000, opts.timeoutMs)))
  const tradingViewOverrides = parseSymbolOverrides(env('MARKET_TRADINGVIEW_SYMBOL_OVERRIDES'))
  const tradingViewResolvedCache = new Map<string, string>()
  const tradingViewOverrideSuggested = new Set<string>()
  let tradingViewUsed = 0

  const resolveByTradingViewIfEnabled = async (asset: Asset | undefined | null, category: string) => {
    if (!tradingViewEnabled) return null as null | { tradingViewSymbol: string; price: number; usedColumn: string; updateMode: string | null }
    if (!asset || !asset.symbol) return null
    if (tradingViewUsed >= tradingViewMax) return null
    const assetKey = String(asset.symbol || '').trim()
    if (!assetKey) return null

    const cached = tradingViewResolvedCache.get(assetKey)
    let tv = cached || ''
    let usedExplicitOverride = false
    if (!tv) {
      const direct =
        tradingViewOverrides.get(assetKey) ||
        tradingViewOverrides.get(normalizeInvestingYahooCandidate(assetKey)) ||
        tradingViewOverrides.get(String(assetKey).toUpperCase())
      if (direct) {
        tv = String(direct).trim()
        usedExplicitOverride = true
      }
    }

    const preferredType = tradingViewPreferredType(category)
    const preferredExchanges = tradingViewPreferredExchanges(asset)
    const nameNorm = normalizeLooseText(String(asset.name || ''))
    const hints = tradingViewQueryHints(asset)

    if (!tv) {
      let best: { fullName: string; score: number } | null = null
      const rank = (it: TradingViewSearchItem) => {
        const full = String(it.full_name || '').trim()
        if (!full || !full.includes(':')) return null
        const sym = String(it.symbol || '').trim()
        const ex = String(it.exchange || '').trim().toUpperCase()
        const tp = String(it.type || '').trim().toLowerCase()
        const desc = normalizeLooseText(String(it.description || ''))
        let score = 0
        if (preferredType && tp === preferredType) score += 30
        if (preferredType && tp && tp !== preferredType) score -= 10
        if (preferredExchanges.length && preferredExchanges.includes(ex)) score += 60
        if (sym && normalizeLooseText(sym) === normalizeLooseText(assetKey)) score += 25
        if (desc && nameNorm && desc.includes(nameNorm.slice(0, 8))) score += 10
        return { fullName: full, score }
      }

      for (const q of hints) {
        if (best && best.score >= 95) break
        for (const ex of (preferredExchanges.length ? preferredExchanges : [''])) {
          const items = await tradingViewSymbolSearch(q, { timeoutMs: tradingViewTimeoutMs, exchange: ex || null })
          for (const it of items.slice(0, 60)) {
            const ranked = rank(it)
            if (!ranked) continue
            if (!best || ranked.score > best.score) best = ranked
          }
          if (best && best.score >= 95) break
        }
      }

      tv = best ? best.fullName : ''
    }

    if (!tv) return null
    tradingViewResolvedCache.set(assetKey, tv)
    if (!usedExplicitOverride) {
      const k = String(assetKey || '').trim()
      if (k && !tradingViewOverrides.has(k) && tv.includes(':')) tradingViewOverrideSuggested.add(`${k}=${tv}`)
    }

    const scan = await tradingViewScanLastPrice(tv, tradingViewTimeoutMs)
    if (!scan) return null

    const prevPoints = Array.isArray(series[assetKey]) ? series[assetKey] : []
    const prev = prevPoints.length ? prevPoints[prevPoints.length - 1] : null
    if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price > 0) {
      const bounds = getPriceScaleBoundsForCategory(category)
      const ratio = scan.price / prev.price
      if (!Number.isFinite(ratio) || ratio < bounds[0] || ratio > bounds[1]) return null
    }

    tradingViewUsed += 1
    return { tradingViewSymbol: tv, price: scan.price, usedColumn: scan.usedColumn, updateMode: scan.updateMode }
  }

  const fetchBestChartForSymbol = async (symbol: string) => {
    const sym = String(symbol || '').trim()
    if (!sym) return { chart: null as YahooSparkChartLike | null, dataInterval: '1d' as '5m' | '1d' }
    const intraday = await fetchSpark([sym], { range: '1d', interval: '5m' })
    const q0 = intraday.get(sym) || null
    if (q0) {
      const ex0 = extractSpark(q0)
      if (ex0.price !== null) return { chart: q0, dataInterval: '5m' as const }
    }
    const daily = await fetchSpark([sym], { range: '5d', interval: '1d' })
    const q1 = daily.get(sym) || null
    if (!q1) return { chart: null, dataInterval: '1d' as const }
    const ex1 = extractSpark(q1)
    if (ex1.price === null) return { chart: null, dataInterval: '1d' as const }
    return { chart: q1, dataInterval: '1d' as const }
  }

  const resolveByNameIfEnabled = async (asset: Asset | undefined | null, category: string, attemptedYahooSymbol: string) => {
    if (!nameSearchEnabled) return null as null | { yahooSymbol: string; chart: YahooSparkChartLike; dataInterval: '5m' | '1d' }
    if (!asset || !asset.name) return null
    if (nameResolvedUsed >= nameSearchMax) return null
    const assetKey = String(asset.symbol || '').trim()
    if (!assetKey) return null
    if (overrides.has(assetKey)) return null

    const cached = nameResolvedCache.get(assetKey)
    let cand = cached || ''
    if (!cand) {
      const quotes = await yahooSearchByName(String(asset.name || '').trim(), opts.timeoutMs)
      const cat = String(category || '').trim().toLowerCase()
      const looksIndexLike = /(^|\b)(DE40|UK100|HK50|JP225|CHINA50|US30|US500|NAS100|EUR50|SX5E|VIX)(\b|$)/i.test(assetKey) || /\b\d{2,3}\b/.test(assetKey)
      const wantsIndex = looksIndexLike || cat === 'volatility'
      const wantsFuture = cat === 'commodities' || cat === 'agriculture' || cat === 'energy' || cat === 'metals'
      const wantsCrypto = /\/(USD|USDT)\b/i.test(assetKey) && !(cat === 'fx_g10' || cat === 'fx_emerging')

      let best: { sym: string; score: number; qt: string } | null = null
      for (const q of quotes) {
        if (!q || typeof q !== 'object') continue
        const qo = q as Record<string, unknown>
        const sym = String(typeof qo.symbol === 'string' ? qo.symbol : '').trim()
        if (!sym || /\s/.test(sym)) continue
        const qt = String(typeof qo.quoteType === 'string' ? qo.quoteType : '').trim().toUpperCase()
        if (qt && !nameSearchAllowed.has(qt)) continue

        let score = 1000
        if (sym.startsWith('^')) score -= 120
        if (qt === 'INDEX') score -= 100
        if (qt === 'CURRENCY') score -= 60
        if (qt === 'CRYPTOCURRENCY') score -= 60
        if (qt === 'FUTURE') score -= 40
        if (qt === 'ETF') score -= 10
        if (qt === 'EQUITY') score -= 5

        if (wantsIndex) {
          if (qt !== 'INDEX' && !sym.startsWith('^')) score += 200
        }
        if (wantsCrypto) {
          if (qt !== 'CRYPTOCURRENCY' && !/-USD$/.test(sym)) score += 120
        }
        if (wantsFuture) {
          if (qt !== 'FUTURE' && !/=F$/.test(sym)) score += 120
        }

        const nameRaw =
          typeof qo.shortname === 'string'
            ? qo.shortname
            : typeof qo.longname === 'string'
              ? qo.longname
              : typeof qo.name === 'string'
                ? qo.name
                : ''
        const anyName = String(nameRaw).toLowerCase()
        if (anyName && anyName.includes(String(asset.name || '').trim().toLowerCase().slice(0, 6))) score -= 10

        if (!best || score < best.score) best = { sym, score, qt }
      }
      cand = best ? best.sym : ''
      if (cand && wantsIndex && !(cand.startsWith('^') || best?.qt === 'INDEX')) cand = ''
      if (!cand) return null
      nameResolvedCache.set(assetKey, cand)
    }

    const normalizedAttempt = String(attemptedYahooSymbol || '').trim()
    if (cand === assetKey || cand === normalizedAttempt) return null

    const got = await fetchBestChartForSymbol(cand)
    if (!got.chart) return null
    const ex = extractSpark(got.chart)
    if (ex.price === null) return null

    const prevPoints = Array.isArray(series[assetKey]) ? series[assetKey] : []
    const prev = prevPoints.length ? prevPoints[prevPoints.length - 1] : null
    if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price > 0) {
      const bounds = getPriceScaleBoundsForCategory(category)
      const ratio = ex.price / prev.price
      if (!Number.isFinite(ratio) || ratio < bounds[0] || ratio > bounds[1]) return null
    }

    overrides.set(assetKey, cand)
    nameOverrideSuggested.add(`${assetKey}=${cand}`)
    nameResolvedUsed += 1
    return { yahooSymbol: cand, chart: got.chart, dataInterval: got.dataInterval }
  }

  for (const p of selectedPlan) {
    const qIntraday = byYahoo.get(p.yahooSymbol)
    const qDaily = byYahooDaily.get(p.yahooSymbol)
    let q = qIntraday
    let usedInterval: '5m' | '1d' = '5m'
    if (!q) {
      q = qDaily
      usedInterval = '1d'
    } else {
      const ex = extractSpark(q)
      if (ex.price === null && qDaily) {
        q = qDaily
        usedInterval = '1d'
      }
    }
    const asset = assetBySymbol.get(p.assetSymbol)
    const cat = String(asset && asset.category ? asset.category : 'n/d') || 'n/d'
    const catRow = byCategory.get(cat) || { assets: 0, attempted: 0, updated: 0, missing: 0 }
    catRow.attempted += 1
    byCategory.set(cat, catRow)

    if (!q) {
      const qf = byYahooQuote.get(p.yahooSymbol)
      if (qf) {
        const point: MarketPoint = { t: nowIso, price: qf.price }
        if (typeof qf.change === 'number') point.change = qf.change
        if (typeof qf.changePct === 'number') point.changePct = qf.changePct
        if (qf.asOf) point.asOf = qf.asOf
        const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
        const prevPoint = points.length ? points[points.length - 1] : null
        const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
        series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
        updated++
        quoteFallbackUsed += 1
        updatedSymbols.push(p.assetSymbol)
        catRow.updated += 1
        byCategory.set(cat, catRow)
        auditItems.push({
          assetSymbol: p.assetSymbol,
          category: cat,
          yahooSymbol: p.yahooSymbol,
          status: 'updated',
          price: qf.price,
          dataInterval: '1d',
          resolvedBy: 'symbol',
        })
        continue
      }
      const resolved = await resolveByNameIfEnabled(asset, cat, p.yahooSymbol)
      if (resolved) {
        const extracted = extractSpark(resolved.chart)
        const price = extracted.price
        if (price !== null) {
          const point: MarketPoint = { t: nowIso, price }
          if (typeof extracted.change === 'number') point.change = extracted.change
          if (typeof extracted.changePct === 'number') point.changePct = extracted.changePct
          if (extracted.asOf) point.asOf = extracted.asOf

          const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
          const prevPoint = points.length ? points[points.length - 1] : null
          const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
          series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
          updated++
          if (resolved.dataInterval === '1d') dailyFallbackUsed += 1
          updatedSymbols.push(p.assetSymbol)
          catRow.updated += 1
          byCategory.set(cat, catRow)
          auditItems.push({
            assetSymbol: p.assetSymbol,
            category: cat,
            yahooSymbol: resolved.yahooSymbol,
            status: 'updated',
            price,
            dataInterval: resolved.dataInterval,
            resolvedBy: 'name',
          })
          continue
        }
      }
      const tv = await resolveByTradingViewIfEnabled(asset, cat)
      if (tv) {
        const point: MarketPoint = { t: nowIso, price: tv.price, asOf: nowIso }
        const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
        const prevPoint = points.length ? points[points.length - 1] : null
        const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
        series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
        updated++
        updatedSymbols.push(p.assetSymbol)
        catRow.updated += 1
        byCategory.set(cat, catRow)
        auditItems.push({
          assetSymbol: p.assetSymbol,
          category: cat,
          yahooSymbol: p.yahooSymbol,
          status: 'updated',
          price: tv.price,
          dataInterval: usedInterval,
          resolvedBy: 'tradingview',
          tradingViewSymbol: tv.tradingViewSymbol,
          tradingViewUsedColumn: tv.usedColumn,
          tradingViewUpdateMode: tv.updateMode,
        })
        continue
      }
      missingSymbols.push(p.assetSymbol)
      catRow.missing += 1
      byCategory.set(cat, catRow)
      auditItems.push({
        assetSymbol: p.assetSymbol,
        category: cat,
        yahooSymbol: p.yahooSymbol,
        status: 'missing',
        reason: 'not_returned',
        nonTickerFixable: isNonTickerFixableMissing(cat, p.yahooSymbol, 'not_returned'),
        dataInterval: usedInterval,
        resolvedBy: 'symbol',
      })
      continue
    }
    covered += 1
    const extracted = extractSpark(q)
    const price = extracted.price
    if (price === null) {
      const qf = byYahooQuote.get(p.yahooSymbol)
      if (qf) {
        const point: MarketPoint = { t: nowIso, price: qf.price }
        if (typeof qf.change === 'number') point.change = qf.change
        if (typeof qf.changePct === 'number') point.changePct = qf.changePct
        if (qf.asOf) point.asOf = qf.asOf
        const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
        const prevPoint = points.length ? points[points.length - 1] : null
        const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
        series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
        updated++
        quoteFallbackUsed += 1
        updatedSymbols.push(p.assetSymbol)
        catRow.updated += 1
        byCategory.set(cat, catRow)
        auditItems.push({
          assetSymbol: p.assetSymbol,
          category: cat,
          yahooSymbol: p.yahooSymbol,
          status: 'updated',
          price: qf.price,
          dataInterval: usedInterval,
          resolvedBy: 'symbol',
        })
        continue
      }
      const resolved = await resolveByNameIfEnabled(asset, cat, p.yahooSymbol)
      if (resolved) {
        const extracted2 = extractSpark(resolved.chart)
        const price2 = extracted2.price
        if (price2 !== null) {
          const point: MarketPoint = { t: nowIso, price: price2 }
          if (typeof extracted2.change === 'number') point.change = extracted2.change
          if (typeof extracted2.changePct === 'number') point.changePct = extracted2.changePct
          if (extracted2.asOf) point.asOf = extracted2.asOf

          const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
          const prevPoint = points.length ? points[points.length - 1] : null
          const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
          series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
          updated++
          if (resolved.dataInterval === '1d') dailyFallbackUsed += 1
          updatedSymbols.push(p.assetSymbol)
          catRow.updated += 1
          byCategory.set(cat, catRow)
          auditItems.push({
            assetSymbol: p.assetSymbol,
            category: cat,
            yahooSymbol: resolved.yahooSymbol,
            status: 'updated',
            price: price2,
            dataInterval: resolved.dataInterval,
            resolvedBy: 'name',
          })
          continue
        }
      }
      const tv = await resolveByTradingViewIfEnabled(asset, cat)
      if (tv) {
        const point: MarketPoint = { t: nowIso, price: tv.price, asOf: nowIso }
        const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
        const prevPoint = points.length ? points[points.length - 1] : null
        const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
        series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
        updated++
        updatedSymbols.push(p.assetSymbol)
        catRow.updated += 1
        byCategory.set(cat, catRow)
        auditItems.push({
          assetSymbol: p.assetSymbol,
          category: cat,
          yahooSymbol: p.yahooSymbol,
          status: 'updated',
          price: tv.price,
          dataInterval: usedInterval,
          resolvedBy: 'tradingview',
          tradingViewSymbol: tv.tradingViewSymbol,
          tradingViewUsedColumn: tv.usedColumn,
          tradingViewUpdateMode: tv.updateMode,
        })
        continue
      }
      missingSymbols.push(p.assetSymbol)
      catRow.missing += 1
      byCategory.set(cat, catRow)
      auditItems.push({
        assetSymbol: p.assetSymbol,
        category: cat,
        yahooSymbol: p.yahooSymbol,
        status: 'missing',
        reason: 'no_price',
        nonTickerFixable: isNonTickerFixableMissing(cat, p.yahooSymbol, 'no_price'),
        dataInterval: usedInterval,
        resolvedBy: 'symbol',
      })
      continue
    }
    const prevPoints = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
    const prev = prevPoints.length ? prevPoints[prevPoints.length - 1] : null
    if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price > 0) {
      const bounds = getPriceScaleBoundsForCategory(cat)
      const ratio = price / prev.price
      if (!Number.isFinite(ratio) || ratio < bounds[0] || ratio > bounds[1]) {
        if (typeof extracted.changePct === 'number' && Number.isFinite(extracted.changePct)) {
          const synthPrice = prev.price * (1 + extracted.changePct / 100)
          if (Number.isFinite(synthPrice) && synthPrice > 0) {
            const point: MarketPoint = { t: nowIso, price: synthPrice }
            point.change = synthPrice - prev.price
            point.changePct = extracted.changePct
            if (extracted.asOf) point.asOf = extracted.asOf
            const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
            const prevPoint = points.length ? points[points.length - 1] : null
            const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
            series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
            updated++
            if (usedInterval === '1d') dailyFallbackUsed += 1
            updatedSymbols.push(p.assetSymbol)
            catRow.updated += 1
            byCategory.set(cat, catRow)
            auditItems.push({
              assetSymbol: p.assetSymbol,
              category: cat,
              yahooSymbol: p.yahooSymbol,
              status: 'updated',
              price: synthPrice,
              dataInterval: usedInterval,
              resolvedBy: 'symbol',
            })
            continue
          }
        }
        const tv = await resolveByTradingViewIfEnabled(asset, cat)
        if (tv) {
          const point: MarketPoint = { t: nowIso, price: tv.price, asOf: nowIso }
          const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
          const prevPoint = points.length ? points[points.length - 1] : null
          const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
          series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
          updated++
          if (usedInterval === '1d') dailyFallbackUsed += 1
          updatedSymbols.push(p.assetSymbol)
          catRow.updated += 1
          byCategory.set(cat, catRow)
          auditItems.push({
            assetSymbol: p.assetSymbol,
            category: cat,
            yahooSymbol: p.yahooSymbol,
            status: 'updated',
            price: tv.price,
            dataInterval: usedInterval,
            resolvedBy: 'tradingview',
            tradingViewSymbol: tv.tradingViewSymbol,
            tradingViewUsedColumn: tv.usedColumn,
            tradingViewUpdateMode: tv.updateMode,
          })
          continue
        }
        missingSymbols.push(p.assetSymbol)
        catRow.missing += 1
        byCategory.set(cat, catRow)
        auditItems.push({
          assetSymbol: p.assetSymbol,
          category: cat,
          yahooSymbol: p.yahooSymbol,
          status: 'missing',
          reason: 'price_mismatch',
          nonTickerFixable: false,
          dataInterval: usedInterval,
        })
        continue
      }
    }

    const point: MarketPoint = { t: nowIso, price }
    if (typeof extracted.change === 'number') point.change = extracted.change
    if (typeof extracted.changePct === 'number') point.changePct = extracted.changePct
    if (extracted.asOf) point.asOf = extracted.asOf

    const points = Array.isArray(series[p.assetSymbol]) ? series[p.assetSymbol] : []
    const prevPoint = points.length ? points[points.length - 1] : null
    const next = prevPoint && prevPoint.t === point.t ? points.slice(0, -1).concat([point]) : points.concat([point])
    series[p.assetSymbol] = pruneByCutoff(next, cutoffMs)
    updated++
    if (usedInterval === '1d') dailyFallbackUsed += 1
    updatedSymbols.push(p.assetSymbol)
    catRow.updated += 1
    byCategory.set(cat, catRow)
    auditItems.push({
      assetSymbol: p.assetSymbol,
      category: cat,
      yahooSymbol: p.yahooSymbol,
      status: 'updated',
      price,
      dataInterval: usedInterval,
      resolvedBy: 'symbol',
    })
  }

  parsed.series = series
  parsed.meta.generatedAt = nowIso
  parsed.meta.yahooUpdatedAt = nowIso
  parsed.meta.yahooCoverage = {
    enabled: true,
    lastRunAt: nowIso,
    attemptedAssets: selectedPlan.length,
    uniqueYahooSymbols: uniqueYahoo.length,
    returnedYahooSymbols: byYahoo.size,
    updatedAssets: updatedSymbols.length,
    missingAssets: missingSymbols.length,
    byCategory: Object.fromEntries(Array.from(byCategory.entries())),
    updatedSymbols: updatedSymbols.slice(0, 140),
    missingSymbols: missingSymbols.slice(0, 140),
    symbolOverrides: {
      count: overrides.size,
      items: Array.from(overrides.entries())
        .map(([k, v]) => `${k}=${v}`)
        .slice(0, 60),
    },
    dailyFallbackUsed,
    quoteFallbackUsed,
    skippedAssets,
    nameResolvedUsed,
    tradingViewUsed,
  }
  await writeFile(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8')
  await writeFile(path.join(outDir, 'market_quotes.js'), `window.MARKET_QUOTES_DATA=${JSON.stringify(parsed)};`, 'utf-8')
  const audit = {
    generatedAt: nowIso,
    attemptedAssets: selectedPlan.length,
    uniqueYahooSymbols: uniqueYahoo.length,
    returnedYahooSymbols: byYahoo.size,
    updatedAssets: updatedSymbols.length,
    missingAssets: missingSymbols.length,
    items: auditItems,
    nonTickerFixableMissing: auditItems.filter(
      x => (x as unknown as { status?: string; nonTickerFixable?: boolean }).status === 'missing' &&
        (x as unknown as { nonTickerFixable?: boolean }).nonTickerFixable === true,
    ).length,
    operationalMissing: auditItems.filter(
      x => (x as unknown as { status?: string; nonTickerFixable?: boolean }).status === 'missing' &&
        !(x as unknown as { nonTickerFixable?: boolean }).nonTickerFixable,
    ).length,
    dailyFallbackUsed,
    quoteFallbackUsed,
    skippedAssets,
    nameResolvedUsed,
    tradingViewUsed,
  }
  await writeFile(path.join(outDir, 'market_yahoo_audit.json'), JSON.stringify(audit, null, 2), 'utf-8')

  process.stdout.write(
    `OK • Yahoo quotes: updated=${updated} covered=${covered}/${selectedPlan.length} uniqueYahoo=${uniqueYahoo.length} dailyFallback=${dailyFallbackUsed} quoteFallback=${quoteFallbackUsed} skipped=${skippedAssets}\n`,
  )

  if (nameOverrideSuggested.size) {
    const items = Array.from(nameOverrideSuggested).slice(0, 30)
    process.stdout.write(`SUGGEST • MARKET_YAHOO_SYMBOL_OVERRIDES (name_verified) ${items.length}:\n`)
    process.stdout.write(`${items.join(' ; ')}\n`)
  }

  if (tradingViewOverrideSuggested.size) {
    const items = Array.from(tradingViewOverrideSuggested).slice(0, 30)
    process.stdout.write(`SUGGEST • MARKET_TRADINGVIEW_SYMBOL_OVERRIDES (auto_resolved) ${items.length}:\n`)
    process.stdout.write(`${items.join(' ; ')}\n`)
  }

  try {
    const criticalFromEnv = new Set(parseList(env('MARKET_COVERAGE_CRITICAL')).map(x => x.trim()).filter(Boolean))
    const requiredCritical =
      parsed.meta &&
      parsed.meta.coverage &&
      Array.isArray((parsed.meta.coverage as unknown as { requiredCritical?: unknown }).requiredCritical)
        ? ((parsed.meta.coverage as unknown as { requiredCritical: unknown[] }).requiredCritical
            .map(x => String(x || '').trim())
            .filter(Boolean) as string[])
        : []
    for (const s of requiredCritical) criticalFromEnv.add(s)

    const categoryRank = (cat: string) => {
      const c = String(cat || '').toLowerCase()
      if (c === 'fx_g10' || c === 'fx') return 1
      if (c === 'equities') return 2
      if (c === 'metals' || c === 'commodities' || c === 'energy' || c === 'agro') return 3
      if (c === 'crypto') return 4
      if (c === 'rates' || c === 'bonds') return 5
      if (c === 'volatility') return 6
      return 9
    }

    const byKey = new Map<
      string,
      { k: string; v: string; assetSymbol: string; category: string; isCritical: boolean; catRank: number }
    >()

    for (const it of auditItems) {
      const anyIt = it as unknown as { assetSymbol?: string; category?: string; yahooSymbol?: string; status?: string; reason?: string; nonTickerFixable?: boolean }
      if (anyIt && anyIt.status === 'missing' && (anyIt.nonTickerFixable === true || isNonTickerFixableMissing(anyIt.category, anyIt.yahooSymbol, anyIt.reason))) {
        continue
      }
      const pair = suggestYahooOverrideFromAuditItem(
        it as unknown as { assetSymbol: string; yahooSymbol: string; status: 'updated' | 'missing'; reason?: string },
      )
      if (!pair) continue
      const idx = pair.indexOf('=')
      if (idx <= 0) continue
      const k = pair.slice(0, idx).trim()
      const v = pair.slice(idx + 1).trim()
      if (!k || !v) continue
      if (overrides.has(k)) continue
      if (k === v) continue
      const anyCat = String((it as unknown as { category?: unknown }).category || '')
      const current = yahooSymbolForAsset(k, anyCat, undefined, overrides)
      if (current && current === v) continue

      const assetSymbol = String(
        (it as unknown as { assetSymbol?: unknown }).assetSymbol ? (it as unknown as { assetSymbol: unknown }).assetSymbol : k,
      ).trim()
      const category = String((it as unknown as { category?: unknown }).category || '').trim()
      const isCritical = criticalFromEnv.has(assetSymbol) || criticalFromEnv.has(k)
      const catRank = categoryRank(category)

      const prev = byKey.get(k)
      if (!prev) {
        byKey.set(k, { k, v, assetSymbol, category, isCritical, catRank })
        continue
      }
      const prevScore = (prev.isCritical ? 0 : 100) + prev.catRank
      const nextScore = (isCritical ? 0 : 100) + catRank
      if (nextScore < prevScore) byKey.set(k, { k, v, assetSymbol, category, isCritical, catRank })
    }

    const ordered = Array.from(byKey.values())
      .sort((a, b) => {
        if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1
        if (a.catRank !== b.catRank) return a.catRank - b.catRank
        return a.assetSymbol.localeCompare(b.assetSymbol)
      })
      .slice(0, 60)

    if (ordered.length) {
      const criticalCount = ordered.filter(x => x.isCritical).length
      process.stdout.write(
        `SUGGEST • MARKET_YAHOO_SYMBOL_OVERRIDES (critical_first) total=${ordered.length} critical=${criticalCount}:\n`,
      )
      process.stdout.write(`${ordered.map(x => `${x.k}=${x.v}`).join(' ; ')}\n`)
    }

    const nameSearchEnabled = envBool('MARKET_YAHOO_NAME_SEARCH_ENABLED', false)
    const nameSearchMax = Math.max(0, Math.min(200, envNumber('MARKET_YAHOO_NAME_SEARCH_MAX', 20)))
    if (nameSearchEnabled && nameSearchMax > 0) {
      const already = new Set(ordered.map(x => x.k))
      let used = 0
      for (const it of auditItems) {
        if (used >= nameSearchMax) break
        const anyIt = it as unknown as {
          assetSymbol?: string
          category?: string
          yahooSymbol?: string
          status?: string
          reason?: string
          nonTickerFixable?: boolean
          dataInterval?: string
        }
        if (!anyIt || anyIt.status !== 'missing') continue
        if (anyIt.nonTickerFixable) continue
        const k = String(anyIt.assetSymbol || '').trim()
        if (!k || overrides.has(k) || already.has(k)) continue
        const asset = assetBySymbol.get(k)
        const name = asset && asset.name ? String(asset.name).trim() : ''
        if (!name) continue
        const quotes = await yahooSearchByName(name, opts.timeoutMs)
        const cand = Array.isArray(quotes)
          ? quotes.find((q): q is Record<string, unknown> => {
              if (!q || typeof q !== 'object') return false
              const qo = q as Record<string, unknown>
              const hasSym = typeof qo.symbol === 'string' || typeof qo.ticker === 'string'
              const hasName = typeof qo.longname === 'string' || typeof qo.shortname === 'string' || typeof qo.name === 'string'
              return hasSym && hasName
            })
          : null
        const sym = cand
          ? String(typeof cand.symbol === 'string' ? cand.symbol : typeof cand.ticker === 'string' ? cand.ticker : '').trim()
          : ''
        if (sym && !overrides.has(k) && !already.has(k)) {
          already.add(k)
          used++
          process.stdout.write(`SUGGEST • NAME_MATCH ${k}=${sym}\n`)
        }
      }
    }
  } catch {
    void 0
  }
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
  const saveDownload = async (download: import('playwright').Download) => {
    const suggested = download.suggestedFilename() || 'investing.csv'
    const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
    const outPath = path.join(downloadDir, outName)
    await download.saveAs(outPath)
    return outPath
  }

  const waitForDownloadPopup = async () => {
    const downloadPopup = page.locator('#downloadPortfolio').first()
    try {
      await downloadPopup.waitFor({ state: 'visible', timeout: 5000 })
      return downloadPopup
    } catch {
      try {
        await page.waitForFunction(() => {
          const el = document.querySelector('#downloadPortfolio') as HTMLElement | null
          if (!el) return false
          const st = window.getComputedStyle(el)
          return st.display !== 'none' && st.visibility !== 'hidden' && el.getBoundingClientRect().height > 0
        }, { timeout: 5000 })
        return downloadPopup
      } catch {
        return null
      }
    }
  }

  const tryConfirmPopupDownload = async () => {
    const downloadPopup = await waitForDownloadPopup()
    if (!downloadPopup) return null
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)

    try {
      const downloadBtn = downloadPopup.locator('.js-save').first()
      await downloadBtn.click({ timeout: 6000, force: true })
    } catch {
      const clicked = await page.evaluate(() => {
        const root = document.querySelector('#downloadPortfolio')
        if (!root) return false
        const candidates = Array.from(root.querySelectorAll('a,button,span,div')) as HTMLElement[]
        const target = candidates.find(el => /fazer download|fazer o download|download/i.test(String(el.textContent || '')))
        if (!target) return false
        target.click()
        return true
      })
      if (!clicked) return null
    }

    const download = await downloadPromise
    if (!download) return null
    return await saveDownload(download)
  }

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
    await downloadRow.click({ timeout: 6000, force: true })
    const direct = await downloadPromise
    if (direct) {
      return await saveDownload(direct)
    }

    const popupDownload = await tryConfirmPopupDownload()
    if (popupDownload) return popupDownload
  } catch {
    void 0
  }
  await ensurePortfolioPage(page, brUrl, debugDir)

  try {
    const directPopupDownload = await page.evaluate(() => {
      const actions = document.querySelector('.portfolioActionsContainer') as HTMLElement | null
      if (!actions) return false
      const dotsEl = actions.querySelector('.threeDotsIcon') as HTMLElement | null
      if (dotsEl) dotsEl.click()
      const pop = actions.querySelector('.portfolioActionsPop') as HTMLElement | null
      if (!pop) return false
      const nodes = Array.from(pop.querySelectorAll('a,button,div,span')) as HTMLElement[]
      const target = nodes.find(el => /download|export|fazer o download/i.test(String(el.textContent || '')))
      if (!target) return false
      target.click()
      return true
    })
    if (directPopupDownload) {
      const popupDownload = await tryConfirmPopupDownload()
      if (popupDownload) return popupDownload
    }
  } catch {
    void 0
  }

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
      await downloadRow.click({ timeout: 6000, force: true })

      const direct = await downloadPromise
      if (direct) {
        return await saveDownload(direct)
      }

      const popupDownload = await tryConfirmPopupDownload()
      if (popupDownload) return popupDownload
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
  method?: 'investing' | 'seed'
  seedAgeMinutes?: number
  yahooUpdatedSymbols?: number
  yahooMissingSymbols?: number
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
  const baseDir = resolveFromProject(env('MARKET_AUTOMATION_DIR', defaultAutomationDir()))
  const userDataDir = resolveFromBase(baseDir, env('INVESTING_USER_DATA_DIR', path.join(baseDir, 'investing-profile')))
  const downloadDir = resolveFromBase(baseDir, env('INVESTING_DOWNLOAD_DIR', path.join(baseDir, 'downloads')))
  const debugDir = path.join(baseDir, 'logs')

  const outDir = resolveFromProject(
    env('MARKET_OUT_DIR', path.resolve(PROJECT_ROOT, 'dashboard', 'MERCADO', 'assets', 'data')),
  )
  const intervalMinutes = envNumber('MARKET_INTERVAL_MINUTES', 15)
  const retentionDays = envNumber('MARKET_RETENTION_DAYS', 5)

  const enableDiBase = envBool('INFOMONEY_DI_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'di')
  const enableCalendarBase =
    envBool('INVESTING_CALENDAR_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'calendar')
  const enablePortfolioBase =
    envBool('INVESTING_PORTFOLIO_ENABLED', true) && (mode === 'once' || mode === 'all' || mode === 'portfolio')
  let enablePortfolio = enablePortfolioBase
  const exportRequired = envBool('INVESTING_EXPORT_REQUIRED', true)
  const headless = envBool('INVESTING_HEADLESS', true)
  const updateReason = String(env('MARKET_UPDATE_REASON', '') || '').toLowerCase()

  const applySchedule = (mode === 'once' || mode === 'all') && updateReason === 'schedule'
  const now = new Date()
  const nowMs = now.getTime()

  if (applySchedule && enablePortfolioBase) {
    const portfolioIntervalMinutes = envNumber('INVESTING_PORTFOLIO_INTERVAL_MINUTES', intervalMinutes)
    const portfolioIntervalMs = Math.max(5, portfolioIntervalMinutes) * 60 * 1000
    const hasQuotesFile = await fileExists(path.join(outDir, 'market_quotes.json'))
    const lastPortfolioUpdatedAt = hasQuotesFile ? await getLastPortfolioUpdatedAt(outDir) : null
    if (hasQuotesFile && lastPortfolioUpdatedAt && nowMs - lastPortfolioUpdatedAt < portfolioIntervalMs) {
      enablePortfolio = false
    }
  }

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
      await validateInvestingCsvOrThrow(csvPath)
      await buildMarketHistory({
        csvPath,
        outDir,
        intervalMinutes,
        retentionDays,
        timestamp: new Date().toISOString(),
      })
      summary.portfolio.status = 'ok'
      summary.portfolio.csvPath = csvPath
      summary.portfolio.method = 'investing'
    } catch (e) {
      portfolioError = e
      summary.portfolio.status = 'fail'
      summary.portfolio.error = String(e instanceof Error ? e.message : e)
      process.stderr.write(
        `WARN • Falha ao exportar CSV do Investing: ${String(e instanceof Error ? e.message : e)}\n`,
      )

      if (envBool('INVESTING_SEED_FROM_LAST_CSV', true)) {
        const maxAgeHours = Math.max(1, envNumber('INVESTING_SEED_MAX_AGE_HOURS', 72))
        const now = Date.now()
        const searchDirs = parseList(env('INVESTING_SEED_SEARCH_DIRS'))
        const dirs = searchDirs.length ? searchDirs : [downloadDir, PROJECT_ROOT]
        const latest = await findLatestCsvInDirs(dirs)
        const ageMs = latest ? now - latest.mtimeMs : null
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000
        if (latest && ageMs !== null && ageMs >= 0 && ageMs <= maxAgeMs) {
          try {
            await validateInvestingCsvOrThrow(latest.path)
            await buildMarketHistory({
              csvPath: latest.path,
              outDir,
              intervalMinutes,
              retentionDays,
              timestamp: new Date().toISOString(),
            })
            summary.portfolio.status = 'ok'
            summary.portfolio.csvPath = latest.path
            summary.portfolio.method = 'seed'
            summary.portfolio.seedAgeMinutes = Math.round(ageMs / (60 * 1000))
            portfolioError = null
            process.stdout.write(`OK • Seed CSV=${latest.path}\n`)
          } catch (seedErr) {
            process.stderr.write(
              `WARN • Seed falhou (CSV local): ${String(seedErr instanceof Error ? seedErr.message : seedErr)}\n`,
            )
          }
        } else {
          const hint = latest ? `${latest.path}` : '(nenhum CSV encontrado)'
          process.stderr.write(`WARN • Seed indisponível (maxAgeHours=${maxAgeHours}) • ${hint}\n`)
        }
      }
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

  if (envBool('MARKET_YAHOO_ENABLED', false)) {
    try {
      const maxSymbols = envNumber('MARKET_YAHOO_MAX_SYMBOLS', 320)
      const timeoutMs = envNumber('MARKET_YAHOO_TIMEOUT_MS', 8000)
      await mergeYahooQuotesIntoMarketQuotes(outDir, { maxSymbols, timeoutMs })
      try {
        await writeZqCurveFile(outDir, { timeoutMs, headless, investingUserDataDir: userDataDir, debugDir })
      } catch (e) {
        process.stderr.write(`WARN • Falha ao atualizar Curva ZQ: ${String(e instanceof Error ? e.message : e)}\n`)
      }
      try {
        await writeUsTreasuryFuturesFile(outDir, { timeoutMs })
      } catch (e) {
        process.stderr.write(
          `WARN • Falha ao atualizar Treasuries (futuros): ${String(e instanceof Error ? e.message : e)}\n`,
        )
      }
    } catch (e) {
      process.stderr.write(`WARN • Falha ao atualizar Yahoo Quotes: ${String(e instanceof Error ? e.message : e)}\n`)
    }
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
        changePct: parsed.changePct,
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

  const baseDir = resolveFromProject(env('MARKET_AUTOMATION_DIR', defaultAutomationDir()))
  const userDataDir = resolveFromBase(baseDir, env('INVESTING_USER_DATA_DIR', path.join(baseDir, 'investing-profile')))
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
