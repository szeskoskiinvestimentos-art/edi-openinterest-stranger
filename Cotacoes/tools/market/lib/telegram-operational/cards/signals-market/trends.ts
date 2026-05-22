import { arrowFromPct } from '../../format.js'
import { trendPct } from '../../series.js'
import type { MarketPoint, MarketQuotes } from '../../../../types.ts'
import type { CardsMarketAccess } from '../signals-types.js'

export function computeIndexTrends(params: { quotes: MarketQuotes | null; access: CardsMarketAccess }) {
  const { quotes, access } = params
  const { sym } = access

  const winKey = sym(['WINc1', 'WIN', 'IBOV', '.BVSP'])
  const wdoKey = sym(['WDOc1', 'WDO', 'USD/BRL', 'USD/BRL - US Dollar Brazil Real'])

  const winSeries: MarketPoint[] | null = quotes && winKey && quotes.series ? (quotes.series[winKey] as MarketPoint[] | undefined | null) : null
  const wdoSeries: MarketPoint[] | null = quotes && wdoKey && quotes.series ? (quotes.series[wdoKey] as MarketPoint[] | undefined | null) : null

  const win30_90 = trendPct(winSeries, 6)
  const winDay = trendPct(winSeries, 32)
  const wdo30_90 = trendPct(wdoSeries, 6)
  const wdoDay = trendPct(wdoSeries, 32)

  const brlA = arrowFromPct(wdo30_90)
  const winA = arrowFromPct(win30_90)

  return { winKey, wdoKey, win30_90, winDay, wdo30_90, wdoDay, brlA, winA }
}
