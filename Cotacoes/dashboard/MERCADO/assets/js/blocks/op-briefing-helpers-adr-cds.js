function opBriefing_computeAdrPremarketHtml({
    data,
    operationalTuning,
    getLastPoint,
    getMostRecentPointWithPrice,
    pointPct,
    isBrazilAdr,
    formatPercent,
    escapeHtml,
}) {
    const now = new Date();
    const isNum = v => typeof v === 'number' && Number.isFinite(v);
    const assets = data && Array.isArray(data.assets) ? data.assets : [];
    const isRecentPremarketSnapshot = asOf => {
        if (!(asOf instanceof Date) || !Number.isFinite(asOf.getTime())) return false;
        const ageMs = now.getTime() - asOf.getTime();
        const maxAgeMs = 20 * 60 * 60 * 1000;
        return ageMs >= -2 * 60 * 1000 && ageMs <= maxAgeMs;
    };

    const baseAdrKey = (symbol) => {
        const s = String(symbol || '').trim().toUpperCase();
        const base = s.replace(/\..*$/, '');
        if (/^PBR/.test(base)) return 'PBR';
        if (/^VALE/.test(base)) return 'VALE';
        if (/^ITUB/.test(base)) return 'ITUB';
        if (/^BBD/.test(base)) return 'BBD';
        if (/^ABEV/.test(base)) return 'ABEV';
        if (/^BSBR/.test(base)) return 'BSBR';
        if (/^NU/.test(base)) return 'NU';
        if (/^STNE/.test(base)) return 'STNE';
        if (/^SUZ/.test(base)) return 'SUZ';
        if (/^GGB/.test(base)) return 'GGB';
        if (/^SID/.test(base)) return 'SID';
        return base;
    };

    const defaultWeights = {
        VALE: 0.22,
        PBR: 0.20,
        ITUB: 0.14,
        BBD: 0.10,
        ABEV: 0.10,
        NU: 0.08,
        BSBR: 0.06,
        STNE: 0.04,
        SUZ: 0.03,
        GGB: 0.03,
    };

    const loadWeights = () => {
        let custom = null;
        try {
            const raw = localStorage.getItem('mercado_adr_br_weights');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') custom = parsed;
            }
        } catch {
        }
        const out = {};
        const src = custom || defaultWeights;
        for (const k of Object.keys(src || {})) {
            const v = src[k];
            const kk = String(k || '').trim().toUpperCase();
            if (!kk) continue;
            if (!isNum(v) || v <= 0) continue;
            out[kk] = v;
        }
        return out;
    };

    const weights = loadWeights();
    const weightsTotal = Object.values(weights).reduce((a, b) => a + (isNum(b) ? b : 0), 0);

    const rows = assets.map(a => {
        const last = (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, a.symbol) : null) || getLastPoint(data, a.symbol);
        const asOfVal = last && (last.asOf || last.t) ? (last.asOf || last.t) : null;
        const tMs = asOfVal ? Date.parse(asOfVal) : NaN;
        const asOf = Number.isFinite(tMs) ? new Date(tMs) : null;
        const pct = pointPct(last);
        const adrKey = baseAdrKey(a.symbol);
        const w = isNum(weights[adrKey]) ? weights[adrKey] : null;
        return { symbol: a.symbol, name: a.name, last, pct, asOf, adrKey, w, isAdr: isBrazilAdr({ symbol: a.symbol, name: a.name }) };
    }).filter(r => r.isAdr && r.pct !== null && r.asOf && isRecentPremarketSnapshot(r.asOf));
    if (!rows.length) return '';

    const weightedRows = rows.filter(r => isNum(r.w) && r.w > 0);
    const coveredWeight = weightedRows.reduce((s, r) => s + (r.w || 0), 0);
    const coveragePct = weightsTotal > 0 ? Math.max(0, Math.min(1, coveredWeight / weightsTotal)) : 0;

    const ups = rows.filter(r => r.pct > 0);
    const downs = rows.filter(r => r.pct < 0);
    const avg = rows.length ? rows.reduce((s, r) => s + r.pct, 0) / rows.length : 0;
    const wAvg = coveredWeight > 0 ? weightedRows.reduce((s, r) => s + (r.w || 0) * r.pct, 0) / coveredWeight : null;
    const th = operationalTuning && operationalTuning.threshold && typeof operationalTuning.threshold.export === 'number' && Number.isFinite(operationalTuning.threshold.export)
        ? operationalTuning.threshold.export
        : 0.25;
    const basis = (wAvg !== null ? wAvg : avg);
    const bias = basis > th ? 'ALTISTA' : basis < -th ? 'BAIXISTA' : 'NEUTRO';
    const top = (weightedRows.length ? weightedRows : rows)
        .slice()
        .sort((a, b) => {
            const ac = (typeof a.w === 'number' ? a.w : 1) * a.pct;
            const bc = (typeof b.w === 'number' ? b.w : 1) * b.pct;
            return Math.abs(bc) - Math.abs(ac);
        })
        .slice(0, 6);
    const toneColor = basis > 0 ? 'rgba(0,255,160,.95)' : basis < 0 ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
    const deg = Math.round(Math.max(-1, Math.min(1, basis / 0.6)) * 60);
    const gauge = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:110px;height:60px;border:1px solid rgba(255,255,255,.18);border-radius:110px 110px 0 0;background:rgba(0,0,0,.22);position:relative;overflow:hidden;box-shadow:${basis > 0 ? '0 0 18px rgba(0,255,160,.35)' : basis < 0 ? '0 0 18px rgba(255,60,80,.35)' : '0 0 18px rgba(255,210,74,.28)'};">
                        <div style="position:absolute;left:8px;right:8px;bottom:8px;height:12px;border-radius:999px;background:linear-gradient(90deg, rgba(255,60,80,.85) 0%, rgba(255,210,74,.85) 50%, rgba(0,255,160,.85) 100%);opacity:.85;"></div>
                        <div style="position:absolute;left:50%;bottom:8px;width:3px;height:46px;background:${toneColor};transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);box-shadow:0 0 14px rgba(255,255,255,.22);border-radius:3px;"></div>
                    </div>
                    <div style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.6px;">ADR BR • ${bias} • ${formatPercent(basis, 2)}${wAvg !== null ? ` • peso ${Math.round(coveragePct * 100)}%` : ''}</div>
                </div>
            `;
    const list = top.map(r => {
        const pct = r.pct;
        const weightTxt = typeof r.w === 'number' && Number.isFinite(r.w) ? `${Math.round(r.w * 100)}%` : '';
        const contrib = typeof r.w === 'number' && Number.isFinite(r.w) ? r.w * pct : null;
        const c = pct > 0 ? 'rgba(0,255,160,.95)' : pct < 0 ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
        return `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border:1px solid rgba(255,255,255,.10);border-radius:9px;background:rgba(0,0,0,.16);">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:8px;height:8px;border-radius:999px;background:${c};"></div>
                            <div style="font-weight:700;letter-spacing:.5px;opacity:.92;">${escapeHtml(r.adrKey || r.name || r.symbol)}${weightTxt ? ` <span style="opacity:.7;">(${escapeHtml(weightTxt)})</span>` : ''}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;display:flex;gap:10px;align-items:center;">
                            ${contrib !== null ? `<span style="opacity:.75;">${formatPercent(contrib, 2)}</span>` : ''}
                            <span>${formatPercent(pct, 2)}</span>
                        </div>
                    </div>
                `;
    }).join('');
    return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">ADR BR (Extended Hours)</div>
                        <div style="opacity:.86;font-size:12px;">${ups.length} ↑ • ${downs.length} ↓ • ${rows.length} total${wAvg !== null ? ` • cobertura peso ${Math.round(coveragePct * 100)}%` : ''}</div>
                    </div>
                    <div style="margin-top:8px;">${gauge}</div>
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;">${list}</div>
                </div>
            `;
}

function opBriefing_computeCdsSignalCardHtml({
    cdsSignal,
    escapeHtml,
    toneBadgeHtmlFromTone,
    formatNumber,
}) {
    if (!cdsSignal) return '';
    if (cdsSignal.mode === 'neutral') return '';
    const tone = cdsSignal.tone;
    const title = 'CDS Brasil: fluxo x hedge';
    const op = cdsSignal.mode === 'hedge_on_risk_on'
        ? 'Leitura: proteção subindo sem “desmontar Brasil” (possível compra de risco com hedge). Operacional: manter viés do regime, mas exigir confirmação e usar stops/hedge.'
        : cdsSignal.mode === 'risk_off_classic'
            ? 'Leitura: proteção subindo com BRL enfraquecendo e bolsa caindo (risk-off clássico). Operacional: reduzir risco e priorizar proteção.'
            : cdsSignal.mode === 'relief_risk_on'
                ? 'Leitura: melhora de risco (CDS↓) com BRL fortalecendo e bolsa subindo. Operacional: favorece risco (desde que o regime confirme).'
                : 'Leitura: CDS sinaliza movimento sem confirmação completa. Operacional: tratar como cautela.';
    return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${escapeHtml(title)}</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${toneBadgeHtmlFromTone(tone, cdsSignal.confidence, `${formatNumber(cdsSignal.confidence * 100, 0)}%`, { maxAbs: 1 })}</div>
                    </div>
                    <div style="margin-top:8px;font-weight:900;">${toneBadgeHtmlFromTone(tone, 0, cdsSignal.label, { maxAbs: 1 })}</div>
                    <div style="margin-top:8px;opacity:.86;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(cdsSignal.detail)}</div>
                    <div style="margin-top:8px;opacity:.92;line-height:1.35;">${escapeHtml(op)}</div>
                </div>
            `;
}
