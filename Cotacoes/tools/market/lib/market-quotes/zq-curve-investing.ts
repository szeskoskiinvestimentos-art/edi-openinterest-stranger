import { chromium } from 'playwright'
import { dumpDebug } from '../investing/debug.js'
import { tryDismissBanners } from '../investing/page-helpers.js'
import { fmtMonthYearFromUnixSec, type FuturesDeps } from './futures-utils.js'
import type { ZqCurveItem } from './zq-curve-types.js'

export async function tryFetchZqCurveItemsFromInvesting(params: {
  deps: FuturesDeps
  timeoutMs: number
  investingUserDataDir: string
  headless: boolean
  debugDir: string
  log?: (line: string) => void
}): Promise<ZqCurveItem[]> {
  try {
    const url =
      params.deps.env(
        'MARKET_ZQ_CURVE_INVESTING_URL',
        'https://br.investing.com/rates-bonds/cbot-30-day-federal-funds-comp-c1-futures-contracts',
      ) || 'https://br.investing.com/rates-bonds/cbot-30-day-federal-funds-comp-c1-futures-contracts'

    const context = await chromium.launchPersistentContext(params.investingUserDataDir, {
      headless: params.headless,
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

      const items: ZqCurveItem[] = []
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
        const prev = dayChange !== null && Number.isFinite(dayChange) ? price - dayChange : null
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
      return items
    } catch (e) {
      try {
        await dumpDebug(page, params.debugDir, 'zq_curve_investing_error', params.log)
      } catch {
        void 0
      }
      throw e
    } finally {
      await context.close().catch(() => void 0)
    }
  } catch {
    return []
  }
}

