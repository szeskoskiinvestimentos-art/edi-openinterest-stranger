(async function () {
  const w = typeof window !== 'undefined' ? window : null
  if (!w) return

  const grid = document.getElementById('templateGrid')
  const root = document.documentElement
  if (!grid || !root) return

  const templateId = root.getAttribute('data-template') || ''
  const scaleStorageKey = 'edi_supergraphics_scale_v1'

  function loadScalePrefs() {
    try {
      const raw = w.localStorage ? w.localStorage.getItem(scaleStorageKey) : null
      if (!raw) return {}
      const obj = JSON.parse(raw)
      return obj && typeof obj === 'object' ? obj : {}
    } catch {
      return {}
    }
  }

  function saveScalePrefs(prefs) {
    try {
      if (!w.localStorage) return
      w.localStorage.setItem(scaleStorageKey, JSON.stringify(prefs && typeof prefs === 'object' ? prefs : {}))
    } catch {
    }
  }

  function tileKey(tile) {
    const t = tile && tile.dataset ? String(tile.dataset.title || '') : ''
    return `${templateId}::${t}`.toLowerCase()
  }

  function templateKey() {
    return `_template::${String(templateId || '').toLowerCase()}`
  }

  function ensureRenderLoaded() {
    if (w.SupergraphicsRender && typeof w.SupergraphicsRender.renderInto === 'function') return Promise.resolve(true)
    const candidates = [
      '../../assets/js/supergraphics-render.js',
      '../assets/js/supergraphics-render.js',
      '../../../assets/js/supergraphics-render.js',
      '/dashboard_unificado/correlation/assets/js/supergraphics-render.js',
    ]
    return new Promise((resolve) => {
      const tryNext = (idx) => {
        if (w.SupergraphicsRender && typeof w.SupergraphicsRender.renderInto === 'function') return resolve(true)
        if (idx >= candidates.length) return resolve(false)
        const s = document.createElement('script')
        s.src = (w.ediCacheBust ? w.ediCacheBust(candidates[idx]) : candidates[idx])
        s.async = true
        s.onload = () => resolve(true)
        s.onerror = () => tryNext(idx + 1)
        document.head.appendChild(s)
      }
      tryNext(0)
    })
  }

  function ensureMarketQuotesJsLoaded() {
    if (w.MARKET_QUOTES_DATA && typeof w.MARKET_QUOTES_DATA === 'object') return Promise.resolve(true)
    const candidates = [
      '../../../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js',
      '../../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js',
      '../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js',
      '../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js',
      '/Cotacoes/dashboard/MERCADO/assets/data/market_quotes.js',
    ]
    return new Promise((resolve) => {
      const tryNext = (idx) => {
        if (w.MARKET_QUOTES_DATA && typeof w.MARKET_QUOTES_DATA === 'object') return resolve(true)
        if (idx >= candidates.length) return resolve(false)
        const s = document.createElement('script')
        s.src = `${candidates[idx]}`
        s.async = true
        s.onload = () => resolve(true)
        s.onerror = () => tryNext(idx + 1)
        document.head.appendChild(s)
      }
      tryNext(0)
    })
  }

  async function loadTemplatesConfig() {
    const candidates = [
      '../../assets/data/supergraphics_templates.json',
      '/dashboard_unificado/correlation/assets/data/supergraphics_templates.json',
    ]
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) continue
        const obj = await res.json()
        if (obj && typeof obj === 'object') return obj
      } catch {
      }
    }
    return null
  }

  async function loadMarketQuotes() {
    if (w.MARKET_QUOTES_DATA && typeof w.MARKET_QUOTES_DATA === 'object') return w.MARKET_QUOTES_DATA
    await ensureMarketQuotesJsLoaded()
    if (w.MARKET_QUOTES_DATA && typeof w.MARKET_QUOTES_DATA === 'object') return w.MARKET_QUOTES_DATA
    const candidates = [
      '../../../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json',
      '../../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json',
      '../../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json',
      '../Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json',
      '/Cotacoes/dashboard/MERCADO/assets/data/market_quotes.json',
    ]
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) continue
        const obj = await res.json()
        if (obj && typeof obj === 'object') return obj
      } catch {
      }
    }
    return null
  }

  const mkTile = (title, minHeight) => {
    const tile = document.createElement('div')
    tile.className = 'sg-tile'
    tile.dataset.title = String(title || '')

    const head = document.createElement('div')
    head.className = 'sg-tilehead'
    head.textContent = String(title)
    tile.appendChild(head)

    const canvas = document.createElement('div')
    canvas.className = 'sg-tilecanvas'
    const c = document.createElement('canvas')
    canvas.appendChild(c)
    tile.appendChild(canvas)

    if (typeof minHeight === 'number' && Number.isFinite(minHeight) && minHeight > 0) {
      tile.style.minHeight = `${Math.round(minHeight)}px`
    }
    return tile
  }

  const mkStack = (titles, minHeight) => {
    const col = document.createElement('div')
    col.className = 'sg-col sg-stack'
    for (const it of (Array.isArray(titles) ? titles : [])) {
      const title = (it && typeof it === 'object') ? String(it.title || '') : String(it || '')
      const tile = mkTile(title, minHeight)
      if (it && typeof it === 'object' && it.open) tile.dataset.open = String(it.open)
      if (it && typeof it === 'object' && Array.isArray(it.symbols) && it.symbols.length) tile.dataset.symbols = it.symbols.map(s => String(s).trim()).filter(Boolean).join(',')
      if (it && typeof it === 'object' && it.rollingCorr && typeof it.rollingCorr === 'object') {
        const rc = it.rollingCorr
        tile.dataset.rollingCorr = '1'
        if (rc.base) tile.dataset.rcBase = String(rc.base)
        if (Array.isArray(rc.compare) && rc.compare.length) tile.dataset.rcCompare = rc.compare.map(s => String(s).trim()).filter(Boolean).join(',')
        if (Number.isFinite(Number(rc.windowPoints))) tile.dataset.rcWindow = String(Math.max(3, Math.floor(Number(rc.windowPoints))))
        tile.dataset.lockScale = '1'
        tile.dataset.scale = 'corr'
      }
      col.appendChild(tile)
    }
    return col
  }

  const mkMidGrid = (titles, minHeight) => {
    const col = document.createElement('div')
    col.className = 'sg-col sg-midgrid'
    for (const it of (Array.isArray(titles) ? titles : [])) {
      const title = (it && typeof it === 'object') ? String(it.title || '') : String(it || '')
      const tile = mkTile(title, minHeight)
      if (it && typeof it === 'object' && it.open) tile.dataset.open = String(it.open)
      if (it && typeof it === 'object' && Array.isArray(it.symbols) && it.symbols.length) tile.dataset.symbols = it.symbols.map(s => String(s).trim()).filter(Boolean).join(',')
      if (it && typeof it === 'object' && it.rollingCorr && typeof it.rollingCorr === 'object') {
        const rc = it.rollingCorr
        tile.dataset.rollingCorr = '1'
        if (rc.base) tile.dataset.rcBase = String(rc.base)
        if (Array.isArray(rc.compare) && rc.compare.length) tile.dataset.rcCompare = rc.compare.map(s => String(s).trim()).filter(Boolean).join(',')
        if (Number.isFinite(Number(rc.windowPoints))) tile.dataset.rcWindow = String(Math.max(3, Math.floor(Number(rc.windowPoints))))
        tile.dataset.lockScale = '1'
        tile.dataset.scale = 'corr'
      }
      col.appendChild(tile)
    }
    return col
  }

  const cfgRoot = await loadTemplatesConfig()
  const templates = (cfgRoot && cfgRoot.templates && typeof cfgRoot.templates === 'object') ? cfgRoot.templates : null
  const tpl = templates && templates[templateId] ? templates[templateId] : null

  const renderSimpleGrid = (t) => {
    const cols = Math.max(1, Number(t && t.cols) || 4)
    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`
    const tiles = Array.isArray(t && t.tiles) ? t.tiles : []
    const nodes = tiles.map((it) => {
      const title = typeof it === 'string' ? it : String(it && it.title ? it.title : '')
      const minHeight = typeof it === 'object' && it && Number.isFinite(Number(it.minHeight)) ? Number(it.minHeight) : (templateId === 'superchart' ? 620 : 150)
      const tile = mkTile(title, minHeight)
      if (typeof it === 'object' && it) {
        const spanCols = Number(it.spanCols) || 0
        const spanRows = Number(it.spanRows) || 0
        if (spanCols > 1) tile.style.gridColumn = `span ${Math.round(spanCols)}`
        if (spanRows > 1) tile.style.gridRow = `span ${Math.round(spanRows)}`
        if (it.open) tile.dataset.open = String(it.open)
        if (Array.isArray(it.symbols) && it.symbols.length) tile.dataset.symbols = it.symbols.map(s => String(s).trim()).filter(Boolean).join(',')
        if (it.rollingCorr && typeof it.rollingCorr === 'object') {
          const rc = it.rollingCorr
          tile.dataset.rollingCorr = '1'
          if (rc.base) tile.dataset.rcBase = String(rc.base)
          if (Array.isArray(rc.compare) && rc.compare.length) tile.dataset.rcCompare = rc.compare.map(s => String(s).trim()).filter(Boolean).join(',')
          if (Number.isFinite(Number(rc.windowPoints))) tile.dataset.rcWindow = String(Math.max(3, Math.floor(Number(rc.windowPoints))))
          tile.dataset.lockScale = '1'
          tile.dataset.scale = 'corr'
        }
      }
      return tile
    })
    grid.replaceChildren(...nodes)
  }

  const renderMosaic3col = (t) => {
    if (templateId === 'b3-overview') grid.classList.add('sg-layout-b3')
    if (templateId === 'hk-global') grid.classList.add('sg-layout-hk')
    if (templateId === 'nasdaq-sp500') grid.classList.add('sg-layout-nasdaq')
    const left = t && t.left ? t.left : null
    const middle = t && t.middle ? t.middle : null
    const right = t && t.right ? t.right : null

    const mkCol = (part) => {
      const layout = String(part && part.layout ? part.layout : 'stack')
      const minH = Number(part && part.minHeight) || 150
      const tiles = Array.isArray(part && part.tiles) ? part.tiles : []
      if (layout === 'midgrid') return mkMidGrid(tiles, minH)
      return mkStack(tiles, minH)
    }

    const nodes = [mkCol(left), mkCol(middle), mkCol(right)].filter(Boolean)
    grid.replaceChildren(...nodes)
  }

  const renderEmpty = (msg) => {
    grid.style.gridTemplateColumns = 'repeat(1, minmax(0, 1fr))'
    const box = document.createElement('div')
    box.style.padding = '14px'
    box.style.borderRadius = '14px'
    box.style.border = '1px solid rgba(255,255,255,0.10)'
    box.style.background = 'rgba(0,0,0,0.18)'
    box.style.color = 'rgba(229,231,235,0.90)'
    box.style.fontWeight = '900'
    box.style.letterSpacing = '.2px'
    box.textContent = String(msg || 'Template indisponível.')
    grid.replaceChildren(box)
  }

  if (!tpl || typeof tpl !== 'object') {
    renderEmpty(`Template não configurado: ${templateId}`)
    return
  }
  if (tpl.layout === 'mosaic3col') renderMosaic3col(tpl)
  else if (tpl.layout === 'simpleGrid') renderSimpleGrid(tpl)
  else {
    renderEmpty(`Layout inválido no template: ${templateId}`)
    return
  }

  const prefs = loadScalePrefs()
  try {
    const tiles = Array.from(grid.querySelectorAll('.sg-tile'))
    for (const tile of tiles) {
      if (String(tile.dataset.lockScale || '') === '1') {
        tile.dataset.scale = 'corr'
        continue
      }
      const key = tileKey(tile)
      const fallback = prefs && prefs[templateKey()] ? String(prefs[templateKey()]) : 'norm'
      const mode = prefs && prefs[key] ? String(prefs[key]) : fallback
      tile.dataset.scale = mode
    }
  } catch {
  }

  const ok = await ensureRenderLoaded()
  if (!ok) return
  const marketData = await loadMarketQuotes()
  if (!marketData) return
  try {
    const gen = marketData && marketData.meta && marketData.meta.generatedAt ? String(marketData.meta.generatedAt) : ''
    const interval = Number(marketData && marketData.meta && marketData.meta.intervalMinutes) || 5
    const msg = gen ? `generatedAt=${gen} • janela~60m • interval=${interval}m` : `janela~60m • interval=${interval}m`
    const topbar = document.querySelector('.sg-topbar')
    if (topbar && !topbar.querySelector('[data-sg-meta]')) {
      const meta = document.createElement('div')
      meta.setAttribute('data-sg-meta', '1')
      meta.style.color = 'rgba(229,231,235,0.70)'
      meta.style.fontSize = '12px'
      meta.style.fontWeight = '900'
      meta.style.letterSpacing = '.2px'
      meta.textContent = msg
      topbar.appendChild(meta)
    } else {
      const meta = topbar ? topbar.querySelector('[data-sg-meta]') : null
      if (meta) meta.textContent = msg
    }
  } catch {
  }

  function updateCoverage({ ensureVisible } = {}) {
    try {
      const topbar = document.querySelector('.sg-topbar')
      if (!topbar) return
      const tiles = Array.from(grid.querySelectorAll('.sg-tile'))
      const total = tiles.length
      const missing = tiles.filter(t => String(t.dataset.missing || '') === '1').length
      let seriesTotal = 0
      for (const t of tiles) {
        const c = t.querySelector('canvas')
        const meta = c && c.__sgMeta ? c.__sgMeta : null
        const sl = meta && Array.isArray(meta.seriesList) ? meta.seriesList.length : 0
        seriesTotal += sl
      }
      const ok = Math.max(0, total - missing)
      const msg = total ? `cobertura=${ok}/${total} • missing=${missing} • séries=${seriesTotal}` : 'cobertura=0/0'
      const existing = topbar.querySelector('[data-sg-coverage]')
      if (existing) existing.textContent = msg
      else if (ensureVisible) {
        const div = document.createElement('div')
        div.setAttribute('data-sg-coverage', '1')
        div.style.color = 'rgba(229,231,235,0.62)'
        div.style.fontSize = '12px'
        div.style.fontWeight = '900'
        div.style.letterSpacing = '.2px'
        div.textContent = msg
        topbar.appendChild(div)
      }
    } catch {
    }
  }

  if (w.SupergraphicsRender && typeof w.SupergraphicsRender.renderInto === 'function') {
    w.SupergraphicsRender.renderInto(grid, { templateId, templateConfig: cfgRoot, marketData })
    updateCoverage({ ensureVisible: true })
    const clickables = Array.from(grid.querySelectorAll('.sg-tile[data-open]'))
    if (clickables.length) {
      for (const t of clickables) {
        t.addEventListener('click', () => {
          const href = String(t.dataset.open || '').trim()
          if (!href) return
          const url = new URL(href, window.location.href).toString()
          const wpx = Math.min(1700, Math.max(980, Math.floor(window.screen.availWidth * 0.90)))
          const hpx = Math.min(980, Math.max(720, Math.floor(window.screen.availHeight * 0.90)))
          const left = Math.max(0, Math.floor((window.screen.availWidth - wpx) / 2))
          const top = Math.max(0, Math.floor((window.screen.availHeight - hpx) / 2))
          window.open(url, `ediSupergraphics_open_${templateId}`, `popup=yes,width=${wpx},height=${hpx},left=${left},top=${top}`)
        })
      }
    }
    const onResize = (() => {
      let t = null
      return () => {
        if (t) clearTimeout(t)
        t = setTimeout(() => {
          try { w.SupergraphicsRender.renderInto(grid, { templateId, templateConfig: cfgRoot, marketData }) } catch { }
          updateCoverage()
        }, 120)
      }
    })()
    w.addEventListener('resize', onResize, { passive: true })
  }

  function ensureContextMenu() {
    const existing = document.querySelector('.sg-ctxmenu')
    if (existing) return existing
    const menu = document.createElement('div')
    menu.className = 'sg-ctxmenu'
    menu.innerHTML = '<div class="title">Escala</div>'
    const mkBtn = (label, mode) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.textContent = label
      b.dataset.mode = mode
      return b
    }
    menu.appendChild(mkBtn('Auto (Normalizada base 100)', 'norm'))
    menu.appendChild(mkBtn('Variação (%)', 'pct'))
    menu.appendChild(mkBtn('Último preço (valor)', 'price'))
    menu.appendChild(mkBtn('Aplicar a todos (neste template)', 'apply_all'))
    menu.appendChild(mkBtn('Limpar preferências (neste template)', 'reset'))
    document.body.appendChild(menu)
    const close = () => { menu.dataset.open = '0' }
    document.addEventListener('click', close, { capture: true })
    w.addEventListener('blur', close)
    w.addEventListener('scroll', close, { passive: true })
    return menu
  }

  function openMenuAt(menu, x, y) {
    const pad = 8
    const vw = Math.max(200, w.innerWidth || 1200)
    const vh = Math.max(200, w.innerHeight || 800)
    menu.style.left = `${Math.round(Math.min(vw - pad, Math.max(pad, x)))}px`
    menu.style.top = `${Math.round(Math.min(vh - pad, Math.max(pad, y)))}px`
    menu.dataset.open = '1'
    const r = menu.getBoundingClientRect()
    const nx = Math.min(vw - pad - r.width, Math.max(pad, x))
    const ny = Math.min(vh - pad - r.height, Math.max(pad, y))
    menu.style.left = `${Math.round(nx)}px`
    menu.style.top = `${Math.round(ny)}px`
  }

  try {
    const menu = ensureContextMenu()
    let currentTile = null
    let currentMode = 'norm'

    function refreshMenuActive() {
      const btns = Array.from(menu.querySelectorAll('button[data-mode]'))
      for (const b of btns) {
        const m = String(b.dataset.mode || '')
        b.dataset.active = (m === currentMode) ? '1' : '0'
      }
    }

    grid.addEventListener('contextmenu', (ev) => {
      const tile = ev.target && ev.target.closest ? ev.target.closest('.sg-tile') : null
      if (!tile) return
      if (String(tile.dataset.lockScale || '') === '1') return
      ev.preventDefault()
      currentTile = tile
      currentMode = String(tile.dataset.scale || 'norm')
      refreshMenuActive()
      openMenuAt(menu, ev.clientX, ev.clientY)
    })

    menu.addEventListener('click', (ev) => {
      const btn = ev.target && ev.target.closest ? ev.target.closest('button[data-mode]') : null
      if (!btn || !currentTile) return
      const mode = String(btn.dataset.mode || 'norm')
      const tiles = Array.from(grid.querySelectorAll('.sg-tile'))

      if (mode === 'apply_all') {
        const p = loadScalePrefs()
        p[templateKey()] = currentMode
        for (const tile of tiles) {
          delete p[tileKey(tile)]
          tile.dataset.scale = currentMode
        }
        saveScalePrefs(p)
        try { w.SupergraphicsRender.renderInto(grid, { templateId, templateConfig: cfgRoot, marketData }) } catch { }
        menu.dataset.open = '0'
        return
      }

      if (mode === 'reset') {
        const p = loadScalePrefs()
        delete p[templateKey()]
        for (const tile of tiles) {
          delete p[tileKey(tile)]
          tile.dataset.scale = 'norm'
        }
        saveScalePrefs(p)
        currentMode = 'norm'
        refreshMenuActive()
        try { w.SupergraphicsRender.renderInto(grid, { templateId, templateConfig: cfgRoot, marketData }) } catch { }
        menu.dataset.open = '0'
        return
      }

      currentMode = mode
      currentTile.dataset.scale = mode
      const p = loadScalePrefs()
      p[tileKey(currentTile)] = mode
      saveScalePrefs(p)
      refreshMenuActive()
      try { w.SupergraphicsRender.renderInto(grid, { templateId, templateConfig: cfgRoot, marketData }) } catch { }
      menu.dataset.open = '0'
    })
  } catch {
  }

  function ensureHoverUI(tile) {
    const existing = tile.querySelector('.sg-tooltip')
    const tooltip = existing || (() => {
      const t = document.createElement('div')
      t.className = 'sg-tooltip'
      tile.appendChild(t)
      return t
    })()
    const cross = tile.querySelector('.sg-crosshair') || (() => {
      const c = document.createElement('div')
      c.className = 'sg-crosshair'
      tile.appendChild(c)
      return c
    })()
    const crossY = tile.querySelector('.sg-crosshair-y') || (() => {
      const c = document.createElement('div')
      c.className = 'sg-crosshair-y'
      tile.appendChild(c)
      return c
    })()
    const hoverLabel = tile.querySelector('.sg-hoverlabel') || (() => {
      const d = document.createElement('div')
      d.className = 'sg-hoverlabel'
      tile.appendChild(d)
      return d
    })()
    return { tooltip, cross, crossY, hoverLabel }
  }

  function ensureRulerUI(tile) {
    const existing = tile.querySelector('.sg-ruler')
    const ruler = existing || (() => {
      const r = document.createElement('div')
      r.className = 'sg-ruler'
      r.dataset.open = '0'
      const a = document.createElement('div')
      a.className = 'sg-rulerline'
      a.dataset.kind = 'start'
      const b = document.createElement('div')
      b.className = 'sg-rulerline'
      b.dataset.kind = 'end'
      const box = document.createElement('div')
      box.className = 'sg-rulerbox'
      r.appendChild(a)
      r.appendChild(b)
      r.appendChild(box)
      tile.appendChild(r)
      return r
    })()
    const lines = ruler.querySelectorAll('.sg-rulerline')
    const lineStart = lines && lines.length ? lines[0] : null
    const lineEnd = lines && lines.length > 1 ? lines[1] : null
    const box = ruler.querySelector('.sg-rulerbox')
    return { ruler, lineStart, lineEnd, box }
  }

  function fmtTs(ts) {
    if (typeof ts !== 'number' || !Number.isFinite(ts)) return ''
    try {
      const d = new Date(ts)
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    } catch {
      return ''
    }
  }

  function pickIdxFromEvent(canvas, meta, ev) {
    const rect = canvas.getBoundingClientRect()
    const x = (ev.clientX - rect.left)
    const pad = Number(meta && meta.pad) || 10
    const innerW = Number(meta && meta.innerW) || Math.max(1, rect.width - pad * 2)
    const seriesList = Array.isArray(meta && meta.seriesList) ? meta.seriesList : []
    if (!seriesList.length || !seriesList[0] || !Array.isArray(seriesList[0].points)) return 0
    const n = seriesList[0].points.length
    if (n < 2) return 0
    const plotW = Math.max(1, innerW)
    const t = Math.max(0, Math.min(1, (x - pad) / plotW))
    return Math.max(0, Math.min(n - 1, Math.round(t * (n - 1))))
  }

  function signed(v, digits) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—'
    const d = Math.max(0, Math.min(6, Math.floor(Number(digits) || 2)))
    const s = v >= 0 ? '+' : ''
    return `${s}${v.toFixed(d)}`
  }

  function updateRuler(tile, canvas, meta, startIdx, ev) {
    const seriesList = Array.isArray(meta && meta.seriesList) ? meta.seriesList : []
    if (!seriesList.length || !seriesList[0] || !Array.isArray(seriesList[0].points)) return
    const n = seriesList[0].points.length
    if (n < 2) return

    const rect = canvas.getBoundingClientRect()
    const pad = Number(meta && meta.pad) || 10
    const innerW = Number(meta && meta.innerW) || Math.max(1, rect.width - pad * 2)
    const plotW = Math.max(1, innerW)
    const endIdx = pickIdxFromEvent(canvas, meta, ev)
    const sIdx = Math.max(0, Math.min(n - 1, Math.floor(startIdx)))
    const eIdx = Math.max(0, Math.min(n - 1, Math.floor(endIdx)))

    const { tooltip, cross, crossY, hoverLabel } = ensureHoverUI(tile)
    tooltip.dataset.open = '0'
    cross.dataset.open = '0'
    if (crossY) crossY.dataset.open = '0'
    if (hoverLabel) hoverLabel.dataset.open = '0'

    const { ruler, lineStart, lineEnd, box } = ensureRulerUI(tile)
    if (!ruler || !lineStart || !lineEnd || !box) return
    const x1 = pad + (plotW * sIdx) / Math.max(1, n - 1)
    const x2 = pad + (plotW * eIdx) / Math.max(1, n - 1)
    lineStart.style.left = `${Math.round(x1)}px`
    lineEnd.style.left = `${Math.round(x2)}px`
    const midX = (x1 + x2) / 2
    box.style.left = `${Math.round(midX)}px`

    const mode = String(meta && meta.mode ? meta.mode : (tile.dataset.scale || 'norm'))
    const p0 = seriesList[0].points[sIdx]
    const p1 = seriesList[0].points[eIdx]
    const v0 = p0 && typeof p0.v === 'number' ? p0.v : NaN
    const v1 = p1 && typeof p1.v === 'number' ? p1.v : NaN
    const dt0 = p0 && typeof p0.ts === 'number' ? p0.ts : NaN
    const dt1 = p1 && typeof p1.ts === 'number' ? p1.ts : NaN

    const dv = (Number.isFinite(v0) && Number.isFinite(v1)) ? (v1 - v0) : NaN
    const digits = mode === 'price' ? 2 : (mode === 'corr' ? 2 : (mode === 'pct' ? 2 : 1))
    let extra = ''
    if ((mode === 'price' || mode === 'norm') && Number.isFinite(v0) && v0 !== 0 && Number.isFinite(v1)) {
      const pct = ((v1 / v0) - 1) * 100
      if (Number.isFinite(pct)) extra = ` (${signed(pct, 2)}%)`
    }
    if (mode === 'pct') extra = ' pp'

    let time = ''
    const t0 = Number.isFinite(dt0) ? fmtTs(dt0) : ''
    const t1 = Number.isFinite(dt1) ? fmtTs(dt1) : ''
    if (t0 && t1) time = ` • ${t0}→${t1}`

    const a = Number.isFinite(v0) ? signed(v0, digits) : '—'
    const b = Number.isFinite(v1) ? signed(v1, digits) : '—'
    const d = Number.isFinite(dv) ? signed(dv, digits) : '—'
    box.textContent = `${mode} ${a}→${b} • Δ ${d}${extra}${time}`
    ruler.dataset.open = '1'
  }

  function updateHover(tile, canvas, meta, ev) {
    const rect = canvas.getBoundingClientRect()
    const x = (ev.clientX - rect.left)
    const pad = Number(meta && meta.pad) || 10
    const innerW = Number(meta && meta.innerW) || Math.max(1, rect.width - pad * 2)
    const innerH = Number(meta && meta.innerH) || Math.max(1, rect.height - pad * 2)
    const minV = Number(meta && meta.minV)
    const maxV = Number(meta && meta.maxV)
    const seriesList = Array.isArray(meta && meta.seriesList) ? meta.seriesList : []
    if (!seriesList.length || !seriesList[0] || !Array.isArray(seriesList[0].points)) return
    const n = seriesList[0].points.length
    if (n < 2) return
    const plotW = Math.max(1, innerW)
    const t = Math.max(0, Math.min(1, (x - pad) / plotW))
    const idx = Math.max(0, Math.min(n - 1, Math.round(t * (n - 1))))

    const { tooltip, cross, crossY, hoverLabel } = ensureHoverUI(tile)
    const cx = pad + (plotW * idx) / Math.max(1, n - 1)
    cross.style.left = `${Math.round(cx)}px`
    cross.dataset.open = '1'

    const mode = String(meta && meta.mode ? meta.mode : (tile.dataset.scale || 'norm'))
    const formatter = (w.SupergraphicsRender && typeof w.SupergraphicsRender.formatValue === 'function') ? w.SupergraphicsRender.formatValue : null
    const first = seriesList[0].points[idx]
    const tsLine = first && typeof first.ts === 'number' ? fmtTs(first.ts) : ''
    const vFirst = first && typeof first.v === 'number' ? first.v : NaN

    if (crossY && Number.isFinite(vFirst) && Number.isFinite(minV) && Number.isFinite(maxV) && maxV > minV) {
      const tY = (vFirst - minV) / (maxV - minV)
      const cy = pad + innerH * (1 - Math.max(0, Math.min(1, tY)))
      crossY.style.top = `${Math.round(cy)}px`
      crossY.dataset.open = '1'
      if (hoverLabel) {
        const vtxt = formatter ? formatter(vFirst, mode) : (Number.isFinite(vFirst) ? String(vFirst.toFixed(2)) : '—')
        hoverLabel.textContent = vtxt
        hoverLabel.style.top = `${Math.round(cy)}px`
        hoverLabel.dataset.open = '1'
      }
    } else {
      if (crossY) crossY.dataset.open = '0'
      if (hoverLabel) hoverLabel.dataset.open = '0'
    }

    tooltip.innerHTML = ''
    const header = document.createElement('div')
    header.className = 'tline'
    header.textContent = tsLine ? `${tsLine} • ${mode}` : String(mode)
    tooltip.appendChild(header)

    for (const s of seriesList.slice(0, 8)) {
      const p = s && Array.isArray(s.points) ? s.points[idx] : null
      const val = p && typeof p.v === 'number' ? p.v : NaN
      const line = document.createElement('div')
      line.className = 'tline tmuted'
      const fullLabel = String(s && s.label ? s.label : (s && s.key ? s.key : ''))
      const shortLabel = fullLabel.replace(/^(.{28}).+/, '$1…')
      const vtxt = formatter ? formatter(val, mode) : (Number.isFinite(val) ? String(val.toFixed(2)) : '—')
      line.textContent = `${shortLabel}: ${vtxt}`
      line.title = fullLabel
      tooltip.appendChild(line)
    }
    tooltip.dataset.open = '1'
  }

  try {
    const tiles = Array.from(grid.querySelectorAll('.sg-tile'))
    const rulerState = new WeakMap()
    for (const tile of tiles) {
      if (tile.dataset.hoverBound === '1') continue
      const canvas = tile.querySelector('canvas')
      if (!canvas) continue
      tile.dataset.hoverBound = '1'
      canvas.addEventListener('mousemove', (ev) => {
        const meta = canvas.__sgMeta
        if (!meta) return
        const st = rulerState.get(canvas)
        if (st && typeof st.startIdx === 'number') {
          updateRuler(tile, canvas, meta, st.startIdx, ev)
          return
        }
        updateHover(tile, canvas, meta, ev)
      })
      canvas.addEventListener('mousedown', (ev) => {
        if (ev.button !== 0) return
        if (!ev.altKey) return
        const meta = canvas.__sgMeta
        if (!meta) return
        ev.preventDefault()
        ev.stopPropagation()
        const startIdx = pickIdxFromEvent(canvas, meta, ev)
        rulerState.set(canvas, { startIdx })
        updateRuler(tile, canvas, meta, startIdx, ev)
      })
      canvas.addEventListener('mouseup', () => {
        const st = rulerState.get(canvas)
        if (!st) return
        rulerState.delete(canvas)
        const r = tile.querySelector('.sg-ruler')
        if (r) r.dataset.open = '0'
      })
      canvas.addEventListener('mouseleave', () => {
        rulerState.delete(canvas)
        const tip = tile.querySelector('.sg-tooltip')
        const cross = tile.querySelector('.sg-crosshair')
        const crossY = tile.querySelector('.sg-crosshair-y')
        const hoverLabel = tile.querySelector('.sg-hoverlabel')
        const r = tile.querySelector('.sg-ruler')
        if (tip) tip.dataset.open = '0'
        if (cross) cross.dataset.open = '0'
        if (crossY) crossY.dataset.open = '0'
        if (hoverLabel) hoverLabel.dataset.open = '0'
        if (r) r.dataset.open = '0'
      })
    }
  } catch {
  }
})()
