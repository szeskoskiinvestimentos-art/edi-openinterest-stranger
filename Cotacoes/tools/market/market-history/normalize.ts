export function cleanDisplayName(symbol: string, name: string) {
  const sym = String(symbol || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  const symCore = sym.split(' - ')[0]?.trim() || sym
  let out = String(name || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  if (!out) return out

  for (let i = 0; i < 3; i++) {
    const m = out.match(/^(.+?)\s+\1$/)
    if (!m) break
    out = String(m[1] || '').trim()
  }

  if (sym && out === sym) {
    const parts = sym.split(' - ')
    const tail = parts.length > 1 ? parts.slice(1).join(' - ').trim() : ''
    if (symCore && tail && symCore !== sym) return `${symCore} — ${tail}`
    return symCore || out
  }

  if (symCore && out.startsWith(`${symCore} - `)) {
    out = `${symCore} — ${out.slice((symCore + ' - ').length).trim()}`
  }

  return out
}

export function normalizeSymbol(rawSymbol: string, rawName: string) {
  const sym = String(rawSymbol || '').trim()
  const up = sym.toUpperCase()
  const name = String(rawName || '').trim()

  if (
    up === 'DX' ||
    up === '.DXY' ||
    up === 'USDIDX' ||
    up === 'DX=F' ||
    /^DXC\d+$/i.test(up) ||
    (/\b(?:indice|índice)\s+d[oó]lar\b/i.test(name) && (up === 'DX' || up === '.DXY' || up === 'USDIDX'))
  ) {
    return 'USDX'
  }

  return sym
}

