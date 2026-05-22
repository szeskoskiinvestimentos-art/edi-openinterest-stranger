import type { TelegramCard } from './types.js'

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
