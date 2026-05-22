import { rename } from 'node:fs/promises'
import { chromium } from 'playwright'
import { buildChromiumLaunchOptions, launchPersistentContextWithRetry } from '../browser.js'
import { dumpDebug } from '../debug.js'
import { gotoWithRetries, tryDismissBanners } from '../page-helpers.js'
import { extractTablesFromPage } from './page-extract.js'
import { parseDiQuotesFromTables } from './table.js'
import type { InvestingBrowserConfig } from './types.js'

export async function scrapeDiFromInfoMoney(params: {
  debugDir: string
  headless: boolean
  userDataDir?: string
  browser: InvestingBrowserConfig
  log?: (line: string) => void
  warn?: (line: string) => void
}) {
  const log = params.log || (() => void 0)
  const warn = params.warn || (() => void 0)

  const url = 'https://www.infomoney.com.br/ferramentas/juros-futuros-di/'

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

    const extracted = await extractTablesFromPage(page)
    const result = parseDiQuotesFromTables(extracted)

    if (!result.length) {
      await dumpDebug(page, params.debugDir, 'infomoney_di_empty', log)
      warn('WARN • DI InfoMoney: tabela encontrada, mas não consegui extrair contratos/taxas.')
    }

    return result
  } catch (e) {
    try {
      await dumpDebug(page, params.debugDir, 'infomoney_di_error', log)
    } catch {
      void 0
    }
    warn(`WARN • DI InfoMoney indisponível: ${String(e instanceof Error ? e.message : e)}`)
    return []
  } finally {
    if (context) await context.close()
    else await browser!.close()
  }
}

