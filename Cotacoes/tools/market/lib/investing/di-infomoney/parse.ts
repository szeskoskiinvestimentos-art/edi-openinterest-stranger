export function parsePtNumber(raw: string) {
  const s = String(raw || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\d,.-]/g, '')
    .trim()
  if (!s) return null
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const v = Number(normalized)
  return Number.isFinite(v) ? v : null
}

function monthCodeFromText(text: string) {
  const s = String(text || '').toLowerCase()
  if (/\bjan\b|\bjaneiro\b/.test(s)) return 'F'
  if (/\bfev\b|\bfevereiro\b|\bfeb\b/.test(s)) return 'G'
  if (/\bmar\b|\bmarço\b|\bmarco\b/.test(s)) return 'H'
  if (/\babr\b|\babril\b|\bapr\b/.test(s)) return 'J'
  if (/\bmai\b|\bmaio\b|\bmay\b/.test(s)) return 'K'
  if (/\bjun\b|\bjunho\b/.test(s)) return 'M'
  if (/\bjul\b|\bjulho\b/.test(s)) return 'N'
  if (/\bago\b|\bagosto\b|\baug\b/.test(s)) return 'Q'
  if (/\bset\b|\bsetembro\b|\bsep\b/.test(s)) return 'U'
  if (/\bout\b|\boutubro\b|\boct\b/.test(s)) return 'V'
  if (/\bnov\b|\bnovembro\b/.test(s)) return 'X'
  if (/\bdez\b|\bdezembro\b|\bdec\b/.test(s)) return 'Z'
  return null
}

export function inferDiSymbolFromMaturityText(maturity: string) {
  const direct = String(maturity || '').match(/\bDI1([FGHJKMNQUVXZ])(\d{2})\b/i)
  if (direct) return `DI1${direct[1].toUpperCase()}${direct[2]}`

  const s = String(maturity || '').replace(/\s+/g, ' ').trim()
  const parts = s.match(/([A-Za-zÀ-ÿ]{3,})\s*\/\s*(\d{2,4})/)
  if (!parts) return null

  const code = monthCodeFromText(parts[1])
  if (!code) return null

  const yRaw = parts[2]
  const yy = yRaw.length === 4 ? yRaw.slice(-2) : yRaw.padStart(2, '0')
  return `DI1${code}${yy}`
}

export function parseSignedPercent(raw: string) {
  const s = String(raw || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  if (!s) return null
  const n = parsePtNumber(s)
  if (n === null) return null
  if (/-/.test(s)) return -Math.abs(n)
  return Math.abs(n)
}

