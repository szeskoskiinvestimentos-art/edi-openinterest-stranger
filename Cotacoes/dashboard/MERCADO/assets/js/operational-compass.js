(function () {
  const DEFAULT_TUNING = {
    version: '2026-04-28.1',
    freshness: {
      okMaxMin: 15,
      warnMaxMin: 30,
      staleMaxMin: 60,
      factorOk: 1.0,
      factorWarn: 0.86,
      factorStale: 0.72,
      factorVeryStale: 0.58,
    },
    stale: {
      warnMin: 20,
    },
    confidence: {
      baseConvictionFallback: 0.55,
      mixConviction: 0.62,
      mixMagnitude: 0.38,
      magnitudeDivisor: 1.2,
      labelHighMin: 0.74,
      labelMidMin: 0.58,
    },
    conservative: {
      enabledDefault: false,
      extraStalePenalty: 0.12,
      missingPenaltyPerModule: 0.08,
      minConfidenceFloor: 0.18,
      warnOnAnyMissing: true,
    },
  }

  const escapeHtml = (value) => {
    const s = String(value ?? '')
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const clamp01 = (v) => Math.max(0, Math.min(1, typeof v === 'number' && Number.isFinite(v) ? v : 0))

  const readQuery = (key) => {
    try {
      const u = new URL(String(location.href))
      return u.searchParams.get(key)
    } catch {
      return null
    }
  }

  try {
    if (readQuery('embed') === 'compass') document.documentElement.classList.add('embed-compass')
  } catch {
    void 0
  }

  let lastInput = null
  let handlersBound = false

  const getMode = () => {
    const q = readQuery('opMode')
    if (q) {
      const v = String(q).toLowerCase()
      if (v === 'conservative' || v === 'c' || v === '1') return 'conservative'
      if (v === 'normal' || v === 'n' || v === '0') return 'normal'
    }
    try {
      const v = localStorage.getItem('edi_op_mode')
      if (!v) return null
      const s = String(v).toLowerCase()
      if (s === 'conservative') return 'conservative'
      if (s === 'normal') return 'normal'
      return null
    } catch {
      return null
    }
  }

  const setMode = (mode) => {
    const v = String(mode || '').toLowerCase() === 'conservative' ? 'conservative' : 'normal'
    try {
      localStorage.setItem('edi_op_mode', v)
    } catch {
      void 0
    }
    return v
  }

  const getTuning = () => {
    const override = typeof window.OPERATIONAL_COMPASS_TUNING === 'object' && window.OPERATIONAL_COMPASS_TUNING ? window.OPERATIONAL_COMPASS_TUNING : null
    if (!override) return DEFAULT_TUNING
    return {
      ...DEFAULT_TUNING,
      ...override,
      freshness: { ...DEFAULT_TUNING.freshness, ...(override.freshness || {}) },
      stale: { ...DEFAULT_TUNING.stale, ...(override.stale || {}) },
      confidence: { ...DEFAULT_TUNING.confidence, ...(override.confidence || {}) },
      conservative: { ...DEFAULT_TUNING.conservative, ...(override.conservative || {}) },
    }
  }

  const toMs = (v) => {
    if (!v) return null
    const ms = Date.parse(String(v))
    return Number.isFinite(ms) ? ms : null
  }

  const ageMin = (nowMs, tsMs) => (typeof tsMs === 'number' && Number.isFinite(tsMs) ? Math.max(0, (nowMs - tsMs) / 60000) : null)

  const ageText = (mins) => {
    if (mins === null) return '—'
    if (mins < 1) return 'agora'
    if (mins < 60) return `há ${Math.round(mins)}m`
    const h = Math.floor(mins / 60)
    const m = Math.round(mins - h * 60)
    return `há ${h}h${m ? ` ${m}m` : ''}`
  }

  const computeFreshnessFactor = (tuning, aOldestMin) => {
    if (aOldestMin === null) return tuning.freshness.factorStale
    if (aOldestMin <= tuning.freshness.okMaxMin) return tuning.freshness.factorOk
    if (aOldestMin <= tuning.freshness.warnMaxMin) return tuning.freshness.factorWarn
    if (aOldestMin <= tuning.freshness.staleMaxMin) return tuning.freshness.factorStale
    return tuning.freshness.factorVeryStale
  }

  const attachHandlers = () => {
    if (handlersBound) return
    handlersBound = true
    document.addEventListener('click', (ev) => {
      const t = ev && ev.target ? ev.target : null
      const btn = t && typeof t.closest === 'function' ? t.closest('[data-op-mode]') : null
      if (!btn) return
      const next = String(btn.getAttribute('data-op-mode') || '').toLowerCase() === 'conservative' ? 'conservative' : 'normal'
      setMode(next)
      try {
        if (lastInput) render(buildModel(lastInput))
      } catch {
        void 0
      }
    })
  }

  const buildModel = (input) => {
    lastInput = input
    const tuning = getTuning()
    const now = Date.now()

    const regime = input && input.regime ? input.regime : null
    const options = input && input.options ? input.options : null
    const web = input && input.web ? input.web : null
    const foreignFlow = input && input.foreignFlow ? input.foreignFlow : null
    const focus = input && input.focus ? input.focus : null

    const moduleTimes = [
      { key: 'regime', label: 'Regime', ts: toMs(regime && (regime.updatedAt || regime.generatedAt)), ignoreStale: false },
      { key: 'options', label: 'Opções', ts: toMs(options && options.generatedAt), ignoreStale: false },
      { key: 'web', label: 'News', ts: toMs(web && web.generatedAt), ignoreStale: false },
      { key: 'foreign', label: 'Flow', ts: toMs(foreignFlow && foreignFlow.generatedAt), ignoreStale: true },
      { key: 'focus', label: 'Focus', ts: toMs(focus && focus.generatedAt), ignoreStale: true },
    ]

    const candidates = moduleTimes
      .filter((m) => !m.ignoreStale)
      .map((m) => m.ts)
      .filter((x) => typeof x === 'number' && Number.isFinite(x))

    const newest = candidates.length ? Math.max(...candidates) : null
    const oldest = candidates.length ? Math.min(...candidates) : null
    const ageNewestMin = newest ? ageMin(now, newest) : null
    const ageOldestMin = oldest ? ageMin(now, oldest) : null
    const flowAgeMin = (() => {
      const f = moduleTimes.find((m) => m.key === 'foreign')
      return f && f.ts ? ageMin(now, f.ts) : null
    })()
    const focusAgeMin = (() => {
      const f = moduleTimes.find((m) => m.key === 'focus')
      return f && f.ts ? ageMin(now, f.ts) : null
    })()
    const oldestModule = (() => {
      if (!candidates.length) return null
      const oldestTs = oldest
      const hit = moduleTimes.find((m) => m.ts === oldestTs) || null
      const mins = oldestTs ? ageMin(now, oldestTs) : null
      if (!hit) return mins === null ? null : { label: '—', ageMin: mins }
      return { label: hit.label, ageMin: mins }
    })()

    const mode = getMode() || (tuning.conservative.enabledDefault ? 'conservative' : 'normal')
    const freshnessFactor = computeFreshnessFactor(tuning, ageOldestMin)
    const stale = ageOldestMin !== null ? ageOldestMin > tuning.stale.warnMin : false
    const flowDailyStale = flowAgeMin !== null ? flowAgeMin > 36 * 60 : false

    const macroWin = input && input.macroWin ? input.macroWin : { bias: 'neutral', score: 0, parts: [] }
    const macroWdo = input && input.macroWdo ? input.macroWdo : { bias: 'neutral', score: 0, parts: [] }

    const fallbackBias = input && input.fallbackBias ? input.fallbackBias : { win: 'neutral', wdo: 'neutral' }
    const winBias = macroWin.bias !== 'neutral' ? macroWin.bias : fallbackBias.win
    const wdoBias = macroWdo.bias !== 'neutral' ? macroWdo.bias : fallbackBias.wdo

    const plan = winBias === 'buy' && wdoBias === 'sell' ? 'risk_on' : winBias === 'sell' && wdoBias === 'buy' ? 'risk_off' : 'neutral'
    const tone = plan === 'risk_on' ? 'buy' : plan === 'risk_off' ? 'sell' : 'neutral'

    const title = plan === 'risk_on' ? 'HOJE: COMPRA WIN • VENDA WDO' : plan === 'risk_off' ? 'HOJE: VENDA WIN • COMPRA WDO' : 'HOJE: NEUTRO / ESPERAR'
    const planLabel = plan === 'risk_on' ? 'Risk-On (filtro)' : plan === 'risk_off' ? 'Risk-Off (filtro)' : 'Regime indefinido'

    const baseConv = clamp01(regime && typeof regime.convictionScore === 'number' ? regime.convictionScore : tuning.confidence.baseConvictionFallback)
    const mag = clamp01((Math.abs(macroWin.score || 0) + Math.abs(macroWdo.score || 0)) / tuning.confidence.magnitudeDivisor)

    let conf = clamp01((tuning.confidence.mixConviction * baseConv + tuning.confidence.mixMagnitude * mag) * freshnessFactor)

    const missingModules = (regime ? 0 : 1) + (options ? 0 : 1) + (web ? 0 : 1) + (foreignFlow ? 0 : 1)

    let statusWarn = stale

    if (mode === 'conservative') {
      if (stale) conf = clamp01(conf - tuning.conservative.extraStalePenalty)
      if (missingModules > 0) conf = clamp01(conf - missingModules * tuning.conservative.missingPenaltyPerModule)
      conf = Math.max(tuning.conservative.minConfidenceFloor, conf)
      if (tuning.conservative.warnOnAnyMissing && missingModules > 0) statusWarn = true
    }

    const confidenceLabel =
      conf >= tuning.confidence.labelHighMin ? 'Convicção do setup: ALTA' : conf >= tuning.confidence.labelMidMin ? 'Convicção do setup: MÉDIA' : 'Convicção do setup: BAIXA'

    const divergence = (() => {
      if (plan === 'neutral') return { ok: true, reason: 'Regime indefinido' }
      if (winBias !== 'neutral' && winBias === wdoBias) return { ok: true, reason: 'WIN e WDO no mesmo lado' }
      const parts = []
      if (Array.isArray(macroWin.parts)) parts.push(...macroWin.parts)
      if (Array.isArray(macroWdo.parts)) parts.push(...macroWdo.parts)
      const top = parts
        .filter((p) => p && typeof p.val === 'number' && Number.isFinite(p.val))
        .slice()
        .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
        .slice(0, 6)
      const hasPos = top.some((p) => p.val > 0.000001)
      const hasNeg = top.some((p) => p.val < -0.000001)
      if (hasPos && hasNeg) return { ok: true, reason: 'Drivers mistos' }
      return { ok: false, reason: '' }
    })()

    const staleDetail = flowDailyStale
      ? `Flow ${ageText(flowAgeMin)}`
      : oldestModule
        ? `${oldestModule.label} ${ageText(oldestModule.ageMin)}`
        : ageText(ageOldestMin)
    const flowNote = flowAgeMin !== null && flowAgeMin > 60 ? ` • Flow diário (${ageText(flowAgeMin)})` : ''
    const focusNote = focusAgeMin !== null && focusAgeMin > 240 ? ` • Focus semanal (${ageText(focusAgeMin)})` : ''
    if (flowDailyStale) statusWarn = true

    const dataStatus = candidates.length
      ? `Dados ${statusWarn ? 'com atraso' : 'ok'} • ${staleDetail}${mode === 'conservative' ? ' • Conservador' : ''}${flowNote}${focusNote}`
      : `Dados insuficientes${mode === 'conservative' ? ' • Conservador' : ''}`

    const subtitle =
      plan === 'neutral'
        ? 'Se estiver confuso, trate como neutro e reduza o risco.'
        : divergence.ok
          ? `Divergente (${divergence.reason}): reduzir lote e esperar confirmação.`
          : 'Siga o lado de maior probabilidade; divergências = reduzir lote.'

    const drivers = (Array.isArray(macroWin.parts) ? macroWin.parts : [])
      .slice()
      .sort((a, b) => Math.abs(Number((b && b.val) || 0)) - Math.abs(Number((a && a.val) || 0)))
      .slice(0, 3)
      .map((p) => {
        const val = typeof p.val === 'number' && Number.isFinite(p.val) ? p.val : 0
        return { label: String(p.label || '—'), dir: val > 0 ? '↑' : val < 0 ? '↓' : '≈' }
      })

    return {
      title,
      subtitle,
      planLabel: mode === 'conservative' ? `${planLabel} • Modo conservador` : planLabel,
      tone,
      mode,
      confidence: conf,
      confidenceLabel,
      freshnessText: oldestModule
        ? `Atualizado ${ageText(ageNewestMin)} • mais antigo (${flowDailyStale ? 'Flow' : oldestModule.label}) ${ageText(flowDailyStale ? flowAgeMin : oldestModule.ageMin)}`
        : `Atualizado ${ageText(ageNewestMin)} • mais antigo ${ageText(ageOldestMin)}`,
      dataStatus,
      stale: statusWarn,
      staleModule: flowDailyStale ? 'Flow' : oldestModule ? oldestModule.label : null,
      divergent: divergence.ok,
      divergenceReason: divergence.reason,
      drivers,
      tuningVersion: tuning.version,
    }
  }

  const render = (model) => {
    const el = document.getElementById('operationalCompass')
    if (!el) return

    attachHandlers()

    if (!model) {
      el.innerHTML = '<div style="opacity:.86;font-weight:900;letter-spacing:.6px;">Carregando síntese…</div>'
      return
    }

    const pct = Math.round(100 * clamp01(model.confidence))
    const dotCls = model.tone === 'buy' ? 'op-compass__dot--buy' : model.tone === 'sell' ? 'op-compass__dot--sell' : 'op-compass__dot--neutral'
    const titleCls = model.tone === 'buy' ? 'op-compass__title--buy' : model.tone === 'sell' ? 'op-compass__title--sell' : 'op-compass__title--neutral'
    const warnCls = model.stale ? 'op-compass__badge--warn' : ''
    const pinLeft = `${pct}%`

    const badges = (model.drivers || [])
      .slice(0, 3)
      .map((it) => {
        const dir = it && it.dir ? String(it.dir) : '≈'
        const label = it && it.label ? String(it.label) : '—'
        return `<span class="op-compass__badge">${escapeHtml(dir)} ${escapeHtml(label)}</span>`
      })
      .join('')

    const whyBlock = badges ? `<div class="op-compass__why"><span>Por quê (top 3):</span>${badges}</div>` : ''
    const isConservative = model.mode === 'conservative'
    const normalCls = isConservative ? 'op-compass__toggle' : 'op-compass__toggle op-compass__toggle--active'
    const consCls = isConservative ? 'op-compass__toggle op-compass__toggle--active' : 'op-compass__toggle'
    const actionHint =
      model.stale && model.staleModule
        ? `<div style="opacity:.82;font-size:12px;text-align:right;">Ação: atualizar ${escapeHtml(model.staleModule)}</div>`
        : ''
    const divergenceBadge = model.divergent
      ? `<span class="op-compass__badge op-compass__badge--div op-compass__badge--div-inline" title="${escapeHtml(model.divergenceReason || 'Divergente')}">⚠ Divergente</span>`
      : ''

    el.innerHTML = `
      <div class="op-compass__row">
        <div class="op-compass__lhs">
          <span class="op-compass__dot ${dotCls}"></span>
          <div>
            <div class="op-compass__title-row">
              <div class="op-compass__title ${titleCls}">${escapeHtml(model.title || '—')}</div>
              ${divergenceBadge}
            </div>
            <div class="op-compass__subtitle">${escapeHtml(model.subtitle || '')}</div>
          </div>
        </div>
        <div class="op-compass__mid">
          <div class="op-compass__meta">
            <div title="EDGE = força/convicção do setup (não é PnL). É a combinação dos sinais + recência (delay) para dizer quão claro está o lado do dia.">EDGE ${escapeHtml(String(pct))}%</div>
            <small>${escapeHtml(model.confidenceLabel || '—')}${model.planLabel ? ` • ${escapeHtml(model.planLabel)}` : ''}</small>
          </div>
          <div class="op-compass__thermo">
            <div class="op-compass__fill" style="width:${escapeHtml(String(pct))}%;"></div>
            <div class="op-compass__pin" style="left:${escapeHtml(pinLeft)};"></div>
          </div>
          <div class="op-compass__controls" aria-label="Modo de leitura do termômetro">
            <span class="op-compass__controls-label">Modo:</span>
            <button type="button" class="${escapeHtml(normalCls)}" data-op-mode="normal" title="Normal: tolera mais ruído">Normal</button>
            <button type="button" class="${escapeHtml(consCls)}" data-op-mode="conservative" title="Conservador: reduz convicção com atraso/faltas">Conservador</button>
          </div>
        </div>
        <div class="op-compass__rhs">
          <div class="op-compass__clock">⏱️ <span>${escapeHtml(model.freshnessText || '—')}</span></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
            <div class="op-compass__badge ${warnCls}">${escapeHtml(model.dataStatus || '—')}</div>
          </div>
          ${actionHint}
        </div>
      </div>
      ${whyBlock}
    `
  }

  window.OperationalCompass = {
    buildModel,
    render,
    getMode,
    setMode,
    getTuning,
  }
})()
