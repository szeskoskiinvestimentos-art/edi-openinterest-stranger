import { includesAny } from './text.js'
import type { RuleContext } from './rules-context.js'

export function matchCrypto(ctx: RuleContext): { category: string; tags: string[] } | null {
  const tags: string[] = []

  if (
    (ctx.symbolUpper.endsWith('/USD') &&
      new Set([
        'BTC/USD',
        'ETH/USD',
        'SOL/USD',
        'DOGE/USD',
        'XRP/USD',
        'ADA/USD',
        'BNB/USD',
        'AVAX/USD',
        'LINK/USD',
        'LTC/USD',
      ]).has(ctx.symbolUpper)) ||
    ((ctx.symbolUpper.endsWith('/USD') || ctx.symbolUpper.endsWith('/BTC')) &&
      (ctx.isCryptoExchange ||
        includesAny(ctx.name, [
          'Crypto',
          'Bitcoin',
          'Ethereum',
          'Solana',
          'Dogecoin',
          'Litecoin',
          'Chainlink',
          'Avalanche',
          'Polkadot',
          'TRON',
        ])))
  ) {
    tags.push('risk_on')
    return { category: 'crypto', tags }
  }

  return null
}

