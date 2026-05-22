import { rename } from 'node:fs/promises'
import { chromium } from 'playwright'
import { launchPersistentContextWithRetry, type InvestingBrowser, buildChromiumLaunchOptions } from './browser.js'
import { dumpDebug } from './debug.js'
import { tryDismissBanners } from './page-helpers.js'
import { extractCalendarWidgetRowsFromDom } from './calendar-widget/dom-extract.js'

export type CalendarWidgetRow = {
  time: string
  currency: string
  importance: number
  event: string
  actual: string
  forecast: string
  previous: string
}

export type CalendarWidgetScrapeResult = {
  cloudflare: boolean
  rows: CalendarWidgetRow[]
}

export type InvestingBrowserConfig = {
  browser: InvestingBrowser
  executablePath?: string
  launchTimeoutMs: number
  args?: string[]
}

export async function scrapeCalendarWidget(params: {
  url: string
  debugDir: string
  headless: boolean
  userDataDir?: string
  browser: InvestingBrowserConfig
  log?: (line: string) => void
}) : Promise<CalendarWidgetScrapeResult> {
  const log = params.log || (() => void 0)

  const context = params.userDataDir
    ? await launchPersistentContextWithRetry({
        userDataDir: params.userDataDir,
        headless: params.headless,
        browser: params.browser.browser,
        executablePath: params.browser.executablePath,
        launchTimeoutMs: params.browser.launchTimeoutMs,
        args: params.browser.args,
        log,
        renameDir: rename,
      })
    : null

  const browser = context
    ? null
    : await chromium.launch(
        buildChromiumLaunchOptions({
          headless: params.headless,
          browser: params.browser.browser,
          executablePath: params.browser.executablePath,
          launchTimeoutMs: params.browser.launchTimeoutMs,
          args: params.browser.args,
        }),
      )

  const page = context ? await context.newPage() : await browser!.newPage()
  try {
    await page.goto(params.url, { waitUntil: 'domcontentloaded' })
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
        await dumpDebug(page, params.debugDir, 'investing_calendar_cloudflare', log)
        return { cloudflare: true, rows: [] }
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

    const rows = (await page.evaluate(extractCalendarWidgetRowsFromDom)) as CalendarWidgetRow[]

    if (!rows.length) {
      await dumpDebug(page, params.debugDir, 'investing_calendar_empty', log)
      return { cloudflare: false, rows: [] }
    }

    return { cloudflare: false, rows }
  } catch (e) {
    try {
      await dumpDebug(page, params.debugDir, 'investing_calendar_error', log)
    } catch {
      void 0
    }
    throw e
  } finally {
    if (context) await context.close()
    else await browser!.close()
  }
}
