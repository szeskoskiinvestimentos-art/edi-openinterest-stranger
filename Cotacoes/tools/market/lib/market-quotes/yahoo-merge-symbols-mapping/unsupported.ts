export function isLikelyUnsupportedYahooSymbol(sym: string) {
  if (!sym) return true
  if (/=$/.test(sym)) return true
  if (/=RR$/i.test(sym)) return true
  if (/=R$/i.test(sym)) return true
  if (/=FEDR$/i.test(sym)) return true
  if (/^[A-Z0-9]+(?:M)?c\d+$/i.test(sym)) return true
  if (/^\./.test(sym)) return true
  if (/\s-\s/.test(sym)) return true
  if (/c\d+-/i.test(sym) || /-c\d+/i.test(sym)) return true
  if (/-BTC$/i.test(sym) && !/-USD$/i.test(sym)) return true
  if (sym.toUpperCase() === '^TYVIX') return true
  return false
}
