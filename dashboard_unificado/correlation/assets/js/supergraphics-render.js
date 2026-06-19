(function () {
  const w = typeof window !== 'undefined' ? window : null
  if (!w) return

  function parseSeries(arr) {
    if (!Array.isArray(arr)) return []
    const out = []
    for (const it of arr) {
      if (!it || typeof it !== 'object') continue
      const tRaw = it.t
      const price = it.price
      if (typeof price !== 'number' || !Number.isFinite(price)) continue
      const ts = typeof tRaw === 'string' ? Date.parse(tRaw) : NaN
      if (!Number.isFinite(ts)) continue
      out.push({ ts, price })
    }
    out.sort((a, b) => a.ts - b.ts)
    return out
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v))
  }

  function hashColor(s) {
    const str = String(s || '')
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const hue = Math.abs(h) % 360
    return `hsl(${hue} 85% 62%)`
  }

  function scaleSeries(points, mode) {
    const xs = Array.isArray(points) ? points : []
    if (!xs.length) return []
    const m = String(mode || 'norm')
    if (m === 'corr') return xs.map(p => ({ ts: p.ts, v: p.v }))
    if (m === 'price') return xs.map(p => ({ ts: p.ts, v: p.price }))
    const base = xs[0].price
    if (!Number.isFinite(base) || base === 0) return []
    if (m === 'pct') return xs.map(p => ({ ts: p.ts, v: ((p.price / base) - 1) * 100 }))
    return xs.map(p => ({ ts: p.ts, v: (p.price / base) * 100 }))
  }

  function formatValue(v, mode) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—'
    const m = String(mode || 'norm')
    if (m === 'corr') return `${v >= 0 ? '+' : ''}${v.toFixed(2)}`
    if (m === 'pct') return `${v.toFixed(2)}%`
    if (m === 'price') {
      const av = Math.abs(v)
      if (av >= 1000) return v.toFixed(0)
      if (av >= 100) return v.toFixed(1)
      return v.toFixed(2)
    }
    return v.toFixed(1)
  }

  function drawRoundRect(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
    ctx.beginPath()
    ctx.moveTo(x + rr, y)
    ctx.arcTo(x + w, y, x + w, y + h, rr)
    ctx.arcTo(x + w, y + h, x, y + h, rr)
    ctx.arcTo(x, y + h, x, y, rr)
    ctx.arcTo(x, y, x + w, y, rr)
    ctx.closePath()
  }

  function drawChart(canvas, seriesList, opts) {
    if (!(canvas instanceof HTMLCanvasElement)) return
    const rect = canvas.getBoundingClientRect()
    const wpx = Math.max(20, Math.floor(rect.width))
    const hpx = Math.max(20, Math.floor(rect.height))
    const dpr = Math.max(1, Math.floor(w.devicePixelRatio || 1))
    canvas.width = wpx * dpr
    canvas.height = hpx * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, wpx, hpx)
    const mode = opts && opts.mode ? String(opts.mode) : 'norm'

    const pad = 10
    const axisW = 78
    const innerW = Math.max(1, wpx - pad * 2 - axisW)
    const innerH = Math.max(1, hpx - pad * 2)

    const all = []
    for (const s of seriesList) for (const p of s.points) all.push(p.v)
    if (!all.length) {
      ctx.fillStyle = 'rgba(229,231,235,0.72)'
      ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      ctx.fillText('Sem dados', pad, pad + 14)
      return
    }
    let minV = Math.min(...all)
    let maxV = Math.max(...all)
    if (!Number.isFinite(minV) || !Number.isFinite(maxV)) return
    if (mode === 'corr') {
      minV = -1
      maxV = 1
    } else {
      if (minV === maxV) {
        minV -= 1
        maxV += 1
      }
      const span = maxV - minV
      minV -= span * 0.04
      maxV += span * 0.04
    }
    const vSpan = Math.max(1e-9, maxV - minV)

    const x0 = pad
    const x1 = pad + innerW
    const y0 = pad
    const y1 = pad + innerH

    for (let i = 1; i <= 3; i++) {
      const y = y0 + (innerH * i) / 4
      const isMid = i === 2
      ctx.strokeStyle = (mode === 'corr' && isMid) ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'
      ctx.lineWidth = (mode === 'corr' && isMid) ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x1, y)
      ctx.stroke()
    }

    const toY = (v) => {
      const t = (v - minV) / vSpan
      return y0 + innerH * (1 - clamp(t, 0, 1))
    }

    for (const s of seriesList) {
      const pts = s.points
      if (!pts || pts.length < 2) continue
      ctx.strokeStyle = s.color
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const x = x0 + (innerW * i) / Math.max(1, pts.length - 1)
        const y = toY(p.v)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    try {
      ctx.fillStyle = 'rgba(229,231,235,0.72)'
      ctx.font = '11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      const axX = x1 + 8
      const ticks = (mode === 'corr') ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1]
      for (const t of ticks) {
        const v = minV + vSpan * (1 - t)
        const y = y0 + innerH * t
        ctx.strokeStyle = 'rgba(255,255,255,0.10)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x1, y)
        ctx.lineTo(x1 + 6, y)
        ctx.stroke()
        ctx.fillText(formatValue(v, mode), axX, y)
      }
    } catch {
    }

    try {
      const labels = []
      const seriesCount = Array.isArray(seriesList) ? seriesList.length : 0
      for (const s of seriesList) {
        const pts = s && Array.isArray(s.points) ? s.points : null
        if (!pts || pts.length < 2) continue
        const last = pts[pts.length - 1]
        labels.push({
          key: String(s.key || ''),
          color: String(s.color || 'rgba(255,255,255,0.7)'),
          v: last.v,
          y: toY(last.v),
          lastRaw: typeof s.lastRaw === 'number' ? s.lastRaw : null,
          prevRaw: typeof s.prevRaw === 'number' ? s.prevRaw : null,
        })
      }
      labels.sort((a, b) => a.y - b.y)
      const minGap = 16
      for (let i = 1; i < labels.length; i++) {
        if (labels[i].y - labels[i - 1].y < minGap) labels[i].y = labels[i - 1].y + minGap
      }
      for (let i = labels.length - 2; i >= 0; i--) {
        if (labels[i + 1].y - labels[i].y < minGap) labels[i].y = labels[i + 1].y - minGap
      }
      for (const it of labels) {
        it.y = clamp(it.y, y0 + 8, y1 - 8)
      }

      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = '11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      const labelX = x1 + 8
      for (const it of labels) {
        const valueTxt = formatValue(it.v, mode)
        let deltaTxt = ''
        if (seriesCount === 1 && mode !== 'pct' && typeof it.lastRaw === 'number' && typeof it.prevRaw === 'number' && Number.isFinite(it.lastRaw) && Number.isFinite(it.prevRaw) && it.prevRaw !== 0) {
          const pct = ((it.lastRaw / it.prevRaw) - 1) * 100
          if (Number.isFinite(pct)) deltaTxt = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
        }
        const txt = seriesCount === 1 ? `${valueTxt}${deltaTxt ? ` ${deltaTxt}` : ''}` : `${it.key.replace(/^(.{8}).+/, '$1…')} ${valueTxt}`
        const tw = Math.min(axisW - 10, ctx.measureText(txt).width + 10)
        const th = 16
        const bx = labelX
        const by = it.y - th / 2
        ctx.fillStyle = 'rgba(0,0,0,0.48)'
        drawRoundRect(ctx, bx, by, tw, th, 8)
        ctx.fill()
        ctx.strokeStyle = it.color
        ctx.lineWidth = 1
        drawRoundRect(ctx, bx, by, tw, th, 8)
        ctx.stroke()
        ctx.fillStyle = 'rgba(229,231,235,0.92)'
        ctx.fillText(txt, bx + 6, it.y)
        ctx.fillStyle = it.color
        ctx.beginPath()
        ctx.arc(x1, toY(it.v), 3, 0, Math.PI * 2)
        ctx.fill()
      }
    } catch {
    }

    if (opts && opts.badge) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(pad, pad, 66, 18)
      ctx.fillStyle = 'rgba(229,231,235,0.88)'
      ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      ctx.fillText(String(opts.badge), pad + 6, pad + 13)
    }

    try {
      canvas.__sgMeta = {
        pad,
        innerW,
        innerH,
        minV,
        maxV,
        axisW,
        seriesList,
        mode: opts && opts.mode ? String(opts.mode) : 'norm',
      }
    } catch {
    }
  }

  function resolveSymbolFromTitle(title, data) {
    const t = String(title || '').trim()
    if (!t) return null
    const series = data && data.series && typeof data.series === 'object' ? data.series : {}
    if (series && series[t]) return t
    const alias = {
      'DXY': 'USDX',
      'US10Y': '.TNX',
      'WDO': 'WDOc1',
      'WIN': 'WINc1',
      'DOL': 'WDOc1',
      'IND': 'WINc1',
      'DI1': 'DI1F27',
      'IBOV': '.BVSP',
      'IBOVESPA': '.BVSP',
      'BVSP': '.BVSP',
      'HSTECH': '.HSTECH',
      'QQQ': 'QQQ.O',
      'TLT': 'TLT.O',
      'SHY': 'SHY.O',
      'VALE': 'VALE.K',
    }
    if (alias[t] && series[alias[t]]) return alias[t]
    const assets = Array.isArray(data && data.assets) ? data.assets : []
    const lc = t.toLowerCase()
    const starts = (s) => String(s || '').toLowerCase().startsWith(lc)
    const includes = (s) => String(s || '').toLowerCase().includes(lc)
    for (const a of assets) {
      if (!a || typeof a !== 'object') continue
      const sym = String(a.symbol || '').trim()
      const name = String(a.name || '').trim()
      if (!sym) continue
      if (sym === t && series[sym]) return sym
      if (name === t && series[sym]) return sym
    }
    for (const a of assets) {
      if (!a || typeof a !== 'object') continue
      const sym = String(a.symbol || '').trim()
      const name = String(a.name || '').trim()
      if (!sym) continue
      if ((starts(sym) || starts(name)) && series[sym]) return sym
    }
    for (const a of assets) {
      if (!a || typeof a !== 'object') continue
      const sym = String(a.symbol || '').trim()
      const name = String(a.name || '').trim()
      if (!sym) continue
      if ((includes(sym) || includes(name)) && series[sym]) return sym
    }
    if (t.startsWith('.') && series[t]) return t
    if (!t.startsWith('.') && series['.' + t]) return '.' + t
    return null
  }

  function pickWindow(points, windowMinutes, intervalMinutes) {
    const xs = Array.isArray(points) ? points : []
    const interval = Math.max(1, Number(intervalMinutes) || 5)
    const target = Math.max(10, Math.round((Number(windowMinutes) || 60) / interval) + 1)
    if (xs.length <= target) return xs
    return xs.slice(xs.length - target)
  }

  function pearson(xs, ys) {
    const x = Array.isArray(xs) ? xs : []
    const y = Array.isArray(ys) ? ys : []
    const n = Math.min(x.length, y.length)
    if (n < 2) return null
    let mx = 0
    let my = 0
    for (let i = 0; i < n; i++) {
      const xv = x[i]
      const yv = y[i]
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) return null
      mx += xv
      my += yv
    }
    mx /= n
    my /= n
    let sxx = 0
    let syy = 0
    let sxy = 0
    for (let i = 0; i < n; i++) {
      const dx = x[i] - mx
      const dy = y[i] - my
      sxx += dx * dx
      syy += dy * dy
      sxy += dx * dy
    }
    if (sxx <= 0 || syy <= 0) return null
    return sxy / Math.sqrt(sxx * syy)
  }

  function computeRollingCorrSeries(basePoints, comparePoints, windowPoints) {
    const bp = Array.isArray(basePoints) ? basePoints : []
    const cp = Array.isArray(comparePoints) ? comparePoints : []
    const wp = Math.max(3, Math.floor(Number(windowPoints) || 12))
    if (bp.length < wp + 1 || cp.length < wp + 1) return []

    const cmpByTs = new Map()
    for (const p of cp) {
      if (!p || typeof p !== 'object') continue
      if (!Number.isFinite(p.ts) || !Number.isFinite(p.price)) continue
      cmpByTs.set(p.ts, p.price)
    }

    const ts = []
    const bx = []
    const cx = []
    for (const p of bp) {
      if (!p || typeof p !== 'object') continue
      if (!Number.isFinite(p.ts) || !Number.isFinite(p.price)) continue
      const other = cmpByTs.get(p.ts)
      if (!Number.isFinite(other)) continue
      ts.push(p.ts)
      bx.push(p.price)
      cx.push(other)
    }
    if (ts.length < wp + 1) return []

    const br = []
    const cr = []
    for (let i = 1; i < ts.length; i++) {
      const b0 = bx[i - 1]
      const b1 = bx[i]
      const c0 = cx[i - 1]
      const c1 = cx[i]
      if (!Number.isFinite(b0) || !Number.isFinite(b1) || !Number.isFinite(c0) || !Number.isFinite(c1)) {
        br.push(NaN)
        cr.push(NaN)
        continue
      }
      if (b0 > 0 && b1 > 0) br.push(Math.log(b1 / b0))
      else if (b0 !== 0) br.push((b1 / b0) - 1)
      else br.push(NaN)
      if (c0 > 0 && c1 > 0) cr.push(Math.log(c1 / c0))
      else if (c0 !== 0) cr.push((c1 / c0) - 1)
      else cr.push(NaN)
    }

    const out = []
    for (let end = wp - 1; end < br.length; end++) {
      const xs = br.slice(end - wp + 1, end + 1)
      const ys = cr.slice(end - wp + 1, end + 1)
      const v = pearson(xs, ys)
      if (typeof v !== 'number' || !Number.isFinite(v)) continue
      out.push({ ts: ts[end + 1], v: Math.max(-1, Math.min(1, v)) })
    }
    return out
  }

  function getWindowedPointCount(symbol, data, windowMinutes) {
    const d = data && typeof data === 'object' ? data : null
    if (!d) return 0
    const s = String(symbol || '').trim()
    if (!s) return 0
    const intervalMinutes = Number(d && d.meta && d.meta.intervalMinutes) || 5
    const raw = d && d.series && d.series[s] ? d.series[s] : null
    const pts = pickWindow(parseSeries(raw), Number(windowMinutes) || 60, intervalMinutes)
    return Array.isArray(pts) ? pts.length : 0
  }

  function renderInto(container, { templateId, templateConfig, marketData } = {}) {
    if (!container || !(container instanceof HTMLElement)) return
    const data = marketData && typeof marketData === 'object' ? marketData : null
    if (!data) return

    const intervalMinutes = Number(data && data.meta && data.meta.intervalMinutes) || 5
    const windowMinutes = 60

    const assets = Array.isArray(data && data.assets) ? data.assets : []
    const nameBySymbol = (() => {
      const m = new Map()
      for (const a of assets) {
        if (!a || typeof a !== 'object') continue
        const sym = String(a.symbol || '').trim()
        if (!sym || m.has(sym)) continue
        const name = String(a.name || '').trim()
        m.set(sym, name)
      }
      return m
    })()
    const labelFor = (sym) => {
      const s = String(sym || '').trim()
      if (!s) return '—'
      const nm = nameBySymbol.get(s)
      if (nm) return `${s} • ${nm}`
      return s
    }

    const tiles = Array.from(container.querySelectorAll('.sg-tile'))
    const cfg = templateConfig && typeof templateConfig === 'object' ? templateConfig : null
    const tpl = cfg && cfg.templates && cfg.templates[templateId] ? cfg.templates[templateId] : null
    const tilesCfg = tpl && tpl.layout === 'simpleGrid' && Array.isArray(tpl.tiles) ? tpl.tiles : null

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]
      const title = String(tile && tile.dataset && tile.dataset.title ? tile.dataset.title : '').trim()
      const canvas = tile.querySelector('canvas')
      const mode = String(tile && tile.dataset && tile.dataset.scale ? tile.dataset.scale : 'norm')
      const rawSymbols = String(tile && tile.dataset && tile.dataset.symbols ? tile.dataset.symbols : '').trim()

      const isRollingCorr = String(tile && tile.dataset && tile.dataset.rollingCorr ? tile.dataset.rollingCorr : '') === '1'
      if (isRollingCorr) {
        const baseRaw = String(tile && tile.dataset && tile.dataset.rcBase ? tile.dataset.rcBase : '').trim()
        const comparesRaw = String(tile && tile.dataset && tile.dataset.rcCompare ? tile.dataset.rcCompare : '').trim()
        const wp = Math.max(3, Math.floor(Number(tile && tile.dataset && tile.dataset.rcWindow ? tile.dataset.rcWindow : 12) || 12))
        const baseKey = baseRaw ? resolveSymbolFromTitle(baseRaw, data) : null
        const compareWanted = comparesRaw ? comparesRaw.split(',').map(s => String(s).trim()).filter(Boolean) : []
        if (!baseKey || !compareWanted.length) {
          tile.dataset.missing = '1'
          continue
        }
        const basePts = pickWindow(parseSeries((data.series || {})[baseKey]), windowMinutes, intervalMinutes)
        const seriesOut = []
        for (const c of compareWanted) {
          const ck = resolveSymbolFromTitle(c, data)
          if (!ck) continue
          const cmpPts = pickWindow(parseSeries((data.series || {})[ck]), windowMinutes, intervalMinutes)
          const corrPts = computeRollingCorrSeries(basePts, cmpPts, wp)
          if (corrPts.length >= 2) seriesOut.push({ key: ck, label: labelFor(ck), color: hashColor(ck), points: corrPts })
        }
        if (seriesOut.length) {
          drawChart(canvas, seriesOut, { badge: String(title || ''), mode: 'corr' })
          tile.dataset.missing = '0'
        } else {
          tile.dataset.missing = '1'
        }
        const prev = tile.querySelector('.sg-legend')
        if (prev) prev.remove()
        continue
      }
      if (rawSymbols) {
        const wanted = rawSymbols.split(',').map(s => String(s).trim()).filter(Boolean)
        const multi = []
        for (const s of wanted) {
          const k = resolveSymbolFromTitle(s, data)
          if (!k) continue
          const pts = pickWindow(parseSeries((data.series || {})[k]), windowMinutes, intervalMinutes)
          const ns = scaleSeries(pts, mode)
          if (ns.length >= 2 && pts.length >= 2) multi.push({ key: k, label: labelFor(k), color: hashColor(k), points: ns, lastRaw: pts[pts.length - 1].price, prevRaw: pts[pts.length - 2].price })
        }
        if (multi.length) {
          drawChart(canvas, multi, { badge: String(title || ''), mode })
          tile.dataset.missing = '0'
          const prev = tile.querySelector('.sg-legend')
          if (prev) prev.remove()
          const legend = document.createElement('div')
          legend.className = 'sg-legend'
          for (const s of multi.slice(0, 10)) {
            const last = s.points && s.points.length ? s.points[s.points.length - 1].v : null
            const it = document.createElement('div')
            it.className = 'sg-legitem'
            it.title = labelFor(s.key)
            const dot = document.createElement('span')
            dot.className = 'sg-dot'
            dot.style.background = s.color
            const txt = document.createElement('span')
            const shortKey = String(s.key || '').replace(/^(.{6}).+/, '$1…')
            txt.textContent = `${shortKey} ${formatValue(last, mode)}`
            it.appendChild(dot)
            it.appendChild(txt)
            legend.appendChild(it)
          }
          tile.appendChild(legend)
          continue
        }
      }
      const seriesKey = resolveSymbolFromTitle(title, data)
      const raw = seriesKey ? (data.series && data.series[seriesKey] ? data.series[seriesKey] : null) : null
      const points = pickWindow(parseSeries(raw), windowMinutes, intervalMinutes)
      const norm = scaleSeries(points, mode)
      tile.title = seriesKey ? labelFor(seriesKey) : title

      const color = hashColor(seriesKey || title)
      const badge = seriesKey ? String(seriesKey).replace(/^(.{6}).+/, '$1…') : '—'

      const seriesList = [{
        key: seriesKey || title,
        label: seriesKey ? labelFor(seriesKey) : String(title || ''),
        color,
        points: norm,
        lastRaw: points.length >= 2 ? points[points.length - 1].price : null,
        prevRaw: points.length >= 2 ? points[points.length - 2].price : null,
      }]

      if (tilesCfg && tilesCfg[i] && typeof tilesCfg[i] === 'object' && Array.isArray(tilesCfg[i].symbols)) {
        const multi = []
        for (const s of tilesCfg[i].symbols) {
          const k = resolveSymbolFromTitle(s, data)
          if (!k) continue
          const pts = pickWindow(parseSeries((data.series || {})[k]), windowMinutes, intervalMinutes)
          const ns = scaleSeries(pts, mode)
          if (ns.length >= 2 && pts.length >= 2) multi.push({ key: k, label: labelFor(k), color: hashColor(k), points: ns, lastRaw: pts[pts.length - 1].price, prevRaw: pts[pts.length - 2].price })
        }
        if (multi.length) {
          drawChart(canvas, multi, { badge: String(title || ''), mode })
          tile.dataset.missing = '0'
          const prev = tile.querySelector('.sg-legend')
          if (prev) prev.remove()
          const legend = document.createElement('div')
          legend.className = 'sg-legend'
          for (const s of multi.slice(0, 10)) {
            const last = s.points && s.points.length ? s.points[s.points.length - 1].v : null
            const it = document.createElement('div')
            it.className = 'sg-legitem'
            it.title = labelFor(s.key)
            const dot = document.createElement('span')
            dot.className = 'sg-dot'
            dot.style.background = s.color
            const txt = document.createElement('span')
            const shortKey = String(s.key || '').replace(/^(.{6}).+/, '$1…')
            txt.textContent = `${shortKey} ${formatValue(last, mode)}`
            it.appendChild(dot)
            it.appendChild(txt)
            legend.appendChild(it)
          }
          tile.appendChild(legend)
          continue
        }
      }

      drawChart(canvas, seriesList, { badge, mode })
      tile.dataset.missing = norm.length >= 2 ? '0' : '1'
      const prev = tile.querySelector('.sg-legend')
      if (prev) prev.remove()
    }
  }

  w.SupergraphicsRender = { renderInto, formatValue, resolveSymbolFromTitle, getWindowedPointCount }
})()
