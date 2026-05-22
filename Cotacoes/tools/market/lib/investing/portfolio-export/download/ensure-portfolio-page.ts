import { dumpDebug } from '../../debug.js'
import { tryDismissBanners } from '../../page-helpers.js'
import { isInvestingNewsLikeUrl, isInvestingPortfolioUrl } from '../url.js'

export async function ensurePortfolioPage(
  page: import('playwright').Page,
  brUrl: string,
  debugDir: string,
  log: (line: string) => void,
) {
  const u = page.url()
  if (isInvestingPortfolioUrl(u)) return true
  if (isInvestingNewsLikeUrl(u)) {
    try {
      await dumpDebug(page, debugDir, 'investing_redirected_to_news', log)
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
