import type { MarketPoint, MarketQuotes } from '../types.js'

export type WebNewsModule = {
  ok?: boolean
  generatedAt?: string
  windowHours?: number
  items?: Array<{
    title?: string
    url?: string
    publishedAt?: string | null
    bucket?: string
    confidence?: string
  }>
}

type PetrobrasModuleRow = {
  key: string
  label: string
  phase: 'pre' | 'regular' | 'any'
  symbol: string | null
  asOf: string | null
  value: number | null
  unit: '%' | 'score'
  capAbs: number
  weight: number
  contribution: number | null
  note: string
}

export type PetrobrasModulePayload = {
  ok: boolean
  provider: 'petrobras_module'
  generatedAt: string
  phase: { nowLabel: string; cutoffLocal: string }
  score: { value: number; bias: 'COMPRA' | 'VENDA' | 'NEUTRO'; confidence: number }
  metrics: {
    usedRows: number
    breadth: { pos: number; neg: number; zero: number }
    contribution: { posSum: number; negSum: number; net: number }
    pnlLike: { posSum: number; negSum: number; net: number }
    flowCorr?: {
      baseSymbol: string | null
      windowPoints: number
      items: Array<{ label: string; corr: number | null; n: number }>
    }
  }
  rows: PetrobrasModuleRow[]
  missingCorrelated: Array<{ label: string; patterns: string[] }>
  news: { used: boolean; matched: number; score: number; top: Array<{ title: string; url: string }> }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function parseTimeMs(t: string) {
  const ms = Date.parse(String(t || ''))
  return Number.isFinite(ms) ? ms : NaN
}

function buildReturnSeries(market: MarketQuotes, symbol: string, maxPoints: number) {
  const arr = market && market.series ? market.series[symbol] : null
  if (!Array.isArray(arr) || arr.length < 3) return [] as Array<{ tMs: number; r: number }>

  const slice = maxPoints > 0 ? arr.slice(-Math.max(3, maxPoints)) : arr.slice()
  const out: Array<{ tMs: number; r: number }> = []

  for (let i = 1; i < slice.length; i++) {
    const a = slice[i - 1]
    const b = slice[i]
    if (!a || !b) continue
    const pa = a.price
    const pb = b.price
    if (!isFiniteNumber(pa) || !isFiniteNumber(pb) || pa <= 0 || pb <= 0) continue
    const tMs = parseTimeMs(b.t)
    if (!Number.isFinite(tMs)) continue
    const r = Math.log(pb / pa)
    if (!Number.isFinite(r)) continue
    out.push({ tMs, r })
  }

  return out
}

function pearson(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length)
  if (n < 20) return null
  let sx = 0
  let sy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]!
    sy += ys[i]!
  }
  const mx = sx / n
  const my = sy / n
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx
    const dy = ys[i]! - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  if (!(sxx > 0) || !(syy > 0)) return null
  const c = sxy / Math.sqrt(sxx * syy)
  return Number.isFinite(c) ? clamp(c, -1, 1) : null
}

function correlationAligned(a: Array<{ tMs: number; r: number }>, b: Array<{ tMs: number; r: number }>) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 20 || b.length < 20) return { corr: null, n: 0 }
  const mapB = new Map<number, number>()
  for (const p of b) {
    if (!p || !Number.isFinite(p.tMs) || !isFiniteNumber(p.r)) continue
    mapB.set(p.tMs, p.r)
  }
  const xs: number[] = []
  const ys: number[] = []
  for (const p of a) {
    if (!p || !Number.isFinite(p.tMs) || !isFiniteNumber(p.r)) continue
    const r2 = mapB.get(p.tMs)
    if (!isFiniteNumber(r2)) continue
    xs.push(p.r)
    ys.push(r2)
  }
  const corr = pearson(xs, ys)
  return { corr, n: xs.length }
}

function lastPoint(market: MarketQuotes, symbol: string): MarketPoint | null {
  const arr = market && market.series ? market.series[symbol] : null
  if (!Array.isArray(arr) || !arr.length) return null
  return arr[arr.length - 1] || null
}

function pctFromPoint(point: MarketPoint | null, preferExtended: boolean) {
  if (!point) return null
  if (preferExtended && isFiniteNumber(point.extendedChangePct)) return point.extendedChangePct
  if (isFiniteNumber(point.changePct)) return point.changePct
  if (!preferExtended && isFiniteNumber(point.extendedChangePct)) return point.extendedChangePct
  return null
}

function asOfFromPoint(point: MarketPoint | null) {
  if (!point) return null
  const v = (point.asOf || point.t || '').trim()
  return v || null
}

function findSymbol(market: MarketQuotes, matcher: RegExp) {
  const assets = market && Array.isArray(market.assets) ? market.assets : []
  for (const a of assets) {
    const symRaw = String(a && a.symbol ? a.symbol : '')
    const sym = symRaw.trim()
    const symCore = (sym.split(' - ')[0] || sym).trim()
    const name = String(a && a.name ? a.name : '')
    if (matcher.test(sym) || matcher.test(symCore) || matcher.test(name)) return symRaw
  }
  const series = market && market.series && typeof market.series === 'object' ? market.series : null
  if (series) {
    for (const symRaw of Object.keys(series)) {
      const sym = String(symRaw || '').trim()
      const symCore = (sym.split(' - ')[0] || sym).trim()
      if (matcher.test(sym) || matcher.test(symCore)) return symRaw
    }
  }
  return null
}

function findSymbolByMatchers(market: MarketQuotes, matchers: RegExp[]) {
  for (const m of matchers) {
    const sym = findSymbol(market, m)
    if (sym) return sym
  }
  return null
}

function avgPctForSymbols(market: MarketQuotes, symbols: string[], preferExtended: boolean) {
  const pts = symbols
    .map(s => ({ s, p: pctFromPoint(lastPoint(market, s), preferExtended) }))
    .filter(x => isFiniteNumber(x.p))
  if (!pts.length) return { pct: null, used: [] as string[] }
  const pct = pts.reduce((acc, x) => acc + (x.p as number), 0) / pts.length
  return { pct, used: pts.map(x => x.s) }
}

function computeNewsTilt(webNews: WebNewsModule | null | undefined) {
  const ok = !!(webNews && webNews.ok === true && Array.isArray(webNews.items))
  const items = ok ? (webNews!.items || []).slice(0, 40) : []

  const kwMatch = (s: string) =>
    /\bpetrobras\b|\bpetr3\b|\bpetr4\b|\bpbr\b|\bpbra\b|\bfuel\b|\bgasoline\b|\bdiesel\b|\brefiner|\bparity\b|\bpreço\b|\bprecos\b|\bcombust|\bopec\b|\bbrent\b|\bwti\b|\boil\b|\bmiddle\s+east\b|\biran\b|\brussia\b|\bsanction\b|\bwar\b|\bconflict\b|\bbrasil\b|\bbrazil\b|\blula\b|\bhaddad\b|\bcongress\b|\bcopom\b|\bbcb\b/i.test(
      s,
    )

  const pos = [
    /\brally\b/i,
    /\bsurge\b/i,
    /\bgain\b/i,
    /\brise\b/i,
    /\bcut\b/i,
    /\bdeal\b/i,
    /\bagreement\b/i,
    /\brelief\b/i,
    /\bbull\b/i,
    /\bup\b/i,
    /\bmelhora\b/i,
    /\bqueda\s+do\s+d[oó]lar\b/i,
  ]

  const neg = [
    /\bcrash\b/i,
    /\bplunge\b/i,
    /\bfall\b/i,
    /\bdrop\b/i,
    /\bshock\b/i,
    /\bban\b/i,
    /\bsanction\b/i,
    /\bwar\b/i,
    /\bconflict\b/i,
    /\bcrisis\b/i,
    /\btensions\b/i,
    /\bhawkish\b/i,
    /\binflation\b/i,
    /\byields?\s+(?:rise|jump|up)\b/i,
    /\bsubi(?:u|ram)\s+juros\b/i,
    /\baumento\b/i,
    /\bqueda\b/i,
  ]

  const confW = (c: unknown) => {
    const s = String(c || '').toLowerCase()
    if (s.includes('alta')) return 1.3
    if (s.includes('média') || s.includes('media')) return 1.0
    if (s.includes('baixa')) return 0.7
    return 0.9
  }

  let score = 0
  let matched = 0
  const top: Array<{ title: string; url: string }> = []

  for (const it of items) {
    const title = String(it && it.title ? it.title : '').trim()
    const url = String(it && it.url ? it.url : '').trim()
    if (!title || !kwMatch(title)) continue
    matched++
    if (top.length < 6) top.push({ title, url })
    const w = confW(it && it.confidence)
    let s = 0
    for (const re of pos) if (re.test(title)) s += 1
    for (const re of neg) if (re.test(title)) s -= 1
    score += w * clamp(s, -3, 3)
  }

  const denom = matched > 0 ? matched * 3 : 1
  const normalized = clamp(score / denom, -1, 1)
  return { used: ok, matched, score: normalized, top }
}

export function buildPetrobrasModule(input: {
  market: MarketQuotes
  webNews?: WebNewsModule | null
  now?: Date
}): PetrobrasModulePayload {
  const market = input.market
  const now = input.now || new Date()
  const generatedAt = market && market.meta && typeof market.meta.generatedAt === 'string' ? market.meta.generatedAt : new Date().toISOString()

  const cutoffHour = 10
  const isPre = now.getHours() < cutoffHour
  let phaseLabel = isPre ? 'PRÉ (até 10:00)' : 'REGULAR'

  const symPETR4 = findSymbol(market, /\bPETR4(?:\.SA)?\b/i)
  const symPETR3 = findSymbol(market, /\bPETR3(?:\.SA)?\b/i)
  const symPBR = findSymbol(market, /(^PBR$|\bPBR\b)/i)
  const symPBRA = findSymbol(market, /(^PBRA$|\bPBRA\b)/i)

  const symUSDBRL = findSymbol(market, /^USD\/BRL\b/i)
  const symIBOV = findSymbol(market, /(^\.BVSP$|\bIBOV\b|\bIbovespa\b)/i)
  const symIBRX = findSymbol(market, /(^\.IBRX$|\bIBRX\b|\bIBrX\b|\bÍndice\s*Brasil\s*100\b|\bIndice\s*Brasil\s*100\b)/i)
  const symBR20 = findSymbolByMatchers(market, [
    /^\.BR20T$/i,
    /^\.BR20$/i,
    /\bBR\s*20\b/i,
    /\bBR-?20\b/i,
    /\bBrasil\s*20\b/i,
  ])
  const symBOVA11 = findSymbol(market, /\bBOVA11(?:\.SA)?\b/i)
  const symWIN = findSymbolByMatchers(market, [
    /^WIN/i,
    /\bWINc\d\b/i,
    /\bmini\s*ibovespa\b/i,
    /\bibovespa\s*futuros?\b/i,
    /\bmini\s*índice\b/i,
    /\bmini\s*indice\b/i,
    /\bíndice\s*futuro\b/i,
    /\bindice\s*futuro\b/i,
  ])
  const symWDO = findSymbolByMatchers(market, [
    /^WDO/i,
    /\bWDOc\d\b/i,
    /\bmini\s*dólar\b/i,
    /\bmini\s*dolar\b/i,
  ])
  const symEWZ = findSymbolByMatchers(market, [
    /^EWZ$/i,
    /^EWZS(\.\w+)?$/i,
    /\bBrazil\b.*\bSmall\b.*\bCap\b.*\bETF\b/i,
  ])
  const symDXY = findSymbol(market, /(^\.DXY$|\bDXY\b)/i)
  const symUSDMXN = findSymbol(market, /^USD\/MXN\b/i)
  const symUSDZAR = findSymbol(market, /^USD\/ZAR\b/i)
  const symUSDCLP = findSymbol(market, /^USD\/CLP\b/i)
  const symUSDTRY = findSymbol(market, /^USD\/TRY\b/i)

  const symBrent = findSymbolByMatchers(market, [
    /^LCOc\d$/i,
    /^BRNc\d$/i,
    /^BRN$/i,
    /^LCO\b/i,
    /^BZ=F$/i,
    /^BZ[HMUZ]\d{2}$/i,
    /^BNO$/i,
    /\bUKOIL\b/i,
    /\bBrent\b/i,
    /\bBRENT\b/i,
  ])
  const symWti = findSymbolByMatchers(market, [
    /^CLc\d$/i,
    /^CL[HMUZ]\d{2}$/i,
    /^CL$/i,
    /^CL=F$/i,
    /^DBO$/i,
    /\bUSOIL\b/i,
    /\bWTI\b/i,
  ])
  const symUSO = findSymbol(market, /^USO$/i)
  const symXLE = findSymbol(market, /^XLE$/i)
  const symXOP = findSymbol(market, /^XOP$/i)
  const symOIH = findSymbol(market, /^OIH$/i)
  const symRBOB = findSymbolByMatchers(market, [
    /^RB=F$/i,
    /^RBc\d$/i,
    /^LRBc\d$/i,
    /^GPR$/i,
    /\bgasolina\b.*\brbob\b/i,
    /\brbob\b.*\bgasolina\b/i,
    /\bgasolina\b.*\bfuturos?\b/i,
    /\brbob\s+gasoline\s+futures\b/i,
    /\bgasoline\b.*\brbob\b/i,
    /\brbob\b/i,
  ])
  const symHO = findSymbolByMatchers(market, [
    /^HO=F$/i,
    /^LGOc\d$/i,
    /^LHOc\d$/i,
    /\bgas\s*oil\b(?!.*\bspread\b)/i,
    /\bgasoil\b(?!.*\bspread\b)/i,
    /\bdiesel\b(?!.*\bspread\b)/i,
    /\bulsd\b(?!.*\bspread\b)/i,
    /\bheating\s*oil\b(?!.*\bspread\b)/i,
    /\bgas\s*oil\b/i,
    /\bgasoil\b/i,
    /\bdiesel\b/i,
    /\bulsd\b/i,
    /\bheating\s*oil\b/i,
  ])
  const symHeatingOilUS = findSymbolByMatchers(market, [
    /^LHOc\d$/i,
    /^NYF$/i,
    /\bóleo\s+de\s+aque(?:c|ç)imento\b/i,
    /\bheating\s*oil\b(?!.*\bspread\b)/i,
  ])

  const symBR2Y = findSymbol(market, /^BR2YT=RR$/i)
  const symBR10Y = findSymbol(market, /^BR10YT=RR$/i)
  const symUS10BR10 = findSymbol(market, /^US10BR10=RR$/i)
  const symBRCDS5Y = findSymbol(market, /^BRGV5YUSAC=R$/i)
  const symVXBR = findSymbol(market, /(^\.VXBR$|\bVXBR\b)/i)
  const symVIX = findSymbolByMatchers(market, [/^VIX$/i, /^\.VIX\b/i])
  const symOVX = findSymbolByMatchers(market, [/^\.OVX$/i, /^OVX$/i, /\bCrude Oil Volatility\b/i])
  const symUS10Y = findSymbolByMatchers(market, [
    /^US10YT=X$/i,
    /^US10YT=RR$/i,
    /^\.TNX$/i,
    /^\^TNX$/i,
    /^TNc\d=\$?$/i,
    /\b10\s*Year\s*Treasury\s*Yield\b/i,
    /\bUnited States\b.*\b10\b.*\bYear\b/i,
  ])

  const majors = ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'EQNR', 'COP', 'OXY']
  const majorsPresent = majors.map(s => findSymbol(market, new RegExp(`^${s}$`, 'i'))).filter(Boolean) as string[]
  const majorsAvg = avgPctForSymbols(market, majorsPresent, true)

  const news = computeNewsTilt(input.webNews)

  const rows: PetrobrasModuleRow[] = []

  const addPctRow = (cfg: {
    key: string
    label: string
    phase: PetrobrasModuleRow['phase']
    symbol: string | null
    preferExtended: boolean
    weight: number
    capAbs: number
    invert?: boolean
    note: string
  }) => {
    const pt = cfg.symbol ? lastPoint(market, cfg.symbol) : null
    const pct = cfg.symbol ? pctFromPoint(pt, cfg.preferExtended) : null
    const v = isFiniteNumber(pct) ? (cfg.invert ? -pct : pct) : null
    const contrib =
      v === null ? null : cfg.weight * (cfg.capAbs > 0 ? clamp(v, -cfg.capAbs, cfg.capAbs) / cfg.capAbs : 0)
    rows.push({
      key: cfg.key,
      label: cfg.label,
      phase: cfg.phase,
      symbol: cfg.symbol,
      asOf: asOfFromPoint(pt),
      value: v,
      unit: '%',
      capAbs: cfg.capAbs,
      weight: cfg.weight,
      contribution: contrib,
      note: cfg.note,
    })
  }

  const addSpreadRow = (cfg: {
    key: string
    label: string
    phase: PetrobrasModuleRow['phase']
    symbolA: string | null
    preferA: boolean
    symbolB: string | null
    preferB: boolean
    weight: number
    capAbs: number
    invert?: boolean
    note: string
  }) => {
    const ptA = cfg.symbolA ? lastPoint(market, cfg.symbolA) : null
    const ptB = cfg.symbolB ? lastPoint(market, cfg.symbolB) : null
    const pctA = cfg.symbolA ? pctFromPoint(ptA, cfg.preferA) : null
    const pctB = cfg.symbolB ? pctFromPoint(ptB, cfg.preferB) : null
    let v: number | null = null
    if (isFiniteNumber(pctA) && isFiniteNumber(pctB)) v = pctA - pctB
    if (cfg.invert && v !== null) v = -v
    const contrib =
      v === null ? null : cfg.weight * (cfg.capAbs > 0 ? clamp(v, -cfg.capAbs, cfg.capAbs) / cfg.capAbs : 0)
    rows.push({
      key: cfg.key,
      label: cfg.label,
      phase: cfg.phase,
      symbol: cfg.symbolA || cfg.symbolB,
      asOf: asOfFromPoint(ptA || ptB),
      value: v,
      unit: '%',
      capAbs: cfg.capAbs,
      weight: cfg.weight,
      contribution: contrib,
      note: cfg.note,
    })
  }

  addPctRow({
    key: 'pbr_adr',
    label: 'Petrobras ADR (PBR) • Extended',
    phase: 'pre',
    symbol: symPBR,
    preferExtended: true,
    weight: 3.4,
    capAbs: 4,
    note: 'Proxy direto do pré-mercado USA para Petrobras.',
  })
  addSpreadRow({
    key: 'pbr_minus_brent',
    label: 'PBR − Brent (idiossincrático)',
    phase: 'pre',
    symbolA: symPBR,
    preferA: true,
    symbolB: symBrent,
    preferB: true,
    weight: 0.6,
    capAbs: 3,
    note: 'Remove o componente “petróleo” para destacar risco político/empresa no pré.',
  })
  addSpreadRow({
    key: 'pbr_minus_ewz',
    label: 'PBR − EWZ (idiossincrático)',
    phase: 'pre',
    symbolA: symPBR,
    preferA: true,
    symbolB: symEWZ,
    preferB: true,
    weight: 0.45,
    capAbs: 3,
    note: 'Remove o componente “Brasil” para destacar risco específico Petrobras no pré.',
  })
  addPctRow({
    key: 'pbr_adr_regular',
    label: 'Petrobras ADR (PBR)',
    phase: 'regular',
    symbol: symPBR,
    preferExtended: false,
    weight: 1.0,
    capAbs: 4,
    note: 'Confirmação durante o pregão (ADR em horário regular).',
  })
  addPctRow({
    key: 'pbra_adr',
    label: 'Petrobras ADR (PBRA) • Extended',
    phase: 'pre',
    symbol: symPBRA,
    preferExtended: true,
    weight: 1.6,
    capAbs: 4,
    note: 'Complemento (nem sempre presente no CSV).',
  })
  addPctRow({
    key: 'pbra_adr_regular',
    label: 'Petrobras ADR (PBRA)',
    phase: 'regular',
    symbol: symPBRA,
    preferExtended: false,
    weight: 0.45,
    capAbs: 4,
    note: 'Complemento durante o pregão (quando disponível).',
  })
  addPctRow({
    key: 'petr4',
    label: 'PETR4 (B3)',
    phase: 'regular',
    symbol: symPETR4,
    preferExtended: false,
    weight: 0,
    capAbs: 4,
    note: 'Ativo operável (execução). A variação é consequência; não entra no score de drivers.',
  })
  addPctRow({
    key: 'petr3',
    label: 'PETR3 (B3)',
    phase: 'regular',
    symbol: symPETR3,
    preferExtended: false,
    weight: 0,
    capAbs: 4,
    note: 'Ativo operável (execução). A variação é consequência; não entra no score de drivers.',
  })
  addPctRow({
    key: 'brent',
    label: 'Brent',
    phase: 'any',
    symbol: symBrent,
    preferExtended: true,
    weight: 2.6,
    capAbs: 3,
    note: 'Driver primário (petróleo).',
  })
  addPctRow({
    key: 'wti',
    label: 'WTI',
    phase: 'any',
    symbol: symWti,
    preferExtended: true,
    weight: 1.0,
    capAbs: 3,
    note: 'Driver secundário (petróleo).',
  })
  addSpreadRow({
    key: 'brent_minus_wti',
    label: 'Brent − WTI (spread)',
    phase: 'any',
    symbolA: symBrent,
    preferA: true,
    symbolB: symWti,
    preferB: true,
    weight: 0.35,
    capAbs: 2.5,
    note: 'Spread de referência global; pode sinalizar dislocações regionais no petróleo.',
  })
  addSpreadRow({
    key: 'crack_ulsd_brent',
    label: 'Crack ULSD - Brent (margem)',
    phase: 'any',
    symbolA: symHO,
    preferA: false,
    symbolB: symBrent,
    preferB: true,
    weight: 0.6,
    capAbs: 3,
    note: 'Margem refinado: ULSD vs Brent; positiva favorece repasse.',
  })
  addSpreadRow({
    key: 'crack_rbob_brent',
    label: 'Crack Gasolina - Brent (margem)',
    phase: 'any',
    symbolA: symRBOB,
    preferA: false,
    symbolB: symBrent,
    preferB: true,
    weight: 0.5,
    capAbs: 3,
    note: 'Margem refinado: RBOB vs Brent; positiva favorece repasse.',
  })
  addPctRow({
    key: 'xle',
    label: 'XLE (Energy ETF)',
    phase: 'any',
    symbol: symXLE,
    preferExtended: false,
    weight: 0.7,
    capAbs: 2.5,
    note: 'Sentimento setorial de energia (EUA).',
  })
  addPctRow({
    key: 'xop',
    label: 'XOP (E&P ETF)',
    phase: 'any',
    symbol: symXOP,
    preferExtended: false,
    weight: 0.55,
    capAbs: 3,
    note: 'Tendência do segmento de exploração & produção (EUA).',
  })
  addPctRow({
    key: 'oih',
    label: 'OIH (Oil Services ETF)',
    phase: 'any',
    symbol: symOIH,
    preferExtended: false,
    weight: 0.35,
    capAbs: 3,
    note: 'Serviços de petróleo (capex/ciclo).',
  })
  addPctRow({
    key: 'uso',
    label: 'USO (WTI ETF)',
    phase: 'any',
    symbol: symUSO,
    preferExtended: false,
    weight: 0.25,
    capAbs: 3,
    note: 'Proxy adicional de WTI quando CL não está no watchlist.',
  })
  addPctRow({
    key: 'rbob',
    label: 'RBOB Gasoline (RB=F)',
    phase: 'any',
    symbol: symRBOB,
    preferExtended: false,
    weight: 0.35,
    capAbs: 3,
    note: 'Produto refinado (gasolina) – contexto de margens/repasse.',
  })
  addPctRow({
    key: 'heating_oil',
    label: 'ULSD / Heating Oil (HO=F)',
    phase: 'any',
    symbol: symHO,
    preferExtended: false,
    weight: 0.35,
    capAbs: 3,
    note: 'Produto refinado (diesel/ULSD) – contexto de margens/repasse.',
  })
  addPctRow({
    key: 'heating_oil_us',
    label: 'Heating Oil (confirm)',
    phase: 'any',
    symbol: symHeatingOilUS,
    preferExtended: false,
    weight: 0.15,
    capAbs: 3,
    note: 'Confirmação (diesel/ULSD EUA). Não substitui Gas Oil (Europa).',
  })
  const pctFor = (sym: string | null, preferExtended: boolean) =>
    sym ? pctFromPoint(lastPoint(market, sym), preferExtended) : null
  const oilAvgPct = (() => {
    const xs = [pctFor(symBrent, true), pctFor(symWti, true)].filter(isFiniteNumber) as number[]
    if (!xs.length) return null
    return xs.reduce((a, b) => a + b, 0) / xs.length
  })()
  const oilStrength = isFiniteNumber(oilAvgPct) ? clamp(Math.max(0, oilAvgPct) / 4, 0, 1) : 0
  const usdbrlDynamicWeight = 0.7 * (1 - 0.4 * oilStrength)
  addPctRow({
    key: 'usdbrl',
    label: 'USD/BRL',
    phase: 'any',
    symbol: symUSDBRL,
    preferExtended: false,
    weight: usdbrlDynamicWeight,
    capAbs: 2.5,
    note: 'Efeito misto: receita USD vs. risco político de repasse (paridade).',
  })
  addPctRow({
    key: 'ibov',
    label: 'Ibovespa',
    phase: 'any',
    symbol: symIBOV,
    preferExtended: false,
    weight: 0.8,
    capAbs: 2.5,
    note: 'Beta Brasil (risk-on/off local).',
  })
  addPctRow({
    key: 'ibrx',
    label: 'IBRX (Índice Brasil 100)',
    phase: 'any',
    symbol: symIBRX,
    preferExtended: false,
    weight: 0.25,
    capAbs: 2.5,
    note: 'Beta Brasil (carteira ampla). Útil como confirmação do IBOV quando disponível no CSV.',
  })
  addPctRow({
    key: 'br20',
    label: 'BR20 (Índice Brasil 20)',
    phase: 'any',
    symbol: symBR20,
    preferExtended: false,
    weight: 0.25,
    capAbs: 2.5,
    note: 'Beta Brasil (large caps). Ajuda a ler Petrobras junto de “líderes” e reduzir ruído do IBOV.',
  })
  addPctRow({
    key: 'bova11',
    label: 'BOVA11 (ETF B3)',
    phase: 'any',
    symbol: symBOVA11,
    preferExtended: false,
    weight: 0.4,
    capAbs: 2.5,
    note: 'Proxy Ibovespa via ETF (às vezes mais disponível que .BVSP no watchlist).',
  })
  addPctRow({
    key: 'win',
    label: 'WIN (mini índice)',
    phase: 'any',
    symbol: symWIN,
    preferExtended: false,
    weight: 0.25,
    capAbs: 2.5,
    note: 'Proxy intraday (futuro) para risco Brasil, útil no pregão.',
  })
  addPctRow({
    key: 'wdo',
    label: 'WDO (mini dólar)',
    phase: 'any',
    symbol: symWDO,
    preferExtended: false,
    weight: 0.2,
    capAbs: 2.5,
    note: 'Proxy intraday (futuro) para USD/BRL, útil no pregão.',
  })
  addPctRow({
    key: 'ewz',
    label: 'EWZ (ETF Brasil)',
    phase: 'any',
    symbol: symEWZ,
    preferExtended: true,
    weight: 0.55,
    capAbs: 2.5,
    note: 'Proxy Brasil no exterior (útil no pré).',
  })
  addSpreadRow({
    key: 'ewz_minus_xle',
    label: 'Brasil vs Energia (EWZ − XLE)',
    phase: 'any',
    symbolA: symEWZ,
    preferA: true,
    symbolB: symXLE,
    preferB: false,
    weight: 0.35,
    capAbs: 2.5,
    note: 'Driver relativo: Brasil performando acima/abaixo do setor de energia (evita duplicar petróleo puro).',
  })
  addPctRow({
    key: 'dxy',
    label: 'DXY (USD Index)',
    phase: 'any',
    symbol: symDXY,
    preferExtended: false,
    weight: -0.45,
    capAbs: 2.0,
    invert: false,
    note: 'Dólar forte tende a apertar condições globais (proxy de risco).',
  })

  addPctRow({
    key: 'us10y',
    label: 'US 10Y (yield)',
    phase: 'any',
    symbol: symUS10Y,
    preferExtended: false,
    weight: 0.25,
    capAbs: 1.8,
    invert: true,
    note: 'Juros longos EUA subindo costuma apertar condições financeiras e pesar em risco/global.',
  })

  addPctRow({
    key: 'br10y',
    label: 'Brasil 10Y (BR10YT=RR)',
    phase: 'any',
    symbol: symBR10Y,
    preferExtended: false,
    weight: 0.7,
    capAbs: 1.8,
    invert: true,
    note: 'Carry trade/condições financeiras: juros longos subindo costuma pesar para equities.',
  })

  addPctRow({
    key: 'br2y',
    label: 'Brasil 2Y (BR2YT=RR)',
    phase: 'any',
    symbol: symBR2Y,
    preferExtended: false,
    weight: 0.5,
    capAbs: 1.8,
    invert: true,
    note: 'Sensível a política monetária/curto prazo; alta tende a piorar valuation.',
  })

  addPctRow({
    key: 'us10br10',
    label: 'Spread BR10Y vs US10Y (US10BR10=RR)',
    phase: 'any',
    symbol: symUS10BR10,
    preferExtended: false,
    weight: 0.45,
    capAbs: 2.0,
    invert: true,
    note: 'Risco Brasil relativo: abertura do spread tende a sinalizar stress/carry pior.',
  })

  addPctRow({
    key: 'br_cds_5y',
    label: 'Brasil CDS 5Y USD (BRGV5YUSAC=R)',
    phase: 'any',
    symbol: symBRCDS5Y,
    preferExtended: false,
    weight: 0.55,
    capAbs: 3.0,
    invert: true,
    note: 'Risco soberano (política/fiscal). CDS subindo tende a penalizar ativos Brasil.',
  })

  addPctRow({
    key: 'vxbr',
    label: 'Ibovespa VIX (VXBR)',
    phase: 'any',
    symbol: symVXBR,
    preferExtended: false,
    weight: 0.45,
    capAbs: 8,
    invert: true,
    note: 'Volatilidade implícita local (risk-off).',
  })

  addPctRow({
    key: 'vix',
    label: 'VIX (EUA)',
    phase: 'any',
    symbol: symVIX,
    preferExtended: false,
    weight: 0.35,
    capAbs: 8,
    invert: true,
    note: 'Risk-off global; tende a contaminar emergentes e Petrobras.',
  })
  addPctRow({
    key: 'ovx',
    label: 'OVX (volatilidade do petróleo)',
    phase: 'any',
    symbol: symOVX,
    preferExtended: false,
    weight: 0.35,
    capAbs: 10,
    invert: true,
    note: 'Volatilidade implícita do petróleo; stress no óleo tende a aumentar risco de ruído/repasse.',
  })

  if (majorsPresent.length) {
    const v = isFiniteNumber(majorsAvg.pct) ? majorsAvg.pct : null
    const contrib = v === null ? null : 0.9 * (clamp(v, -2.5, 2.5) / 2.5)
    rows.push({
      key: 'majors_avg',
      label: `Majors Oil (média: ${majorsPresent.join(', ')})`,
      phase: 'any',
      symbol: majorsPresent[0] || null,
      asOf: null,
      value: v,
      unit: '%',
      capAbs: 2.5,
      weight: 0.9,
      contribution: contrib,
      note: 'Confirmação setorial (média simples dos presentes no CSV).',
    })
  } else {
    rows.push({
      key: 'majors_avg',
      label: 'Majors Oil (média)',
      phase: 'any',
      symbol: null,
      asOf: null,
      value: null,
      unit: '%',
      capAbs: 2.5,
      weight: 0.9,
      contribution: null,
      note: 'Adicione majors (XOM, CVX, SHEL, BP, TTE...) no Investing para habilitar.',
    })
  }

  rows.push({
    key: 'news_tilt',
    label: 'Notícias (tilt automático)',
    phase: 'any',
    symbol: null,
    asOf: input.webNews && input.webNews.generatedAt ? String(input.webNews.generatedAt) : null,
    value: news.used ? news.score : null,
    unit: 'score',
    capAbs: 1,
    weight: 1.4,
    contribution: news.used ? 1.4 * news.score : null,
    note: news.used ? `Heurística por palavras-chave (match: ${news.matched}).` : 'Web News Module indisponível.',
  })

  const phaseKey = isPre ? 'pre' : 'regular'
  const usedRows = rows.filter(r => r.phase === 'any' || r.phase === phaseKey)
  const contribs = usedRows.map(r => (isFiniteNumber(r.contribution) ? r.contribution : 0))
  const scoreRaw = contribs.reduce((a, b) => a + b, 0)
  let score = clamp(scoreRaw, -10, 10)

  const wAll = usedRows.reduce((acc, r) => acc + (isFiniteNumber(r.weight) ? Math.abs(r.weight) : 0), 0) || 1
  const wHave = usedRows.reduce((acc, r) => acc + (r.contribution === null ? 0 : Math.abs(r.weight)), 0)
  const confidence = clamp(wHave / wAll, 0, 1)

  let bias: PetrobrasModulePayload['score']['bias'] = score > 1.6 ? 'COMPRA' : score < -1.6 ? 'VENDA' : 'NEUTRO'
  if (!isPre) {
    const tapeSym = symPETR4 || symPETR3
    const tapePct = tapeSym ? pctFromPoint(lastPoint(market, tapeSym), false) : null
    if (isFiniteNumber(tapePct) && Math.abs(tapePct) >= 0.9) {
      const tapeBias: PetrobrasModulePayload['score']['bias'] = tapePct > 0 ? 'COMPRA' : 'VENDA'
      if (bias === 'NEUTRO' || bias === tapeBias) {
        bias = tapeBias
        score = tapePct > 0 ? Math.max(score, 1.8) : Math.min(score, -1.8)
        score = clamp(score, -10, 10)
        phaseLabel = `${phaseLabel} • TAPE`
      } else {
        phaseLabel = `${phaseLabel} • TAPE (diverg.)`
      }
    }
  }

  const metrics: PetrobrasModulePayload['metrics'] = (() => {
    const breadth = { pos: 0, neg: 0, zero: 0 }
    const contribution = { posSum: 0, negSum: 0, net: 0 }
    const pnlLike = { posSum: 0, negSum: 0, net: 0 }

    for (const r of usedRows) {
      const c = isFiniteNumber(r.contribution) ? r.contribution : null
      if (c !== null) {
        contribution.net += c
        if (c > 0) {
          breadth.pos += 1
          contribution.posSum += c
        } else if (c < 0) {
          breadth.neg += 1
          contribution.negSum += c
        } else {
          breadth.zero += 1
        }
      }

      const v = isFiniteNumber(r.value) ? r.value : null
      if (v !== null && isFiniteNumber(r.capAbs) && r.capAbs > 0 && isFiniteNumber(r.weight)) {
        const pnl = r.weight * clamp(v, -r.capAbs, r.capAbs)
        pnlLike.net += pnl
        if (pnl > 0) pnlLike.posSum += pnl
        else if (pnl < 0) pnlLike.negSum += pnl
      }
    }

    return { usedRows: usedRows.length, breadth, contribution, pnlLike }
  })()

  const flowCorr: NonNullable<PetrobrasModulePayload['metrics']['flowCorr']> = (() => {
    const windowPoints = 180
    const baseSymbol = (isPre ? symPBR || symPBRA : symPETR4 || symPETR3) || symPBR || symPBRA || symPETR4 || symPETR3
    const base = baseSymbol ? buildReturnSeries(market, baseSymbol, windowPoints) : []

    const corrWithBase = (label: string, other: string | null) => {
      if (!baseSymbol || !other) return { label, corr: null, n: 0 }
      const b = buildReturnSeries(market, other, windowPoints)
      const out = correlationAligned(base, b)
      return { label, corr: out.corr, n: out.n }
    }

    const corrBrlEmBasket = (() => {
      if (!symUSDBRL) return { label: 'USD/BRL × EM Basket', corr: null, n: 0 }
      const basketSymbols = [
        { symbol: symUSDMXN, w: 0.35 },
        { symbol: symUSDZAR, w: 0.35 },
        { symbol: symUSDCLP, w: 0.15 },
        { symbol: symUSDTRY, w: 0.15 },
      ].filter(x => !!x.symbol && isFiniteNumber(x.w) && x.w > 0) as Array<{ symbol: string; w: number }>
      if (basketSymbols.length < 2) return { label: 'USD/BRL × EM Basket', corr: null, n: 0 }

      const seriesByT = basketSymbols.map(x => ({
        w: x.w,
        map: new Map(buildReturnSeries(market, x.symbol, windowPoints).map(p => [p.tMs, p.r])),
      }))
      const wSum = seriesByT.reduce((s, x) => s + x.w, 0)
      if (!(wSum > 0)) return { label: 'USD/BRL × EM Basket', corr: null, n: 0 }

      const ref = buildReturnSeries(market, symUSDBRL, windowPoints)
      const basket: Array<{ tMs: number; r: number }> = []
      for (const p of ref) {
        if (!p || !Number.isFinite(p.tMs)) continue
        let sum = 0
        let w = 0
        let n = 0
        for (const s of seriesByT) {
          const r = s.map.get(p.tMs)
          if (!isFiniteNumber(r)) continue
          sum += r * s.w
          w += s.w
          n += 1
        }
        if (n < 2 || !(w > 0)) continue
        const v = sum / w
        if (!Number.isFinite(v)) continue
        basket.push({ tMs: p.tMs, r: v })
      }
      const out = correlationAligned(ref, basket)
      return { label: 'USD/BRL × EM Basket', corr: out.corr, n: out.n }
    })()

    const items = [
      corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × Brent`, symBrent),
      corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × DXY`, symDXY),
      corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × USD/BRL`, symUSDBRL),
      corrWithBase(`${baseSymbol ? baseSymbol : 'PETR'} × EWZ`, symEWZ),
      corrBrlEmBasket,
    ]

    return { baseSymbol, windowPoints, items }
  })()

  metrics.flowCorr = flowCorr

  const missingCorrelated: PetrobrasModulePayload['missingCorrelated'] = []
  const addMissing = (label: string, patterns: string[]) => {
    missingCorrelated.push({ label, patterns })
  }

  if (!symPETR4 && !symPETR3) addMissing('PETR4 / PETR3 (B3)', ['PETR4', 'PETR3', 'PETR4.SA', 'PETR3.SA'])
  if (!symPBR) addMissing('PBR (ADR)', ['PBR'])
  if (!symPBRA) addMissing('PBRA (ADR)', ['PBRA'])
  if (!symBrent) addMissing('Brent', ['BRN', 'LCO', 'BZ=F', 'UKOIL', 'Brent'])
  if (!symWti) addMissing('WTI', ['CL=F', 'USOIL', 'WTI'])
  if (!symUSO) addMissing('USO (WTI ETF)', ['USO'])
  if (!symXLE) addMissing('XLE (Energy ETF)', ['XLE'])
  if (!symXOP) addMissing('XOP (E&P ETF)', ['XOP'])
  if (!symOIH) addMissing('OIH (Oil Services ETF)', ['OIH'])
  if (!symRBOB) addMissing('Gasolina / RBOB (futuros)', ['RB=F', 'RBc1', 'LRBc1', 'GPR', 'RBOB', 'Gasolina', 'Gasoline'])
  if (!symHO) addMissing('Diesel / ULSD / Gas Oil (futuros)', ['HO=F', 'LGOc1', 'LHOc1', 'ULSD', 'Heating Oil', 'Gas Oil', 'Gasoil', 'Diesel'])
  if (!symUSDBRL) addMissing('USD/BRL', ['USD/BRL'])
  if (!symIBOV) addMissing('Ibovespa', ['.BVSP', 'IBOV', 'Ibovespa'])
  if (!symIBRX) addMissing('IBRX (Índice Brasil 100)', ['.IBRX', 'IBRX', 'Índice Brasil 100', 'Indice Brasil 100'])
  if (!symBR20) addMissing('BR20 (Índice Brasil 20)', ['.BR20', '.BR20T', 'BR20', 'Brasil 20'])
  if (!symBOVA11) addMissing('BOVA11 (ETF B3)', ['BOVA11', 'BOVA11.SA'])
  if (!symWIN) addMissing('Mini índice (WIN / Ibovespa Futuro)', ['WIN', 'WINc1', 'Mini Ibovespa', 'Ibovespa Futuros', 'mini índice', 'mini indice'])
  if (!symWDO) addMissing('WDO (mini dólar)', ['WDO', 'mini dólar', 'mini dolar'])
  if (!symEWZ) addMissing('EWZ / EWZS (ETFs Brasil)', ['EWZ', 'EWZS', 'EWZS.O'])
  if (!symDXY) addMissing('DXY', ['.DXY', 'DXY'])
  if (!symUSDMXN) addMissing('USD/MXN', ['USD/MXN'])
  if (!symUSDZAR) addMissing('USD/ZAR', ['USD/ZAR'])
  if (!symUSDCLP) addMissing('USD/CLP', ['USD/CLP'])
  if (!symUSDTRY) addMissing('USD/TRY', ['USD/TRY'])
  if (!symBR10Y) addMissing('BR10YT=RR (Brasil 10Y)', ['BR10YT=RR'])
  if (!symBR2Y) addMissing('BR2YT=RR (Brasil 2Y)', ['BR2YT=RR'])
  if (!symUS10BR10) addMissing('US10BR10=RR (Spread BR10Y vs US10Y)', ['US10BR10=RR'])
  if (!symBRCDS5Y) addMissing('BRGV5YUSAC=R (Brasil CDS 5Y)', ['BRGV5YUSAC=R'])
  if (!symVXBR) addMissing('.VXBR (Ibovespa VIX)', ['.VXBR', 'VXBR'])
  if (!symVIX) addMissing('VIX (EUA)', ['VIX', '.VIX'])
  if (!symOVX) addMissing('OVX (Oil VIX)', ['.OVX', 'OVX'])
  if (!majorsPresent.length) addMissing('Majors Oil', ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'EQNR', 'COP', 'OXY'])

  return {
    ok: true,
    provider: 'petrobras_module',
    generatedAt,
    phase: { nowLabel: phaseLabel, cutoffLocal: '10:00' },
    score: { value: score, bias, confidence },
    metrics,
    rows,
    missingCorrelated,
    news: { used: news.used, matched: news.matched, score: news.score, top: news.top },
  }
}
