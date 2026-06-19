(async function () {
  const w = typeof window !== 'undefined' ? window : null
  if (!w) return

  const el = document.getElementById('supergraphicsCards')
  if (!el) return

  function ensureRenderLoaded() {
    if (w.SupergraphicsRender && typeof w.SupergraphicsRender.resolveSymbolFromTitle === 'function') return Promise.resolve(true)
    const candidates = [
      'assets/js/supergraphics-render.js',
      './assets/js/supergraphics-render.js',
      '/dashboard_unificado/correlation/assets/js/supergraphics-render.js',
    ]
    return new Promise((resolve) => {
      const tryNext = (idx) => {
        if (w.SupergraphicsRender && typeof w.SupergraphicsRender.resolveSymbolFromTitle === 'function') return resolve(true)
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

  async function loadTemplatesConfig() {
    const candidates = [
      'assets/data/supergraphics_templates.json',
      './assets/data/supergraphics_templates.json',
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

  const cfg = (w.EDISupergraphicsConfig && typeof w.EDISupergraphicsConfig === 'object') ? w.EDISupergraphicsConfig : null
  const items = Array.isArray(cfg && cfg.items) ? cfg.items : []

  const openPopup = (href, title) => {
    const wpx = Math.min(1600, Math.max(980, Math.floor(window.screen.availWidth * 0.86)))
    const hpx = Math.min(980, Math.max(720, Math.floor(window.screen.availHeight * 0.86)))
    const left = Math.max(0, Math.floor((window.screen.availWidth - wpx) / 2))
    const top = Math.max(0, Math.floor((window.screen.availHeight - hpx) / 2))
    window.open(href, `ediSupergraphics_${String(title || 'chart')}`, `popup=yes,width=${wpx},height=${hpx},left=${left},top=${top}`)
  }

  const cardById = new Map()

  const mkBadge = () => {
    const b = document.createElement('div')
    b.className = 'sg-covbadge'
    b.textContent = '—'
    b.dataset.level = 'unknown'
    b.title = 'Cobertura: carregando…'
    return b
  }

  const nodes = items.map(it => {
    const title = String(it && it.title ? it.title : '')
    const desc = String(it && it.desc ? it.desc : '')
    const href = String(it && it.href ? it.href : '')
    const id = String(it && it.id ? it.id : title || 'chart')

    const card = document.createElement('div')
    card.className = 'sg-card'

    const hero = document.createElement('div')
    hero.className = 'sg-hero'
    hero.appendChild(mkBadge())
    card.appendChild(hero)

    const body = document.createElement('div')
    body.className = 'sg-body'

    const h = document.createElement('h3')
    h.className = 'sg-title'
    h.textContent = title
    body.appendChild(h)

    const p = document.createElement('div')
    p.className = 'sg-desc'
    p.textContent = desc
    body.appendChild(p)

    const a = document.createElement('button')
    a.type = 'button'
    a.className = 'sg-open'
    a.textContent = 'Open Chart'
    a.addEventListener('click', () => openPopup(href, id))
    body.appendChild(a)

    card.appendChild(body)
    cardById.set(id, card)
    return card
  })

  el.replaceChildren(...nodes)

  try {
    const okRender = await ensureRenderLoaded()
    if (!okRender) return
    const templatesCfg = await loadTemplatesConfig()
    const marketData = (w.MARKET_QUOTES_DATA && typeof w.MARKET_QUOTES_DATA === 'object') ? w.MARKET_QUOTES_DATA : null
    if (!templatesCfg || !marketData) return

    const R = w.SupergraphicsRender
    if (!R || typeof R.resolveSymbolFromTitle !== 'function' || typeof R.getWindowedPointCount !== 'function') return

    const getTiles = (tpl) => {
      if (!tpl || typeof tpl !== 'object') return []
      if (tpl.layout === 'simpleGrid') return Array.isArray(tpl.tiles) ? tpl.tiles : []
      if (tpl.layout === 'mosaic3col') {
        const out = []
        for (const part of [tpl.left, tpl.middle, tpl.right]) {
          if (!part || typeof part !== 'object') continue
          const xs = Array.isArray(part.tiles) ? part.tiles : []
          for (const it of xs) out.push(it)
        }
        return out
      }
      return []
    }

    const coverageForTemplate = (templateId) => {
      const tpl = templatesCfg && templatesCfg.templates ? templatesCfg.templates[templateId] : null
      const tiles = getTiles(tpl)
      const total = tiles.length
      let ok = 0
      let seriesTotal = 0
      for (const t of tiles) {
        let wanted = []
        if (typeof t === 'string') wanted = [t]
        else if (t && typeof t === 'object') {
          if (Array.isArray(t.symbols) && t.symbols.length) wanted = t.symbols
          else if (t.title) wanted = [t.title]
        }
        let tileSeries = 0
        for (const wtd of wanted) {
          const sym = R.resolveSymbolFromTitle(wtd, marketData)
          if (!sym) continue
          const n = R.getWindowedPointCount(sym, marketData, 60)
          if (n >= 2) tileSeries++
        }
        if (tileSeries >= 1) ok++
        seriesTotal += tileSeries
      }
      const missing = Math.max(0, total - ok)
      return { ok, total, missing, seriesTotal }
    }

    const ranks = []
    for (const it of items) {
      const id = String(it && it.id ? it.id : '')
      if (!id) continue
      const card = cardById.get(id)
      if (!card) continue
      const badge = card.querySelector('.sg-covbadge')
      if (!badge) continue
      const cov = coverageForTemplate(id)
      if (!cov || !cov.total) continue
      const ratio = cov.total ? (cov.ok / cov.total) : 0
      const level = ratio >= 0.80 ? 'good' : (ratio >= 0.50 ? 'warn' : 'bad')
      badge.dataset.level = level
      badge.textContent = `${cov.ok}/${cov.total}`
      badge.title = `Cobertura: ok=${cov.ok}/${cov.total} • missing=${cov.missing} • séries=${cov.seriesTotal}`
      ranks.push({ id, ratio, card })
    }

    if (ranks.length) {
      ranks.sort((a, b) => (a.ratio - b.ratio) || String(a.id).localeCompare(String(b.id)))
      el.replaceChildren(...ranks.map(r => r.card))
    }
  } catch {
  }
})()
