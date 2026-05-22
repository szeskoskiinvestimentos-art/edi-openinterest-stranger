import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { dumpDebug } from './debug.js'
import { launchPersistentContextWithRetry, type InvestingBrowser } from './browser.js'
import { gotoWithRetries, isCloudflareChallenge, isRetryableNavigationError, tryDismissBanners } from './page-helpers.js'
import { tryDownloadFromMenu, ensurePortfolioPage } from './portfolio-export/download.js'
import { tryCloseNewsPopups } from './portfolio-export/popup.js'
import { brInvestingPortfolioUrl, isInvestingNewsLikeUrl } from './portfolio-export/url.js'

export type InvestingBrowserConfig = {
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args?: string[]
}

type LogFn = (line: string) => void

type ClickExportParams = {
  url: string
  userDataDir: string
  downloadDir: string
  debugDir: string
  headless: boolean
  browser: InvestingBrowserConfig
  log?: LogFn
}

export async function clickExportAndDownloadCsv(params: {
  url: string
  userDataDir: string
  downloadDir: string
  debugDir: string
  headless: boolean
  browser: InvestingBrowserConfig
  log?: (line: string) => void
}) {
  return await clickExportAndDownloadCsvInternal(params)
}

type ClickExportResult = string | { retryHeadful: true; url: string }

async function clickExportAndDownloadCsvInternal(params: ClickExportParams): Promise<string> {
  const log = params.log || (() => void 0)
  await mkdir(params.downloadDir, { recursive: true })

  const context = await launchPersistentContextWithRetry({
    userDataDir: params.userDataDir,
    headless: params.headless,
    browser: params.browser.browser,
    executablePath: params.browser.executablePath,
    launchTimeoutMs: params.browser.launchTimeoutMs,
    args: params.browser.args,
    log,
    renameDir: rename,
  })

  let closed = false
  try {
    const result = await exportWithContext({ context, params, log })
    if (typeof result === 'string') return result

    await context.close()
    closed = true
    return await clickExportAndDownloadCsvInternal({ ...params, url: result.url, headless: false })
  } finally {
    if (!closed) await context.close()
  }
}

async function exportWithContext(params: { context: any; params: ClickExportParams; log: LogFn }): Promise<ClickExportResult> {
  const { context, params: p, log } = params
  const page = await context.newPage()
  await tryCloseNewsPopups(context, page, p.debugDir, log)

  const brUrl = brInvestingPortfolioUrl(p.url)
  const didGoto = await gotoPortfolioOrRetryHeadful({ page, brUrl, debugDir: p.debugDir, headless: p.headless, log })
  if (didGoto.retryHeadful) return { retryHeadful: true, url: brUrl }

  await waitForNetworkIdle(page)
  await tryDismissBanners(page)
  await ensurePortfolioUrl(page, brUrl)

  if (!(await ensurePortfolioPage(page, brUrl, p.debugDir, log))) {
    await dumpDebug(page, p.debugDir, 'investing_portfolio_not_loaded', log)
    throw new Error('Não consegui abrir a página do Portfolio do Investing (possível bloqueio/login). Rode o modo login e tente novamente.')
  }

  const cf = await handleCloudflareOrRetryHeadful({ page, debugDir: p.debugDir, headless: p.headless, log })
  if (cf.retryHeadful) return { retryHeadful: true, url: brUrl }

  const candidates = buildExportCandidates(page)
  const direct = await tryDownloadFromCandidates({
    page,
    candidates,
    downloadDir: p.downloadDir,
    brUrl,
    debugDir: p.debugDir,
    log,
  })
  if (direct) return direct

  const menuDownload = await tryDownloadFromMenu(page, p.downloadDir, brUrl, p.debugDir, log)
  if (menuDownload) return menuDownload

  await dumpDebug(page, p.debugDir, 'export_not_found', log)
  throw new Error('Não encontrei o botão/link de exportação do Investing nesta página.')
}

async function gotoPortfolioOrRetryHeadful(params: {
  page: any
  brUrl: string
  debugDir: string
  headless: boolean
  log: LogFn
}): Promise<{ retryHeadful: boolean }> {
  try {
    await gotoWithRetries(params.page, params.brUrl)
    return { retryHeadful: false }
  } catch (e) {
    try {
      await dumpDebug(params.page, params.debugDir, 'investing_portfolio_goto_error', params.log)
    } catch {
      void 0
    }
    if (params.headless && isRetryableNavigationError(e)) return { retryHeadful: true }
    throw e
  }
}

async function waitForNetworkIdle(page: any) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 })
  } catch {
    void 0
  }
}

async function ensurePortfolioUrl(page: any, brUrl: string) {
  const finalUrl = page.url()
  if (!/\/portfolio\/?/i.test(finalUrl) && /investing\.com\/portfolio/i.test(brUrl)) {
    try {
      await page.goto(brUrl, { waitUntil: 'domcontentloaded' })
      await waitForNetworkIdle(page)
      await tryDismissBanners(page)
    } catch {
      void 0
    }
  }
}

async function handleCloudflareOrRetryHeadful(params: {
  page: any
  debugDir: string
  headless: boolean
  log: LogFn
}): Promise<{ retryHeadful: boolean }> {
  if (!(await isCloudflareChallenge(params.page))) return { retryHeadful: false }

  await dumpDebug(params.page, params.debugDir, 'investing_cloudflare', params.log)
  if (params.headless) return { retryHeadful: true }

  const started = Date.now()
  while (Date.now() - started < 180000) {
    if (!(await isCloudflareChallenge(params.page))) break
    await params.page.waitForTimeout(1000)
  }
  if (await isCloudflareChallenge(params.page)) {
    await dumpDebug(params.page, params.debugDir, 'investing_cloudflare_timeout', params.log)
    throw new Error('Investing/Cloudflare bloqueou o acesso. Abra o modo login e resolva manualmente.')
  }
  return { retryHeadful: false }
}

function buildExportCandidates(page: any) {
  const actionScope = page.locator('.portfolioActionsContainer, .portfolioHeader, [class*="portfolio"]').first()
  return [
    actionScope.getByRole('button', { name: /exportar/i }),
    actionScope.getByRole('link', { name: /exportar/i }),
    actionScope.getByRole('button', { name: /export/i }),
    actionScope.getByRole('link', { name: /export/i }),
  ]
}

async function tryDownloadFromCandidates(params: {
  page: any
  candidates: any[]
  downloadDir: string
  brUrl: string
  debugDir: string
  log: LogFn
}) {
  for (const cand of params.candidates) {
    try {
      const el = cand.first()
      await el.waitFor({ state: 'visible', timeout: 3500 })
      const href = await el.getAttribute('href')
      if (href && isInvestingNewsLikeUrl(href)) continue

      const downloadPromise = params.page.waitForEvent('download', { timeout: 15000 }).catch(() => null)
      await el.click({ timeout: 6000 })

      const download = await downloadPromise
      if (!download) {
        await ensurePortfolioPage(params.page, params.brUrl, params.debugDir, params.log)
        continue
      }
      const suggested = download.suggestedFilename() || 'investing.csv'
      const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
      const outPath = path.join(params.downloadDir, outName)
      await download.saveAs(outPath)
      return outPath
    } catch {
      await ensurePortfolioPage(params.page, params.brUrl, params.debugDir, params.log)
      continue
    }
  }
  return null
}
