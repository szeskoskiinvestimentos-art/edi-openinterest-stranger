import type { Page } from 'playwright'

export async function tryDismissBanners(page: Page) {
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

export async function isCloudflareChallenge(page: Page) {
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

export function isRetryableNavigationError(err: unknown) {
  const msg = String(err instanceof Error ? err.message : err)
  if (/net::ERR_ABORTED/i.test(msg)) return true
  if (/frame was detached/i.test(msg)) return true
  if (/Target page, context or browser has been closed/i.test(msg)) return true
  return false
}

export async function gotoWithRetries(page: Page, url: string) {
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
