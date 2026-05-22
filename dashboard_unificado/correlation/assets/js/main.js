const MARKET_QUOTES_URL = '../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json'
const TARGET_WINDOW_MINUTES = 60
const TOP_N = 20

const elMeta = document.getElementById('meta')
const elMatrix = document.getElementById('matrix')
const elStatus = document.getElementById('status')
const elPin = document.getElementById('pin')
const btnRefresh = document.getElementById('btn-refresh')
const navSelect = document.getElementById('assetSelect')

function fmt(n, digits = 2) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '-'
  return n.toFixed(digits)
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function corrColor(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'rgba(2,6,23,0.85)'
  const x = Math.max(-1, Math.min(1, v))
  if (x >= 0) {
    const t = clamp01(x)
    const r = Math.round(229 + (22 - 229) * t)
    const g = Math.round(231 + (163 - 231) * t)
    const b = Math.round(235 + (74 - 235) * t)
    return `rgb(${r},${g},${b})`
  } else {
    const t = clamp01(-x)
    const r = Math.round(229 + (239 - 229) * t)
    const g = Math.round(231 + (68 - 231) * t)
    const b = Math.round(235 + (68 - 235) * t)
    return `rgb(${r},${g},${b})`
  }
}

function textColorForBg(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '#9ca3af'
  const a = Math.abs(v)
  return a > 0.65 ? '#0b0d12' : '#0b0d12'
}

function parseSeriesPoints(arr) {
  if (!Array.isArray(arr)) return []
  const pts = []
  for (const it of arr) {
    if (!it || typeof it !== 'object') continue
    const tRaw = it.t
    const price = it.price
    if (typeof price !== 'number' || !Number.isFinite(price)) continue
    const ts = typeof tRaw === 'string' ? Date.parse(tRaw) : NaN
    if (!Number.isFinite(ts)) continue
    const changePct = typeof it.changePct === 'number' && Number.isFinite(it.changePct) ? it.changePct : null
    pts.push({ ts, price, changePct })
  }
  pts.sort((a, b) => a.ts - b.ts)
  const out = []
  let lastTs = null
  for (const p of pts) {
    if (lastTs !== null && p.ts <= lastTs) continue
    out.push(p)
    lastTs = p.ts
  }
  return out
}

function pickLastChangePct(points) {
  if (!points.length) return null
  const last = points[points.length - 1]
  if (typeof last.changePct === 'number') return last.changePct
  if (points.length < 2) return null
  const prev = points[points.length - 2]
  if (!prev || typeof prev.price !== 'number' || prev.price === 0) return null
  return ((last.price / prev.price) - 1) * 100
}

function sliceLastPrices(points, count) {
  if (points.length < count) return null
  const tail = points.slice(points.length - count)
  return tail.map(p => p.price)
}

function toReturns(prices) {
  const out = []
  for (let i = 1; i < prices.length; i++) {
    const a = prices[i - 1]
    const b = prices[i]
    if (typeof a !== 'number' || typeof b !== 'number' || !Number.isFinite(a) || !Number.isFinite(b) || a === 0) return null
    out.push((b / a) - 1)
  }
  return out
}

function mean(arr) {
  let s = 0
  for (const x of arr) s += x
  return s / arr.length
}

function std(arr, m) {
  let s = 0
  for (const x of arr) {
    const d = x - m
    s += d * d
  }
  return Math.sqrt(s / Math.max(1, arr.length - 1))
}

function corr(a, b) {
  const n = Math.min(a.length, b.length)
  if (n < 3) return null
  const aa = a.slice(a.length - n)
  const bb = b.slice(b.length - n)
  const ma = mean(aa)
  const mb = mean(bb)
  const sa = std(aa, ma)
  const sb = std(bb, mb)
  if (!Number.isFinite(sa) || !Number.isFinite(sb) || sa === 0 || sb === 0) return 0
  let c = 0
  for (let i = 0; i < n; i++) c += (aa[i] - ma) * (bb[i] - mb)
  return c / ((n - 1) * sa * sb)
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isProdHost() {
  const host = location.hostname || ''
  return host.indexOf('github.io') !== -1 || host.indexOf('sites.google.com') !== -1
}

function targetForDashboard(val) {
  const href = location.href
  const prodBase = 'https://szeskoskiinvestimentos-art.github.io/edi-openinterest-stranger/dashboard_unificado/'
  if (isProdHost()) {
    if (val === 'WDO') return prodBase + 'WDO/'
    if (val === 'WIN') return prodBase + 'WIN/'
    if (val === 'CORR') return prodBase + 'correlation/'
    return href
  }
  if (val === 'WDO') return '../WDO/index.html'
  if (val === 'WIN') return '../WIN/index.html'
  if (val === 'MERCADO') return '../../Cotacoes/dashboard/MERCADO/index.html'
  return href
}

function buildTopAssets(seriesObj, pricePoints) {
  const items = []
  for (const [symbol, rawArr] of Object.entries(seriesObj || {})) {
    const pts = parseSeriesPoints(rawArr)
    const prices = sliceLastPrices(pts, pricePoints)
    if (!prices) continue
    const rets = toReturns(prices)
    if (!rets) continue
    const lastChg = pickLastChangePct(pts)
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

function renderMatrix(selected, generatedAt, intervalMinutes, pricePoints) {
  const n = selected.length
  const minLen = Math.min(...selected.map(s => s.rets.length))
  const aligned = selected.map(s => ({ ...s, rets: s.rets.slice(s.rets.length - minLen) }))

  elMeta.textContent = `generatedAt=${generatedAt || '-'} • interval=${intervalMinutes}min • janela=${pricePoints - 1} retornos (~${Math.round((pricePoints - 1) * intervalMinutes)}min) • N=${n}`
  elMatrix.style.gridTemplateColumns = `160px repeat(${n}, minmax(46px, 1fr))`

  const nodes = []

  const tl = document.createElement('div')
  tl.className = 'cell tl'
  tl.textContent = 'Ativo'
  nodes.push(tl)

  for (let j = 0; j < n; j++) {
    const h = document.createElement('div')
    h.className = 'cell t'
    h.textContent = aligned[j].symbol
    h.title = aligned[j].symbol
    nodes.push(h)
  }

  const pinState = { i: null, j: null }
  const setPin = (i, j) => {
    if (i === null || j === null) {
      pinState.i = null
      pinState.j = null
      elPin.textContent = ''
      return
    }
    pinState.i = i
    pinState.j = j
    const a = aligned[i].symbol
    const b = aligned[j].symbol
    const v = corr(aligned[i].rets, aligned[j].rets)
    elPin.textContent = `${a} × ${b} = ${fmt(v, 3)}`
  }

  for (let i = 0; i < n; i++) {
    const rowHead = document.createElement('div')
    rowHead.className = 'cell h'
    rowHead.textContent = aligned[i].symbol
    rowHead.title = aligned[i].symbol
    nodes.push(rowHead)

    for (let j = 0; j < n; j++) {
      const v = i === j ? 1 : corr(aligned[i].rets, aligned[j].rets)
      const cell = document.createElement('div')
      cell.className = 'cell v'
      cell.style.background = corrColor(v)
      cell.style.color = textColorForBg(v)
      cell.textContent = fmt(v, 2)
      const a = aligned[i].symbol
      const b = aligned[j].symbol
      cell.title = `${a} × ${b} = ${fmt(v, 3)}`
      cell.addEventListener('mouseenter', () => {
        if (pinState.i !== null) return
        setPin(i, j)
      })
      cell.addEventListener('mouseleave', () => {
        if (pinState.i !== null) return
        setPin(null, null)
      })
      cell.addEventListener('click', () => {
        if (pinState.i === i && pinState.j === j) {
          setPin(null, null)
          return
        }
        setPin(i, j)
      })
      nodes.push(cell)
    }
  }

  elMatrix.replaceChildren(...nodes)
}

async function loadAndRender() {
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

  const coverage = selected.length
  const symbols = selected.map(s => s.symbol).join(', ')
  const sourceLabel = (preloaded && data === preloaded) ? 'fonte=market_quotes.js (offline ok)' : `fonte=${MARKET_QUOTES_URL}`
  elStatus.textContent = `Selecionados (${coverage}/${TOP_N}): ${symbols}\n${sourceLabel}`
  renderMatrix(selected, generatedAt, intervalMinutes, pricePoints)
}

btnRefresh?.addEventListener('click', () => void loadAndRender())
navSelect?.addEventListener('change', (e) => {
  const val = e.target && e.target.value ? String(e.target.value) : ''
  const url = targetForDashboard(val)
  try {
    window.top.location.href = url
  } catch {
    location.href = url
  }
})
void loadAndRender()
