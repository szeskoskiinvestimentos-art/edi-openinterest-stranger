(function () {
  const w = typeof window !== 'undefined' ? window : null
  if (!w) return

  function buildMetaBySymbol(data) {
    const assets = Array.isArray(data && data.assets) ? data.assets : []
    const out = new Map()
    for (const a of assets) {
      if (!a || typeof a !== 'object') continue
      const symbol = String(a.symbol || '').trim()
      if (!symbol || out.has(symbol)) continue
      const name = String(a.name || '').trim()
      const category = String(a.category || '').trim()
      const exchange = a.exchange ? String(a.exchange).trim() : ''
      const tags = Array.isArray(a.tags) ? a.tags.map(x => String(x)).filter(Boolean) : []
      out.set(symbol, { symbol, name, category, exchange, tags })
    }
    return out
  }

  function metaLine(meta) {
    if (!meta) return ''
    const parts = []
    const name = meta.name ? String(meta.name).trim() : ''
    const category = meta.category ? String(meta.category).trim() : ''
    const exchange = meta.exchange ? String(meta.exchange).trim() : ''
    if (name) parts.push(name)
    if (category) parts.push(category)
    if (exchange) parts.push(exchange)
    return parts.join(' • ')
  }

  w.CorrCatalog = {
    buildMetaBySymbol,
    metaLine,
  }
})()

