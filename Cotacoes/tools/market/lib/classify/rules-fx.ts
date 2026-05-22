import { isEmergingCurrency } from './fx.js'
import { includesAny } from './text.js'
import type { RuleContext } from './rules-context.js'

export function matchDxy(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (ctx.symbolUpper === '.DXY' || includesAny(ctx.name, ['US Dollar Index', 'DXY', 'Dollar Index', 'Indice Dolar'])) {
    return { category: 'fx_g10', tags: ['risk_off'] }
  }
  return null
}

export function matchWdo(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (/^WDO/i.test(ctx.symbolUpper)) {
    return { category: 'fx_emerging', tags: ['risk_off'] }
  }
  return null
}

export function matchFxSpot(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (ctx.exchangeUpper === 'FX' || (ctx.nameLower.includes(' - ') && ctx.nameLower.includes(' dollar '))) {
    const pair = (ctx.symbolCore.includes('/') ? ctx.symbolCore : ctx.name.split(' - ')[0].trim()) || ctx.symbolCore
    const parts = pair.split('/')
    const left = parts[0] || ''
    const right = parts[1] || ''
    const em = isEmergingCurrency(left) || isEmergingCurrency(right)
    const category = em ? 'fx_emerging' : 'fx_g10'
    const tags: string[] = []
    if (em) tags.push('risk_on')
    if (!em) tags.push('risk_off')
    if (pair.toUpperCase().includes('USD/CHF') || pair.toUpperCase().includes('USD/JPY')) tags.push('risk_off')
    return { category, tags }
  }
  return null
}

export function matchFxFuturesPair(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (includesAny(ctx.name, ['futuro', 'futuros', 'future', 'futures']) && ctx.symbolUpper.startsWith('.FU')) {
    const core = ctx.symbolUpper.replace(/^\./, '')
    const tail = core.replace(/^FU/i, '')
    let left = ''
    let right = ''
    if (tail.length === 6) {
      left = tail.slice(0, 3)
      right = tail.slice(3, 6)
    }
    if (!left || !right) {
      const m = String(ctx.name || '')
        .toUpperCase()
        .match(/\b([A-Z]{3})([A-Z]{3})\b/)
      if (m) {
        left = m[1] || ''
        right = m[2] || ''
      }
    }
    if (left && right) {
      const em = isEmergingCurrency(left) || isEmergingCurrency(right)
      const category = em ? 'fx_emerging' : 'fx_g10'
      const tags: string[] = ['futures']
      if (em) tags.push('risk_on')
      if (!em) tags.push('risk_off')
      if (`${left}/${right}`.includes('USD/CHF') || `${left}/${right}`.includes('USD/JPY')) tags.push('risk_off')
      return { category, tags }
    }
  }
  return null
}

export function matchBrc(ctx: RuleContext): { category: string; tags: string[] } | null {
  if ((ctx.symbolUpper === 'BRC1' || ctx.symbolUpper.startsWith('BRC')) && includesAny(ctx.name, ['real brasileiro', 'brazilian real'])) {
    return { category: 'fx_emerging', tags: ['risk_on'] }
  }
  return null
}

