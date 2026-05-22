import type { MarketQuotes } from '../../../types.ts'

export type CardsMarketAccess = {
  sym: (cs: string[]) => string | null
  symRx: (matchers: RegExp[]) => string | null
  pull: (cs: string[]) => { a: string; pct: string }
  pullKey: (key: string | null) => { a: string; pct: string }
  lastOf: (cs: string[]) => { price: number | null; pct: number | null; a: string }
}

export type OptionsSummary = {
  ok: boolean
  generatedAt?: string
  items?: {
    WDO?: {
      spot?: number | null
      regime?: string | null
      keyLevels?: {
        gammaFlip?: number | null
        callWall?: number | null
        putWall?: number | null
        effectiveCallWall?: number | null
        effectivePutWall?: number | null
      }
    }
    WIN?: {
      spot?: number | null
      regime?: string | null
      keyLevels?: {
        gammaFlip?: number | null
        callWall?: number | null
        putWall?: number | null
        effectiveCallWall?: number | null
        effectivePutWall?: number | null
      }
    }
  }
}

export type WebNewsModulePayload = {
  ok: boolean
  generatedAt?: string
  summary?: {
    globalTop?: string[]
    brasilTop?: string[]
    commoditiesTop?: string[]
    sentiment?: string
    conflicts?: string[]
  }
}

export type OperationalSignalsInput = {
  quotes: MarketQuotes | null
  access: CardsMarketAccess
  web: WebNewsModulePayload | null
  options: OptionsSummary | null
}

