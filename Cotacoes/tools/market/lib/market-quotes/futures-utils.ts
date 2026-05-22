export function numRaw(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (v && typeof v === 'object' && 'raw' in v) return numRaw((v as { raw?: unknown }).raw)
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function strRaw(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'raw' in v) return strRaw((v as { raw?: unknown }).raw)
  if (v === null || v === undefined) return null
  const s = String(v)
  return s ? s : null
}

export function findContractsDeep(v: unknown): unknown[] | null {
  if (!v) return null
  if (Array.isArray(v)) {
    for (const it of v) {
      const got = findContractsDeep(it)
      if (got) return got
    }
    return null
  }
  if (typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const direct = o.contracts
  if (Array.isArray(direct) && direct.length) {
    const first = direct[0] as Record<string, unknown>
    if (
      first &&
      typeof first === 'object' &&
      (Object.prototype.hasOwnProperty.call(first, 'contractSymbol') || Object.prototype.hasOwnProperty.call(first, 'symbol')) &&
      (Object.prototype.hasOwnProperty.call(first, 'expiration') || Object.prototype.hasOwnProperty.call(first, 'expirationDate'))
    ) {
      return direct
    }
  }
  for (const key of Object.keys(o)) {
    const got = findContractsDeep(o[key])
    if (got) return got
  }
  return null
}

export function fmtMonthYearFromUnixSec(sec: number) {
  const d = new Date(sec * 1000)
  const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'short', year: 'numeric' }).formatToParts(d)
  const month = String(parts.find(p => p.type === 'month')?.value || '').replace('.', '')
  const year = String(parts.find(p => p.type === 'year')?.value || '')
  return `${month}/${year}`
}

export type YahooSparkResponseLike = {
  spark?: {
    result?: Array<{ symbol?: string; response?: unknown[] }>
    error?: unknown
  }
}

export type FuturesDeps = {
  env: (name: string, fallback?: string) => string | undefined
  envBool: (name: string, fallback: boolean) => boolean
  envNumber: (name: string, fallback: number) => number
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}
