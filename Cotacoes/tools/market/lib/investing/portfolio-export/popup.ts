import { dumpDebug } from '../debug.js'
import { isInvestingNewsLikeUrl } from './url.js'

export async function tryCloseNewsPopups(
  context: import('playwright').BrowserContext,
  main: import('playwright').Page,
  debugDir: string,
  log: (line: string) => void,
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
        await dumpDebug(p, debugDir, 'investing_unwanted_news_popup', log)
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

