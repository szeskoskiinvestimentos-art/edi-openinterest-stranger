(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};

        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const toneBadgeHtml = d.toneBadgeHtml;
        const toneBadgeHtmlFromTone = d.toneBadgeHtmlFromTone;

        const findAssetSymbol = d.findAssetSymbol;
        const findAliasSymbol = d.findAliasSymbol;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const pointPct = d.pointPct;

        if (typeof escapeHtml !== 'function'
            || typeof formatNumber !== 'function'
            || typeof formatPercent !== 'function'
            || typeof toneBadgeHtml !== 'function'
            || typeof toneBadgeHtmlFromTone !== 'function'
            || typeof findAssetSymbol !== 'function'
            || typeof findAliasSymbol !== 'function'
            || typeof getLastPoint !== 'function'
            || typeof getMostRecentPointWithPrice !== 'function'
            || typeof pointPct !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const pad2 = n => String(n).padStart(2, '0');
        const toBrtDateKey = ms => {
            const shifted = ms - 180 * 60 * 1000;
            const dt = new Date(shifted);
            return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
        };
        const pointMs = p => {
            const t = p && p.t ? Date.parse(p.t) : NaN;
            return Number.isFinite(t) ? t : 0;
        };

        const sym = {
            idx: findAssetSymbol(data, /^WINc1$/i) || findAssetSymbol(data, /^WIN\b/i) || findAssetSymbol(data, /^\.BVSP$/i),
            iron: findAssetSymbol(data, /^DCE_I0$/i),
            copper: findAliasSymbol(data, 'COPPER'),
        };

        const calcSessionPct = symbol => {
            if (!symbol) return null;
            const series = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
            if (!Array.isArray(series) || !series.length) return null;
            const last = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
            if (!last || typeof last.price !== 'number' || !Number.isFinite(last.price)) return null;
            const lastMs = pointMs(last);
            const dayKey = toBrtDateKey(lastMs);

            let base = null;
            let baseMs = Infinity;
            for (const p of series) {
                if (!p || typeof p.price !== 'number' || !Number.isFinite(p.price)) continue;
                const ms = pointMs(p);
                if (!ms) continue;
                if (toBrtDateKey(ms) !== dayKey) continue;
                if (ms < baseMs) {
                    baseMs = ms;
                    base = p;
                }
            }

            const basePrice = base && typeof base.price === 'number' && Number.isFinite(base.price) ? base.price : null;
            const computed = basePrice && basePrice !== 0 ? ((last.price - basePrice) / basePrice) * 100 : null;
            const fallback = pointPct(last);
            const pct = typeof computed === 'number' && Number.isFinite(computed) && (basePrice === null || basePrice !== last.price) ? computed : fallback ?? computed;

            return {
                pct: typeof pct === 'number' && Number.isFinite(pct) ? pct : null,
                last,
                base,
                basePrice,
            };
        };

        const calcPrevClose = symbol => {
            if (!symbol) return null;
            const series = (data && data.series && data.series[symbol]) ? data.series[symbol] : [];
            const last = getMostRecentPointWithPrice(data, symbol) || getLastPoint(data, symbol);
            if (!last || typeof last.price !== 'number' || !Number.isFinite(last.price)) return null;
            const lastMs = pointMs(last);
            const lastKey = toBrtDateKey(lastMs);

            let prev = null;
            let prevMs = -Infinity;
            for (const p of series) {
                if (!p || typeof p.price !== 'number' || !Number.isFinite(p.price)) continue;
                const ms = pointMs(p);
                if (!ms) continue;
                const key = toBrtDateKey(ms);
                if (key >= lastKey) continue;
                if (ms > prevMs) {
                    prevMs = ms;
                    prev = p;
                }
            }

            if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price)) {
                return { price: prev.price, t: prev.t || null, source: 'série' };
            }

            const lastPct = pointPct(last);
            if (typeof lastPct === 'number' && Number.isFinite(lastPct) && lastPct !== -100) {
                const denom = 1 + (lastPct / 100);
                if (denom !== 0) {
                    const implied = last.price / denom;
                    if (Number.isFinite(implied) && implied > 0) return { price: implied, t: null, source: 'implícito' };
                }
            }

            if (typeof last.change === 'number' && Number.isFinite(last.change)) {
                const implied = last.price - last.change;
                if (Number.isFinite(implied) && implied > 0) return { price: implied, t: null, source: 'implícito' };
            }

            return { price: last.price, t: last.t || null, source: 'último' };
        };

        const iron = calcSessionPct(sym.iron);
        const copper = calcSessionPct(sym.copper);
        const idxLast = sym.idx ? (getMostRecentPointWithPrice(data, sym.idx) || getLastPoint(data, sym.idx)) : null;
        const prevClose = calcPrevClose(sym.idx);

        const ironPct = iron ? iron.pct : null;
        const copperPct = copper ? copper.pct : null;
        const zonePct = (typeof ironPct === 'number' && typeof copperPct === 'number')
            ? (ironPct - copperPct) / 2
            : null;
        const absZone = typeof zonePct === 'number' && Number.isFinite(zonePct) ? Math.abs(zonePct) : null;
        const prev = prevClose && typeof prevClose.price === 'number' && Number.isFinite(prevClose.price) ? prevClose.price : null;

        const pts = (typeof prev === 'number' && typeof absZone === 'number') ? (prev * absZone / 100) : null;
        const low = (typeof prev === 'number' && typeof absZone === 'number') ? (prev * (1 - absZone / 100)) : null;
        const high = (typeof prev === 'number' && typeof absZone === 'number') ? (prev * (1 + absZone / 100)) : null;

        const zoneTone = (() => {
            if (typeof absZone !== 'number' || !Number.isFinite(absZone)) return 'neutral';
            if (absZone >= 0.7) return 'negative';
            if (absZone >= 0.35) return 'neutral';
            return 'positive';
        })();

        const badge = (tone, valAbs, txt, maxAbs = 2) => toneBadgeHtmlFromTone(tone, typeof valAbs === 'number' ? Math.abs(valAbs) : 0, txt, { maxAbs });
        const pctBadge = v => (typeof v === 'number' && Number.isFinite(v))
            ? toneBadgeHtml(v, formatPercent(v, 2), { maxAbs: 3 })
            : escapeHtml('—');

        const idxName = sym.idx ? ((data.assets || []).find(a => String(a.symbol) === String(sym.idx))?.name || sym.idx) : '—';
        const idxSpot = idxLast && typeof idxLast.price === 'number' ? idxLast.price : null;
        const idxSpotTxt = typeof idxSpot === 'number' ? formatNumber(idxSpot, 0) : '—';

        const ironLabel = sym.iron ? ((data.assets || []).find(a => String(a.symbol) === String(sym.iron))?.name || 'Minério (Dalian)') : 'Minério (Dalian)';
        const copperLabel = sym.copper ? ((data.assets || []).find(a => String(a.symbol) === String(sym.copper))?.name || 'Cobre') : 'Cobre';

        const html = `
        <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Zona de Metais • ${escapeHtml(String(idxName))}</div>
                <div style="display:flex;gap:10px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                    <span>${badge(zoneTone, absZone, absZone === null ? '—' : `±${formatNumber(absZone, 2)}%`, 1)}</span>
                    <span style="opacity:.85;">Spot ${escapeHtml(idxSpotTxt)}</span>
                </div>
            </div>
            <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;margin-bottom:8px;">Inputs (Metais)</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(ironLabel)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(sym.iron || 'N/A')}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:90px;text-align:right;">${pctBadge(ironPct)}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(copperLabel)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(sym.copper || 'N/A')}</div>
                        </div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;min-width:90px;text-align:right;">${pctBadge(copperPct)}</div>
                    </div>
                    <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">
                        Regra: (Minério − Cobre) ÷ 2 = % da zona.
                    </div>
                </div>

                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;margin-bottom:8px;">Cálculo</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">% Zona</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${absZone === null ? '—' : `±${formatNumber(absZone, 2)}%`}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">Amplitude (pts)</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${typeof pts === 'number' ? formatNumber(pts, 0) : '—'}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;">
                        <div style="opacity:.9;font-weight:900;">Base (fechamento ant.)</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${prevClose && typeof prevClose.price === 'number' ? `${formatNumber(prevClose.price, 0)} (${escapeHtml(prevClose.source)})` : '—'}</div>
                    </div>
                    <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">
                        Uso típico: com metais divergindo, o índice tende a respeitar as pontas do range mais vezes do que “esticar” tendência.
                    </div>
                </div>

                <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:12px;background:rgba(0,0,0,.12);">
                    <div style="font-weight:900;letter-spacing:.8px;opacity:.92;margin-bottom:8px;">Níveis Projetados</div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">LOW</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${typeof low === 'number' ? formatNumber(low, 0) : '—'}</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:6px 0;">
                        <div style="opacity:.9;font-weight:900;">HIGH</div>
                        <div style="font-family:'Share Tech Mono',monospace;font-weight:900;">${typeof high === 'number' ? formatNumber(high, 0) : '—'}</div>
                    </div>
                    <div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.45;">
                        Operacional: se abrir no meio do range, tende a ser “vucu vucu”; priorize buscar as pontas e reduzir no primeiro alvo.
                    </div>
                </div>
            </div>
        </div>
    `;

        el.innerHTML = html;
    }

    root.metalsZone = { render };
    w.MercadoBlocks = root;
})();
