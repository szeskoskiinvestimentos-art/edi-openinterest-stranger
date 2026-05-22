import { includesAny } from './text.js'
import type { RuleContext } from './rules-context.js'

export function matchFedFunds(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (ctx.symbolUpper.includes('FEDR') || includesAny(ctx.name, ['Federal Funds', 'Fed Funds', 'Federal Funds Rate', 'Federal Funds Composite'])) {
    return { category: 'rates', tags: ['rates', 'risk_off'] }
  }
  return null
}

export function matchRatesYields(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    /^[A-Z]{2}\d{1,2}YT=(?:RR|XX)$/i.test(ctx.symbolUpper) ||
    /^US\d{2}[A-Z]{2}\d{2}=RR$/i.test(ctx.symbolUpper) ||
    includesAny(ctx.name, ['Year Yield', '10-Year Yield', 'Yield 10-Year', 'Government Bond 10Y', 'Gov 10Y']) ||
    /^US10[A-Z]{2}\d{2}=RR$/i.test(ctx.symbolUpper) ||
    includesAny(ctx.name, ['spread EUA', 'US 10A vs', 'US 10Y vs'])
  ) {
    return { category: 'rates', tags: ['rates'] }
  }
  return null
}

export function matchJgb(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (/^JGB\b/i.test(ctx.symbolUpper) || includesAny(ctx.name, ['JGB', 'Gov. Japão Futuros', 'Japan Gov Futures'])) {
    return { category: 'rates', tags: ['rates', 'futures'] }
  }
  return null
}

export function matchSovereignTenor(ctx: RuleContext): { category: string; tags: string[] } | null {
  const looksLikeSovereignTenor =
    includesAny(ctx.name, ['10-year', '20+ year', 'treasury', 'bond']) ||
    /^(?:[A-Z]{2})\d+(?:Y|M)T=RR$/i.test(ctx.symbolUpper) ||
    ctx.symbolUpper.endsWith('YT=RR') ||
    ctx.symbolUpper.endsWith('MT=RR') ||
    ctx.symbolUpper.endsWith('WT=RR') ||
    /\b(?:a|to)\s*(?:1|2|3|5|7|10|20|30)\s*(?:anos|years)\b/i.test(ctx.name) ||
    /\b(?:a|to)\s*(?:1|3|6|9)\s*(?:meses|months)\b/i.test(ctx.name) ||
    /^(?:TUC|TNC|WNC)\d+=?$/.test(ctx.symbolUpper) ||
    /^DAPC\d+$/i.test(ctx.symbolUpper) ||
    ctx.symbolUpper.startsWith('DDIC') ||
    includesAny(ctx.name, ['tesouro', 'titulo', 'título', 'ipca', 'ntn', 'dap']) ||
    (includesAny(ctx.name, ['spread']) && ctx.symbolUpper.endsWith('=RR'))

  if (looksLikeSovereignTenor) {
    return { category: 'rates', tags: ['risk_off'] }
  }

  return null
}

export function matchLocalRatesFutures(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    includesAny(ctx.name, ['futuro', 'futuros', 'future', 'futures']) &&
    includesAny(ctx.name, ['di', 'ipca', 'cupom']) &&
    (ctx.symbolUpper.startsWith('DAP') || ctx.symbolUpper.startsWith('DI') || ctx.symbolUpper.startsWith('DDI'))
  ) {
    return { category: 'rates', tags: ['risk_off'] }
  }
  return null
}

export function matchSofr(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (includesAny(ctx.name, ['sofr', 'fed funds']) || /^SRA/i.test(ctx.symbolUpper)) {
    return { category: 'rates', tags: ['risk_off'] }
  }
  return null
}

