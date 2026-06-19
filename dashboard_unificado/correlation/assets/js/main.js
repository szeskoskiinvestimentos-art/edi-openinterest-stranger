const MARKET_QUOTES_URL = '../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json'
const TARGET_WINDOW_MINUTES = 60
const TOP_N = 20

const elMeta = document.getElementById('meta')
const elMatrix = document.getElementById('matrix')
const elStatus = document.getElementById('status')
const elPin = document.getElementById('pin')
const btnRefresh = document.getElementById('btn-refresh')
const navSelect = document.getElementById('assetSelect')

const math = (typeof window !== 'undefined' && window.CorrMatrixMath) ? window.CorrMatrixMath : null
const ui = (typeof window !== 'undefined' && window.CorrMatrixUI) ? window.CorrMatrixUI : null
const cat = (typeof window !== 'undefined' && window.CorrCatalog) ? window.CorrCatalog : null

try {
  if (navSelect && window.ediUnifiedNav && typeof window.ediUnifiedNav.bind === 'function') {
    window.ediUnifiedNav.bind(navSelect)
  }
} catch {
}

function buildTopAssets(seriesObj, pricePoints) {
  if (!math) return []
  const items = []
  for (const [symbol, rawArr] of Object.entries(seriesObj || {})) {
    const pts = math.parseSeriesPoints(rawArr)
    const prices = math.sliceLastPrices(pts, pricePoints)
    if (!prices) continue
    const rets = math.toReturns(prices)
    if (!rets) continue
    const lastChg = math.pickLastChangePct(pts)
    const absChg = typeof lastChg === 'number' ? Math.abs(lastChg) : 0
    items.push({ symbol, absChg, lastChg, rets })
  }
  items.sort((a, b) => b.absChg - a.absChg)

  const critical = ['USD/BRL', 'WDO', 'WIN', 'IBOV']
  const out = []
  const used = new Set()
  for (const c of critical) {
    const it = items.find(x => x.symbol === c)
    if (it && !used.has(it.symbol)) {
      out.push(it)
      used.add(it.symbol)
    }
  }
  for (const it of items) {
    if (out.length >= TOP_N) break
    if (used.has(it.symbol)) continue
    out.push(it)
    used.add(it.symbol)
  }
  return out
}

async function loadAndRender() {
  if (!elMeta || !elMatrix || !elStatus || !elPin) return
  elStatus.textContent = ''
  elMeta.textContent = 'Carregando…'
  elPin.textContent = ''
  elMatrix.replaceChildren()

  let data
  const preloaded = (typeof window !== 'undefined' && window.MARKET_QUOTES_DATA && typeof window.MARKET_QUOTES_DATA === 'object')
    ? window.MARKET_QUOTES_DATA
    : null
  if (preloaded && preloaded.series && typeof preloaded.series === 'object') {
    data = preloaded
  } else {
    try {
      const res = await fetch(MARKET_QUOTES_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      data = await res.json()
    } catch (e) {
      elMeta.textContent = 'Falha ao carregar market_quotes.json'
      elStatus.textContent = String(e instanceof Error ? e.message : e)
      return
    }
  }

  const generatedAt = data?.meta?.generatedAt || data?.meta?.generated_at || ''
  const intervalMinutes = Number(data?.meta?.intervalMinutes) || 5
  const pricePoints = Math.max(8, Math.round(TARGET_WINDOW_MINUTES / Math.max(1, intervalMinutes)) + 1)

  const seriesObj = data?.series || {}
  const selected = buildTopAssets(seriesObj, pricePoints)

  if (!selected.length) {
    elMeta.textContent = `Sem séries suficientes para Top ${TOP_N}`
    elStatus.textContent = `URL=${MARKET_QUOTES_URL}\nVerifique se market_quotes.json possui séries com pelo menos ${pricePoints} pontos.`
    return
  }

  const symbolMeta = cat && typeof cat.buildMetaBySymbol === 'function' ? cat.buildMetaBySymbol(data) : new Map()

  const coverage = selected.length
  const symbols = selected.map(s => s.symbol).join(', ')
  const sourceLabel = (preloaded && data === preloaded) ? 'fonte=market_quotes.js (offline ok)' : `fonte=${MARKET_QUOTES_URL}`
  elStatus.textContent = `Selecionados (${coverage}/${TOP_N}): ${symbols}\n${sourceLabel}`
  if (!ui || typeof ui.renderMatrix !== 'function') {
    elMeta.textContent = 'Deps ausentes (CorrMatrixUI)'
    return
  }
  ui.renderMatrix({ elMeta, elMatrix, elPin, selected, generatedAt, intervalMinutes, pricePoints, symbolMeta })
}

btnRefresh?.addEventListener('click', () => void loadAndRender())
void loadAndRender()

