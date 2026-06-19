(function () {
  const w = typeof window !== 'undefined' ? window : null
  if (!w) return

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
    return '#0b0d12'
  }

  function corrHint(v) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return ''
    const a = Math.abs(v)
    const strength = a >= 0.85 ? 'muito forte' : a >= 0.65 ? 'forte' : a >= 0.35 ? 'moderada' : 'fraca'
    if (v >= 0.15) return `Positiva ${strength}: tendem a andar juntos.`
    if (v <= -0.15) return `Negativa ${strength}: tendem a andar em sentidos opostos.`
    return `Próxima de zero (${strength}): relação fraca no período.`
  }

  function renderMatrix({ elMeta, elMatrix, elPin, selected, generatedAt, intervalMinutes, pricePoints, symbolMeta } = {}) {
    const math = w.CorrMatrixMath || {}
    const fmt = typeof math.fmt === 'function' ? math.fmt : ((n) => String(n))
    const corr = typeof math.corr === 'function' ? math.corr : (() => null)
    const cat = w.CorrCatalog || {}
    const metaLine = typeof cat.metaLine === 'function' ? cat.metaLine : (() => '')

    const list = Array.isArray(selected) ? selected : []
    const n = list.length
    if (!elMeta || !elMatrix || !elPin) return
    if (!n) {
      elMeta.textContent = 'Sem dados suficientes'
      elPin.textContent = ''
      elMatrix.replaceChildren()
      return
    }

    const minLen = Math.min(...list.map(s => s.rets.length))
    const aligned = list.map(s => ({ ...s, rets: s.rets.slice(s.rets.length - minLen) }))
    const windowMins = Math.round((pricePoints - 1) * intervalMinutes)
    const windowLine = `Janela: ~${windowMins}min (n=${minLen} retornos)`
    const coverage = `${n}/20`

    elMeta.textContent = `generatedAt=${generatedAt || '-'} • interval=${intervalMinutes}min • janela=${pricePoints - 1} retornos (~${windowMins}min) • cobertura=${coverage}`
    elMatrix.style.gridTemplateColumns = `160px repeat(${n}, minmax(46px, 1fr))`

    const nodes = []

    const tl = document.createElement('div')
    tl.className = 'cell tl'
    tl.textContent = 'Ativo'
    nodes.push(tl)

    const symMeta = symbolMeta instanceof Map ? symbolMeta : new Map()
    const titleForSym = (sym) => {
      const m = symMeta.get(sym)
      const line = metaLine(m)
      return line ? `${sym}\n${line}` : sym
    }

    for (let j = 0; j < n; j++) {
      const h = document.createElement('div')
      h.className = 'cell t'
      h.textContent = aligned[j].symbol
      h.title = titleForSym(aligned[j].symbol)
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
      const hint = corrHint(v)
      const la = metaLine(symMeta.get(a))
      const lb = metaLine(symMeta.get(b))
      const head = `${a} × ${b} = ${fmt(v, 3)}`
      const lines = [head]
      lines.push(windowLine)
      if (la) lines.push(`${a}: ${la}`)
      if (lb) lines.push(`${b}: ${lb}`)
      if (hint) lines.push(hint)
      elPin.textContent = lines.join('\n')
    }

    for (let i = 0; i < n; i++) {
      const rowHead = document.createElement('div')
      rowHead.className = 'cell h'
      rowHead.textContent = aligned[i].symbol
      rowHead.title = titleForSym(aligned[i].symbol)
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
        const la = metaLine(symMeta.get(a))
        const lb = metaLine(symMeta.get(b))
        const hint = corrHint(v)
        const titleLines = [`${a} × ${b} = ${fmt(v, 3)}`]
        titleLines.push(windowLine)
        if (la) titleLines.push(`${a}: ${la}`)
        if (lb) titleLines.push(`${b}: ${lb}`)
        if (hint) titleLines.push(hint)
        cell.title = titleLines.join('\n')
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

  w.CorrMatrixUI = {
    corrColor,
    textColorForBg,
    renderMatrix,
  }
})()
