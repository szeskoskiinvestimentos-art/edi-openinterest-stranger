import { FIAT_CODES, METALS_CODES } from './codes.js'

export function suggestYahooOverrideFromAuditItem(it: {
  assetSymbol: string
  yahooSymbol: string
  status: 'updated' | 'missing'
  reason?: string
}) {
  if (!it || it.status !== 'missing') return null
  const reason = String(it.reason || '')
  if (reason && reason !== 'not_returned') {
    const wantsFix =
      /=SA$/i.test(it.assetSymbol) || /=SA$/i.test(it.yahooSymbol) || /\s-\s/.test(it.assetSymbol) || /\s/.test(it.assetSymbol)
    if (!wantsFix) return null
  }

  const asset = String(it.assetSymbol || '').trim()
  if (!asset) return null

  const fixSa = asset.match(/^([A-Z]{4}\d{1,2})=SA$/i)
  if (fixSa) return `${fixSa[1].toUpperCase()}=${fixSa[1].toUpperCase()}.SA`

  const cryptoText = asset.match(/^([A-Z0-9]{2,10})\/(USD|USDT)\b/i)
  if (cryptoText) {
    const base = cryptoText[1].toUpperCase()
    if (!FIAT_CODES.has(base) && !METALS_CODES.has(base)) {
      return `${cryptoText[0].toUpperCase()}=${base}-${cryptoText[2].toUpperCase()}`
    }
  }

  const fxText = asset.match(/^([A-Z]{3})\/([A-Z]{3})\b/i)
  if (fxText) {
    const base = fxText[1].toUpperCase()
    const quote = fxText[2].toUpperCase()
    if ((FIAT_CODES.has(base) || METALS_CODES.has(base)) && FIAT_CODES.has(quote)) return `${fxText[0].toUpperCase()}=${base}${quote}=X`
  }

  const suffix = asset.match(/^([A-Z0-9_]+)\.(O|K|PK)$/i)
  if (suffix) return `${suffix[0]}=${suffix[1]}`

  const brStock = asset.match(/^([A-Z]{4}\d{1,2})$/)
  if (brStock) return `${brStock[1]}=${brStock[1]}.SA`

  const cryptoUsdX = asset.match(/^([A-Z0-9]{2,10})USD=X$/i)
  if (cryptoUsdX) {
    const p = cryptoUsdX[1].toUpperCase()
    if (!FIAT_CODES.has(p)) return `${asset}=${p}-USD`
  }

  return null
}
