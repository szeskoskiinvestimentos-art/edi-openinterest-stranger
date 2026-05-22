import type { CsvRow } from '../../types.js'
import { matchMetals, matchEnergy, matchAgriculture, matchCommoditiesGeneric } from './rules-commodities.js'
import { buildRuleContext } from './rules-context.js'
import { matchCrypto } from './rules-crypto.js'
import { matchBrc, matchDxy, matchFxFuturesPair, matchFxSpot, matchWdo } from './rules-fx.js'
import {
  matchCreditCds,
  matchDotSymbol,
  matchEmergingBroad,
  matchEquityIndices,
  matchEquityListing,
  matchEtfs,
  matchPbr,
  matchVhsi,
  matchVolatility,
  matchWin,
} from './rules-markets.js'
import { matchFedFunds, matchJgb, matchLocalRatesFutures, matchRatesYields, matchSofr, matchSovereignTenor } from './rules-rates.js'

export function classifyAssetRules(row: CsvRow): { category: string; tags: string[] } {
  const ctx = buildRuleContext(row)

  return (
    matchCrypto(ctx) ||
    matchDxy(ctx) ||
    matchFedFunds(ctx) ||
    matchRatesYields(ctx) ||
    matchJgb(ctx) ||
    matchVhsi(ctx) ||
    matchCreditCds(ctx) ||
    matchWdo(ctx) ||
    matchWin(ctx) ||
    matchVolatility(ctx) ||
    matchEquityIndices(ctx) ||
    matchFxSpot(ctx) ||
    matchFxFuturesPair(ctx) ||
    matchSovereignTenor(ctx) ||
    matchLocalRatesFutures(ctx) ||
    matchSofr(ctx) ||
    matchMetals(ctx) ||
    matchPbr(ctx) ||
    matchEnergy(ctx) ||
    matchAgriculture(ctx) ||
    matchEmergingBroad(ctx) ||
    matchDotSymbol(ctx) ||
    matchEtfs(ctx) ||
    matchEquityListing(ctx) ||
    matchBrc(ctx) ||
    matchCommoditiesGeneric(ctx) || { category: 'other', tags: [] }
  )
}
