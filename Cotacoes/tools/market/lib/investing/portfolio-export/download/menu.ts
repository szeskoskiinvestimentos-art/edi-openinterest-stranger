import path from 'node:path'
import { isInvestingNewsLikeUrl } from '../url.js'
import { ensurePortfolioPage } from './ensure-portfolio-page.js'
import { tryConfirmPopupDownload } from './popup.js'

export async function tryDownloadFromMenu(
  page: import('playwright').Page,
  downloadDir: string,
  brUrl: string,
  debugDir: string,
  log: (line: string) => void,
) {
  const saveDownload = async (download: import('playwright').Download) => {
    const suggested = download.suggestedFilename() || 'investing.csv'
    const outName = suggested.toLowerCase().endsWith('.csv') ? suggested : `${suggested}.csv`
    const outPath = path.join(downloadDir, outName)
    await download.saveAs(outPath)
    return outPath
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

    const popupDownload = await tryConfirmPopupDownload({ page, saveDownload })
    if (popupDownload) return popupDownload
  } catch {
    void 0
  }
  await ensurePortfolioPage(page, brUrl, debugDir, log)

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
      const popupDownload = await tryConfirmPopupDownload({ page, saveDownload })
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
      .locator(
        'button[aria-label*="More"], button[aria-label*="more"], button[aria-label*="Mais"], button[aria-label*="Opções"], button[aria-label*="Options"], button[aria-label*="options"]',
      ),
    page.locator(
      'button[aria-label*="More"], button[aria-label*="more"], button[aria-label*="Mais"], button[aria-label*="Opções"], button[aria-label*="Options"], button[aria-label*="options"]',
    ),
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

      const popupDownload = await tryConfirmPopupDownload({ page, saveDownload })
      if (popupDownload) return popupDownload
    } catch {
      await ensurePortfolioPage(page, brUrl, debugDir, log)
      continue
    }
  }

  return null
}
