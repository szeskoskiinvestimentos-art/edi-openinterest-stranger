import { includesAny } from './text.js'
import type { RuleContext } from './rules-context.js'

export function matchMetals(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (includesAny(ctx.name, ['gold', 'silver', 'platinum', 'palladium'])) {
    return { category: 'metals', tags: ['risk_off'] }
  }

  if (includesAny(ctx.name, ['copper', 'iron ore', 'minerio', 'aluminum', 'aluminio', 'nickel', 'niquel', 'zinc', 'lithium', 'litio'])) {
    return { category: 'metals', tags: ['risk_on'] }
  }

  return null
}

export function matchEnergy(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    includesAny(ctx.name, [
      'crude',
      'brent',
      'wti',
      'natural gas',
      'gas natural',
      'gasoline',
      'heating oil',
      'oil',
      'petroleo',
      'petróleo',
    ])
  ) {
    return { category: 'energy', tags: ['risk_on', 'oil'] }
  }

  return null
}

export function matchAgriculture(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (
    includesAny(ctx.name, [
      'corn',
      'milho',
      'wheat',
      'trigo',
      'soy',
      'soja',
      'coffee',
      'cafe',
      'café',
      'sugar',
      'acucar',
      'açúcar',
      'cotton',
      'algodao',
      'algodão',
      'cocoa',
      'cacau',
      'boi gordo',
      'gado',
    ])
  ) {
    return { category: 'agriculture', tags: ['risk_on'] }
  }

  return null
}

export function matchCommoditiesGeneric(ctx: RuleContext): { category: string; tags: string[] } | null {
  if (includesAny(ctx.name, ['futures', 'futuros', 'cfr', 'commodity'])) {
    return { category: 'commodities', tags: ['risk_on'] }
  }

  if (/^LXRc\d+$/i.test(ctx.symbolUpper) || includesAny(ctx.name, ['lumber', 'madeira serrada'])) {
    return { category: 'commodities', tags: ['risk_on'] }
  }

  if (/^LHC\d+$/i.test(ctx.symbolUpper) || includesAny(ctx.name, ['lean hogs', 'porco magro'])) {
    return { category: 'commodities', tags: ['risk_on'] }
  }

  return null
}

