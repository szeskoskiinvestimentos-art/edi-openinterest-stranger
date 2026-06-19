(function () {
  const w = typeof window !== 'undefined' ? window : null
  if (!w) return

  function fmt(n, digits = 2) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return '-'
    return n.toFixed(digits)
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

  w.CorrMatrixMath = {
    fmt,
    parseSeriesPoints,
    pickLastChangePct,
    sliceLastPrices,
    toReturns,
    corr,
  }
})()

