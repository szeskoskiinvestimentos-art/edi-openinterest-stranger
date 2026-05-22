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
  if (last && typeof last.extendedChangePct === 'number' && Number.isFinite(last.extendedChangePct)) return last.extendedChangePct
  if (last && typeof last.changePct === 'number' && Number.isFinite(last.changePct)) return last.changePct
  if (points.length < 2) return null
  const prev = points[points.length - 2]
  if (!last || !prev) return null
  if (!(typeof last.price === 'number' && Number.isFinite(last.price))) return null
  if (!(typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price !== 0)) return null
  return ((last.price - prev.price) / prev.price) * 100
}

function latestDelta(points: MarketPoint[] | undefined | null) {
  if (!points || points.length < 1) return null
  const last = points[points.length - 1]
  if (last && typeof last.change === 'number' && Number.isFinite(last.change)) return last.change
  if (points.length < 2) return null
  const prev = points[points.length - 2]
  if (!last || !prev) return null
  if (!(typeof last.price === 'number' && Number.isFinite(last.price))) return null
  if (!(typeof prev.price === 'number' && Number.isFinite(prev.price))) return null
  return last.price - prev.price
}

function latestLevel(points: MarketPoint[] | undefined | null) {
  if (!points || points.length < 1) return null
  const last = points[points.length - 1]
  if (last && typeof last.price === 'number' && Number.isFinite(last.price)) return last.price
  return null
}

function envNumber(key: string, fallback: number) {
  const raw = process.env[key]
  if (raw === undefined || raw === null) return fallback
  const n = Number(String(raw).trim())
  return Number.isFinite(n) ? n : fallback
}

function utcHourOf(iso: string | undefined) {
  if (!iso) return null
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return null
  try {
    return new Date(ms).getUTCHours()
  } catch {
    return null
  }
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
  const neutralThreshold = envNumber('FLOW_SENTINEL_NEUTRAL_THRESHOLD', 0.12)
  const regimeThreshold = envNumber('FLOW_SENTINEL_REGIME_THRESHOLD', 0.25)
  const oilStrongThreshold = envNumber('FLOW_SENTINEL_OIL_STRONG_THRESHOLD', 0.7)
  const cadRubConfirmThreshold = envNumber('FLOW_SENTINEL_CADRUB_CONFIRM_THRESHOLD', 0.15)
  const oilAdjReinforce = envNumber('FLOW_SENTINEL_OIL_ADJ_REINFORCE', 0.15)
  const strongThreshold = Math.max(0.18, neutralThreshold * 1.5)
  const volBothUpReinforce = envNumber('FLOW_SENTINEL_VOL_BOTH_UP_REINFORCE', 0.2)
  const vhsiWeightDefault = envNumber('FLOW_SENTINEL_VHSI_WEIGHT_DEFAULT', 0.8)
  const vhsiWeightAsia = envNumber('FLOW_SENTINEL_VHSI_WEIGHT_ASIA', 1.0)
  const asiaFundingJp1yBps = envNumber('FLOW_SENTINEL_ASIA_FUNDING_JP1Y_BPS', 6)
  const asiaFundingSlopeDropBps = envNumber('FLOW_SENTINEL_ASIA_FUNDING_SLOPE_DROP_BPS', 4)
  const asiaFundingVhsiPct = envNumber('FLOW_SENTINEL_ASIA_FUNDING_VHSI_PCT', 6)

  const assets = Array.isArray(input.assets) ? input.assets : []
  const series = input.series || {}

  const sym = (re: RegExp) => resolveSeriesKeyByAssetMatcher(assets, series, re)
  const pctOf = (symbol: string | null) => (symbol ? latestPct(series[symbol]) : null)
  const deltaOf = (symbol: string | null) => (symbol ? latestDelta(series[symbol]) : null)
  const levelOf = (symbol: string | null) => (symbol ? latestLevel(series[symbol]) : null)

  const utcHour = utcHourOf(input.generatedAt)
  const session = (() => {
    if (utcHour === null) return 'unknown' as const
    if (utcHour >= 22 || utcHour < 8) return 'asia' as const
    if (utcHour >= 12 && utcHour < 21) return 'us' as const
    return 'eu' as const
  })()

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
  const sJp1y = sym(/^JP1YT=(RR|XX)$/i)
  const sJp10y = sym(/^JP10YT=RR$/i)
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
  const protScore = (() => {
    const vhsiWeight = session === 'asia' ? vhsiWeightAsia : vhsiWeightDefault
    const base = weightedAvg([
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
      { v: protItems[10].val, w: vhsiWeight },
    ])
    if (!(typeof base === 'number' && Number.isFinite(base))) return null
    let score = base
    const vixUp = typeof vix === 'number' && Number.isFinite(vix) && vix >= 1.5
    const vhsiUp = typeof vhsi === 'number' && Number.isFinite(vhsi) && vhsi >= 1.5
    if (vixUp && vhsiUp) score += volBothUpReinforce
    return score
  })()

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
  const riskAbs = typeof riskScore === 'number' ? Math.abs(riskScore) : 0
  const protAbs = typeof protScore === 'number' ? Math.abs(protScore) : 0
  const divergenceActive =
    riskObserved >= 2 &&
    protObserved >= 2 &&
    riskAction.state !== 'neutral' &&
    protAction.state !== 'neutral' &&
    riskAction.state !== protAction.state &&
    riskAbs >= strongThreshold &&
    protAbs >= strongThreshold
  const divergenceReason = divergenceActive ? 'blocos_risco_protecao_opostos' : null
  const trueNeutral = (() => {
    if (divergenceActive) return { isTrueNeutral: false, reason: 'divergencia_entre_blocos' }
    if (!(typeof composite === 'number' && Number.isFinite(composite))) return { isTrueNeutral: false, reason: 'dados_insuficientes' }
    if (Math.abs(composite) >= regimeThreshold) return { isTrueNeutral: false, reason: 'composite_fora_faixa_neutra' }
    const bothNeutralActions = riskAction.state === 'neutral' && protAction.state === 'neutral'
    const bothWeak = riskAbs < strongThreshold && protAbs < strongThreshold
    if (bothNeutralActions || bothWeak) return { isTrueNeutral: true, reason: 'consenso_fraco_sem_direcionalidade' }
    return { isTrueNeutral: false, reason: 'blocos_ativos_sem_consenso_limpo' }
  })()
  const regimeLabelFinal =
    regimeMode === 'mixed' && !trueNeutral.isTrueNeutral
      ? 'Neutro (divergente)'
      : regimeLabel

  const alerts = (() => {
    const out: string[] = []
    if (divergenceActive) {
      out.push('Divergência: blocos Risco e Proteção estão puxando para lados opostos.')
    }
    if (typeof deltaRaw === 'number' && Number.isFinite(deltaRaw) && Math.abs(deltaRaw) < neutralThreshold && riskAbs >= strongThreshold && protAbs >= strongThreshold) {
      out.push('Sem consenso: delta neutro com blocos “fortes” (ruído/abertura).')
    }
    if (regimeMode === 'mixed' && !trueNeutral.isTrueNeutral) {
      out.push(`Neutro com ressalva: ${trueNeutral.reason}.`)
    }
    if (oilUpStrong && !cadRubConfirm) {
      out.push('Petróleo forte sem confirmação (CAD/RUB): efeito tende a ficar neutro.')
    }

    const jp1yDelta = deltaOf(sJp1y)
    const jp10yDelta = deltaOf(sJp10y)
    const jp1yDeltaBps = typeof jp1yDelta === 'number' && Number.isFinite(jp1yDelta) ? jp1yDelta * 100 : null
    const jp10yDeltaBps = typeof jp10yDelta === 'number' && Number.isFinite(jp10yDelta) ? jp10yDelta * 100 : null
    const slopeDeltaBps = typeof jp10yDeltaBps === 'number' && typeof jp1yDeltaBps === 'number' ? jp10yDeltaBps - jp1yDeltaBps : null

    const jp1yLevel = levelOf(sJp1y)
    const jp10yLevel = levelOf(sJp10y)
    const slope1_10_bps =
      typeof jp10yLevel === 'number' && Number.isFinite(jp10yLevel) && typeof jp1yLevel === 'number' && Number.isFinite(jp1yLevel)
        ? (jp10yLevel - jp1yLevel) * 100
        : null

    const fundingAsia =
      typeof jp1yDeltaBps === 'number' &&
      Number.isFinite(jp1yDeltaBps) &&
      jp1yDeltaBps >= asiaFundingJp1yBps &&
      typeof slopeDeltaBps === 'number' &&
      Number.isFinite(slopeDeltaBps) &&
      slopeDeltaBps <= -asiaFundingSlopeDropBps

    if (fundingAsia) {
      const reinforce = typeof vhsi === 'number' && Number.isFinite(vhsi) && vhsi >= asiaFundingVhsiPct ? ' (+ VHSI↑)' : ''
      out.push(`Funding Ásia: JP1Y ↑ forte e inclinação 1–10 ↓${reinforce}`)
    }
    if (typeof slope1_10_bps === 'number' && Number.isFinite(slope1_10_bps) && slope1_10_bps < 0) {
      out.push('Curva Japão invertida (1–10 < 0bp)')
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
    strongThreshold,
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
    divergence: {
      active: divergenceActive,
      reason: divergenceReason,
    },
    neutrality: trueNeutral,
    regime: {
      mode: regimeMode,
      label: regimeLabelFinal,
      action: regimeAction,
    },
    thermo,
    alerts,
  }
}
