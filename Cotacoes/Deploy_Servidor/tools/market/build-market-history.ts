import 'dotenv/config'
import path from 'node:path'
import { readdir, stat, mkdir, unlink } from 'node:fs/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { parseArgs } from './lib/args.js'
import { buildMarketHistory } from './market-history.js'
import type { Asset, MarketPoint, MarketQuotes } from './types.js'

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
  const indexPath = path.resolve(process.cwd(), 'dashboard', 'MERCADO', 'index.html')
  const exists = await fileExists(indexPath)
  if (!exists) return
  const outDir = env(
    'EXPORT_PDF_OUT_DIR',
    path.resolve(process.cwd(), 'dashboard', 'MERCADO', 'exports'),
  )
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
    const v = env('INVESTING_BROWSER', 'chrome').toLowerCase()
    const channel = v === 'chromium' ? undefined : (v === 'msedge' || v === 'edge' ? 'msedge' : 'chrome')
    browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) })
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
  const indexPath = path.resolve(process.cwd(), 'dashboard', 'MERCADO', 'index.html')
  const exists = await fileExists(indexPath)
  if (!exists) return
  const outDir = env(
    'EXPORT_PDF_OUT_DIR',
    path.resolve(process.cwd(), 'dashboard', 'MERCADO', 'exports'),
  )
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
    const v = env('INVESTING_BROWSER', 'chrome').toLowerCase()
    const channel = v === 'chromium' ? undefined : (v === 'msedge' || v === 'edge' ? 'msedge' : 'chrome')
    browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) })
    const page = await browser.newPage()
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(2500)
    try {
      await page.addStyleTag({
        content: `
          * { box-shadow: none !important; text-shadow: none !important; }
          html, body, .main, .section, .context-box, .table-container, nav, header, footer {
            background: #ffffff !important;
          }
          .section-glow, .quicknav-overlay { display: none !important; }
          .positive, .negative, .neutral {
            color: #000 !important;
            border-color: #000 !important;
            background: transparent !important;
          }
          .data-table th, .data-table td {
            border-color: #000 !important;
          }
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
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
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

  const optionsDashboardDir = env(
    'OPTIONS_UNIFIED_DASHBOARD_DIR',
    path.resolve(process.cwd(), '..', 'B3_System', 'dashboard_unificado'),
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
  const m = /^(?:Pré|Pre)Mercado_Watchlist_(\d{2})(\d{2})(\d{4})\.csv$/i.exec(filename)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy)) return null
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 2000 || yyyy > 2100) return null
  return new Date(Date.UTC(yyyy, mm - 1, dd)).getTime()
}

async function resolveDefaultCsvPath(cwd: string) {
  const files = await readdir(cwd)
  const candidates = files.filter(f => /^(?:Pré|Pre)Mercado_Watchlist(?:_.*)?\.csv$/i.test(f))
  if (!candidates.length) {
    throw new Error(
      `Nenhum CSV encontrado. Coloque o export do Investing na raiz com nome "PréMercado_Watchlist_DDMMAAAA.csv" (ex: PréMercado_Watchlist_15032026.csv) ou "PréMercado_Watchlist.csv", ou rode com --csv "SEU_ARQUIVO.csv".`,
    )
  }

  const scored = await Promise.all(
    candidates.map(async f => {
      const full = path.resolve(cwd, f)
      const dt = parseWatchlistDateFromFilename(f)
      try {
        const st = await stat(full)
        return { full, filename: f, dt, mtimeMs: st.mtimeMs }
      } catch {
        return { full, filename: f, dt, mtimeMs: -1 }
      }
    }),
  )

  const pick = (list: typeof scored) =>
    list
      .slice()
      .sort(
        (a, b) =>
          (b.mtimeMs ?? -1) - (a.mtimeMs ?? -1) ||
          (b.dt ?? -1) - (a.dt ?? -1) ||
          String(a.filename).localeCompare(String(b.filename)),
      )[0]

  return pick(scored).full
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const outDir =
    (args.out as string) ||
    path.resolve(
      process.cwd(),
      'dashboard',
      'MERCADO',
      'assets',
      'data',
    )
  const intervalMinutes = Number(args.interval || 30)
  const retentionDays = Number(args.retentionDays || 5)
  const timestamp = args.timestamp as string | undefined

  if (args.addonsOnly === true) {
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
      await writeJsonAndJs(outDir, 'web_news_module', 'WEB_NEWS_MODULE_DATA', payload)
      process.stdout.write('OK • web_news_module.json\n')
    } catch (e) {
      process.stderr.write(
        `WARN • Falha ao gerar web_news_module.json: ${String(e instanceof Error ? e.message : e)}\n`,
      )
    }

    await exportDashboardPdf()
    await exportDashboardPdfLite()
    return
  }

  const csvPath = (args.csv as string) || (await resolveDefaultCsvPath(process.cwd()))

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

  await exportDashboardPdf()
  await exportDashboardPdfLite()
}

main().catch(err => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.exitCode = 1
})
