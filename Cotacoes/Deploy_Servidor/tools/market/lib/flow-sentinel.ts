import type { Asset, FlowSentinelItem, FlowSentinelSnapshot, MarketPoint } from '../types.js'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function weightedAvg(xs: Array<{ v: number | null; w: number }>) {
  const pairs = xs
    .filter(x => typeof x.v === 'number' && Number.isFinite(x.v) && typeof x.w === 'number' && Number.isFinite(x.w) && x.w > 0)
    .map(x => ({ v: x.v as number, w: x.w }))
  if (!pairs.length) return null
  const wsum = pairs.reduce((a, b) => a + b.w, 0)
  if (!(wsum > 0)) return null
  return pairs.reduce((a, b) => a + b.v * b.w, 0) / wsum
}

function latestPct(points: MarketPoint[] | undefined | null) {
  if (!points || points.length < 1) return null
  const last = points[points.length - 1]
  if (last && typeof last.changePct === 'number' && Number.isFinite(last.changePct)) return last.changePct
  if (points.length < 2) return null
  const prev = points[points.length - 2]
  if (!last || !prev) return null
  if (!(typeof last.price === 'number' && Number.isFinite(last.price))) return null
  if (!(typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price !== 0)) return null
  return ((last.price - prev.price) / prev.price) * 100
}

function resolveSeriesKeyByAssetMatcher(
  assets: Asset[],
  series: Record<string, MarketPoint[]>,
  matcher: RegExp,
) {
  const keys = Object.keys(series || {})
  const keySet = new Set(keys)
  const lc = new Map(keys.map(k => [k.toLowerCase(), k]))
  for (const a of assets || []) {
    const sym = String(a && a.symbol ? a.symbol : '').trim()
    const name = String(a && a.name ? a.name : '').trim()
    if (!sym) continue
    if (!matcher.test(sym) && !matcher.test(name)) continue
    if (keySet.has(sym)) return sym
    const k = lc.get(sym.toLowerCase())
    if (k) return k
  }
  return null
}

function classifyRiskBlockAction(score: number | null, neutralThreshold: number) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral' as const, label: 'Neutro' }
  if (Math.abs(score) < neutralThreshold) return { state: 'neutral' as const, label: 'Neutro' }
  if (score > 0) return { state: 'sell-usd' as const, label: 'Vender USD / Comprar índice' }
  return { state: 'buy-usd' as const, label: 'Comprar USD / Vender índice' }
}

function classifyProtectionBlockAction(score: number | null, neutralThreshold: number) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return { state: 'neutral' as const, label: 'Neutro' }
  if (Math.abs(score) < neutralThreshold) return { state: 'neutral' as const, label: 'Neutro' }
  if (score > 0) return { state: 'buy-usd' as const, label: 'Comprar USD / Vender índice' }
  return { state: 'sell-usd' as const, label: 'Vender USD / Comprar índice' }
}

function item(label: string, symbol: string | null, pct: number | null, sign: 1 | -1): FlowSentinelItem {
  const val = typeof pct === 'number' && Number.isFinite(pct) ? sign * pct : null
  return { label, symbol, pct, val }
}

export function computeFlowSentinel(input: {
  assets: Asset[]
  series: Record<string, MarketPoint[]>
  generatedAt?: string
}): FlowSentinelSnapshot {
  const neutralThreshold = 0.12
  const regimeThreshold = 0.25
  const oilStrongThreshold = 0.7
  const cadRubConfirmThreshold = 0.15
  const oilAdjReinforce = 0.15

  const assets = Array.isArray(input.assets) ? input.assets : []
  const series = input.series || {}

  const sym = (re: RegExp) => resolveSeriesKeyByAssetMatcher(assets, series, re)
  const pctOf = (symbol: string | null) => (symbol ? latestPct(series[symbol]) : null)

  const sAudusd = sym(/^AUD\/USD\b/i)
  const sNzdusd = sym(/^NZD\/USD\b/i)
  const sUsdcad = sym(/^USD\/CAD\b/i)
  const sUsdrub = sym(/^USD\/RUB\b/i)
  const sUsdjpy = sym(/^USD\/JPY\b/i)
  const sUsdchf = sym(/^USD\/CHF\b/i)
  const sUsdsek = sym(/^USD\/SEK\b/i)
  const sUsdcnh = sym(/^USD\/CNH\b/i)
  const sUsdcny = sym(/^USD\/CNY\b/i)
  const sUsdmxn = sym(/^USD\/MXN\b/i)
  const sUsdzar = sym(/^USD\/ZAR\b/i)
  const sUsdclp = sym(/^USD\/CLP\b/i)
  const sUsdtry = sym(/^USD\/TRY\b/i)
  const sDxy = sym(/(^\.DXY$|\bDXY\b|US Dollar Index)/i)
  const sBrent = sym(/\bBrent\b/i)
  const sWti = sym(/\bWTI\b/i)
  const sVix = sym(/(^\.(VIX|VIX9D)$|\bVIX\b|CBOE Volatility Index)/i)
  const sVhsi = sym(/(^VHSI(c\d+)?$|\bHSI Volatility\b|\bHang Seng Volatility\b)/i)
  const sSpx = sym(
    /(^\.SPX$|^\^GSPC$|^SPX$|^SPY(\b|$)|^IVV(\b|$)|^VOO(\b|$)|^ES[HMUZ]\d{1,2}(\b|=\$)?|S&P\s*500)/i,
  )
  const sNdx = sym(
    /(^\.NDX$|^NDX$|^QQQ(\b|$)|^NQ[HMUZ]\d{1,2}(\b|=\$)?|Nasdaq\s*100)/i,
  )
  const sHyg = sym(/(^HYG(\b|$)|\bHigh\s*Yield\b|\bHigh-Yield\b)/i)
  const sEem = sym(/(^EEM(\b|$)|^VWO(\b|$)|Emerging\s*Markets)/i)
  const sCopper = sym(/(^HG(\b|$)|^HGc\d(\b|=\$)?|Copper|\bCobre\b|^CPER(\b|$))/i)
  const sBtc = sym(/(^BTC\/USD$|^BTCUSD$|BTC\/USD|XBT|bitcoin)/i)

  const audusd = pctOf(sAudusd)
  const nzdusd = pctOf(sNzdusd)
  const usdcad = pctOf(sUsdcad)
  const usdrub = pctOf(sUsdrub)
  const usdjpy = pctOf(sUsdjpy)
  const usdchf = pctOf(sUsdchf)
  const usdsek = pctOf(sUsdsek)
  const usdcnh = pctOf(sUsdcnh || sUsdcny)
  const usdmxn = pctOf(sUsdmxn)
  const usdzar = pctOf(sUsdzar)
  const usdclp = pctOf(sUsdclp)
  const usdtry = pctOf(sUsdtry)
  const dxy = pctOf(sDxy)
  const brent = pctOf(sBrent)
  const wti = pctOf(sWti)
  const vix = pctOf(sVix)
  const vhsi = pctOf(sVhsi)
  const spx = pctOf(sSpx)
  const ndx = pctOf(sNdx)
  const hyg = pctOf(sHyg)
  const eem = pctOf(sEem)
  const copper = pctOf(sCopper)
  const btc = pctOf(sBtc)

  const riskItems = [
    item('AUD/USD', sAudusd, audusd, 1),
    item('NZD/USD', sNzdusd, nzdusd, 1),
    item('USD/CAD', sUsdcad, usdcad, -1),
    item('USD/RUB', sUsdrub, usdrub, -1),
    item('SPX', sSpx, spx, 1),
    item('NDX', sNdx, ndx, 1),
    item('HYG', sHyg, hyg, 1),
    item('EEM/VWO', sEem, eem, 1),
    item('Cobre', sCopper, copper, 1),
    item('BTC', sBtc, btc, 1),
  ]
  const protItems = [
    item('USD/JPY', sUsdjpy, usdjpy, -1),
    item('USD/CHF', sUsdchf, usdchf, -1),
    item('USD/SEK', sUsdsek, usdsek, -1),
    item('USD/CNH', sUsdcnh || sUsdcny, usdcnh, 1),
    item('USD/MXN', sUsdmxn, usdmxn, 1),
    item('USD/ZAR', sUsdzar, usdzar, 1),
    item('USD/CLP', sUsdclp, usdclp, 1),
    item('USD/TRY', sUsdtry, usdtry, 1),
    item('DXY', sDxy, dxy, 1),
    item('VIX', sVix, vix, 1),
    item('VHSI', sVhsi, vhsi, 1),
  ]

  const riskScore = weightedAvg([
    { v: riskItems[0].val, w: 1.0 },
    { v: riskItems[1].val, w: 1.0 },
    { v: riskItems[2].val, w: 1.0 },
    { v: riskItems[3].val, w: 1.0 },
    { v: riskItems[4].val, w: 0.55 },
    { v: riskItems[5].val, w: 0.55 },
    { v: riskItems[6].val, w: 0.45 },
    { v: riskItems[7].val, w: 0.35 },
    { v: riskItems[8].val, w: 0.25 },
    { v: riskItems[9].val, w: 0.2 },
  ])
  const protScore = weightedAvg([
    { v: protItems[0].val, w: 0.9 },
    { v: protItems[1].val, w: 0.9 },
    { v: protItems[2].val, w: 0.9 },
    { v: protItems[3].val, w: 0.5 },
    { v: protItems[4].val, w: 0.35 },
    { v: protItems[5].val, w: 0.35 },
    { v: protItems[6].val, w: 0.25 },
    { v: protItems[7].val, w: 0.25 },
    { v: protItems[8].val, w: 1.0 },
    { v: protItems[9].val, w: 1.0 },
    { v: protItems[10].val, w: 0.8 },
  ])

  const deltaRaw =
    typeof riskScore === 'number' && typeof protScore === 'number'
      ? riskScore - protScore
      : typeof riskScore === 'number'
        ? riskScore
        : typeof protScore === 'number'
          ? -protScore
          : null

  const oilScore = (() => {
    const xs = [brent, wti].filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
    if (!xs.length) return null
    return Math.max(...xs)
  })()

  const oilUpStrong = typeof oilScore === 'number' && Number.isFinite(oilScore) && oilScore >= oilStrongThreshold
  const cadRubConfirm =
    typeof usdcad === 'number' &&
    Number.isFinite(usdcad) &&
    usdcad <= -cadRubConfirmThreshold &&
    typeof usdrub === 'number' &&
    Number.isFinite(usdrub) &&
    usdrub <= -cadRubConfirmThreshold

  const oilAdj = oilUpStrong && cadRubConfirm ? oilAdjReinforce : 0
  const oilIntel =
    oilUpStrong && cadRubConfirm
      ? 'Reforça Bloco Risco (petróleo↑ + CAD/RUB fortes) → tende a VENDA de USD'
      : oilUpStrong && !cadRubConfirm
        ? 'Neutro (petróleo↑ sem confirmação CAD/RUB)'
        : typeof oilScore === 'number' && Number.isFinite(oilScore) && oilScore <= -oilStrongThreshold
          ? 'Neutro (petróleo↓)'
          : 'Neutro'

  const composite = typeof deltaRaw === 'number' && Number.isFinite(deltaRaw) ? deltaRaw + oilAdj : null

  const regimeMode =
    typeof composite === 'number'
      ? composite > regimeThreshold
        ? ('risk_on' as const)
        : composite < -regimeThreshold
          ? ('risk_off' as const)
          : ('mixed' as const)
      : ('n/d' as const)

  const regimeLabel =
    regimeMode === 'risk_on' ? 'Apetite ao Risco' : regimeMode === 'risk_off' ? 'Proteção' : regimeMode === 'mixed' ? 'Neutro' : 'n/d'
  const regimeAction =
    regimeMode === 'risk_on' ? 'Vender USD / Comprar índice' : regimeMode === 'risk_off' ? 'Comprar USD / Vender índice' : 'Aguardar / seletivo'

  const thermo = (() => {
    if (!(typeof composite === 'number' && Number.isFinite(composite))) {
      return { score10: null, pct: null, label: '—' }
    }
    const score01 = clamp((composite + 0.8) / 1.6, 0, 1)
    const score10 = Math.round(score01 * 10)
    const pct = Math.round(score01 * 100)
    const label = score10 >= 7 ? 'Risk-On' : score10 <= 3 ? 'Risk-Off' : 'Neutro'
    return { score10, pct, label }
  })()

  const riskAction = classifyRiskBlockAction(riskScore, neutralThreshold)
  const protAction = classifyProtectionBlockAction(protScore, neutralThreshold)

  const riskObserved = riskItems.filter(x => x.val !== null).length
  const protObserved = protItems.filter(x => x.val !== null).length

  const alerts = (() => {
    const out: string[] = []
    const riskAbs = typeof riskScore === 'number' ? Math.abs(riskScore) : 0
    const protAbs = typeof protScore === 'number' ? Math.abs(protScore) : 0
    if (riskObserved >= 2 && protObserved >= 2 && riskAction.state !== protAction.state && riskAbs >= 0.18 && protAbs >= 0.18) {
      out.push('Divergência: blocos Risco e Proteção estão puxando para lados opostos.')
    }
    if (typeof deltaRaw === 'number' && Number.isFinite(deltaRaw) && Math.abs(deltaRaw) < neutralThreshold && riskAbs >= 0.18 && protAbs >= 0.18) {
      out.push('Sem consenso: delta neutro com blocos “fortes” (ruído/abertura).')
    }
    if (oilUpStrong && !cadRubConfirm) {
      out.push('Petróleo forte sem confirmação (CAD/RUB): efeito tende a ficar neutro.')
    }
    return out
  })()

  return {
    generatedAt: input.generatedAt,
    neutralThreshold,
    regimeThreshold,
    oilStrongThreshold,
    cadRubConfirmThreshold,
    oilAdjReinforce,
    riskBlock: {
      score: riskScore,
      action: riskAction,
      observed: riskObserved,
      items: riskItems,
    },
    protectionBlock: {
      score: protScore,
      action: protAction,
      observed: protObserved,
      items: protItems,
    },
    oil: {
      score: oilScore,
      brentPct: brent,
      wtiPct: wti,
      intel: oilIntel,
      adj: oilAdj,
      upStrong: oilUpStrong,
      cadRubConfirm,
    },
    delta: deltaRaw,
    composite,
    regime: {
      mode: regimeMode,
      label: regimeLabel,
      action: regimeAction,
    },
    thermo,
    alerts,
  }
}
