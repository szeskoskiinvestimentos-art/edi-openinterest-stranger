(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const pillHtml = d.pillHtml;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const escapeHtml = d.escapeHtml;
        const formatDateTime = d.formatDateTime;
        const loadScriptFresh = d.loadScriptFresh;
        const fetchJsonWithTimeout = d.fetchJsonWithTimeout;

        if (!w.__usTsyFuturesLoadStarted) {
            try { w.__usTsyFuturesLoadStarted = false; } catch { }
        }

        const data = (() => {
            try {
                return w.US_TSY_FUTURES_DATA || null;
            } catch {
                return null;
            }
        })();

        const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

        if (!data) {
            el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Carregando Treasuries (futuros)…
            </div>
        `;
            try {
                if (!w.__usTsyFuturesLoadStarted) {
                    w.__usTsyFuturesLoadStarted = true;
                    loadScriptFresh('assets/data/us_tsy_futures.js')
                        .then(() => {
                            try { render({ el, deps }); } catch { }
                        })
                        .catch(() => {
                            fetchJsonWithTimeout(`assets/data/us_tsy_futures.json?ts=${Date.now()}`, 1600)
                                .then((payload) => {
                                    try { w.US_TSY_FUTURES_DATA = payload; } catch { }
                                    try { render({ el, deps }); } catch { }
                                })
                                .catch(() => {
                                    try { w.US_TSY_FUTURES_DATA = null; } catch { }
                                    try {
                                        el.innerHTML = `
                                        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                                            Treasuries (futuros) indisponível (us_tsy_futures.json).
                                        </div>
                                    `;
                                    } catch { }
                                });
                        });
                }
            } catch { }
            return;
        }

        const itemsAll = Array.isArray(data.items) ? data.items : [];
        const items = itemsAll.slice(0, 20);
        const extras = Array.isArray(data.extras) ? data.extras.slice(0, 24) : [];
        const credit = data && data.creditVsTreasury ? data.creditVsTreasury : null;
        if (!items.length && !extras.length) {
            el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Treasuries (futuros) indisponível (us_tsy_futures).
            </div>
        `;
            return;
        }
        const risk = String(data.riskMode || 'N/D');
        const shape = String(data.shape || 'N/D');
        const avg = typeof data.avgChangePct === 'number' && Number.isFinite(data.avgChangePct) ? data.avgChangePct : null;
        const slope = typeof data.slopeChangePct === 'number' && Number.isFinite(data.slopeChangePct) ? data.slopeChangePct : null;
        const riskTone = risk === 'RISK_OFF' ? 'risk_off' : risk === 'RISK_ON' ? 'risk_on' : 'neutral';
        const riskStrength = slope === null ? 0.65 : Math.max(0.40, Math.min(1, Math.abs(slope) / 0.6));

        const headLine = (() => {
            const a = avg !== null ? formatPercent(avg, 2) : '—';
            const s = slope !== null ? formatPercent(slope, 2) : '—';
            return `Movimento médio (dia): ${a} • Inclinação (30Y−2Y, Δ%): ${s} • Shape: ${shape}`;
        })();

        const rowsHtml = items.map(it => {
            const tenor = it && it.tenor ? String(it.tenor) : '—';
            const vertex = it && it.vertex ? String(it.vertex) : '—';
            const exp = it && it.expirationFmt ? String(it.expirationFmt) : '—';
            const px = it && typeof it.lastPrice === 'number' ? formatNumber(it.lastPrice, 4) : '—';
            const dayPct = it && typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? formatPercent(it.dayChangePct, 2) : '—';
            return `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${escapeHtml(tenor)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(vertex)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${escapeHtml(exp)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(px)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(dayPct)}</td>
            </tr>
        `;
        }).join('');

        const extrasHtml = extras.length ? `
        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
            <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">Extras (ETFs/Crédito)</div>
            <div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;">
                ${extras.map(x => {
                    const label = x && x.label ? String(x.label) : '—';
                    const symbol = x && x.symbol ? String(x.symbol) : '';
                    const px = x && typeof x.lastPrice === 'number' ? formatNumber(x.lastPrice, 2) : '—';
                    const dayPct = x && typeof x.dayChangePct === 'number' && Number.isFinite(x.dayChangePct) ? formatPercent(x.dayChangePct, 2) : '—';
                    const tone = typeof x.dayChangePct === 'number' && Number.isFinite(x.dayChangePct) ? (x.dayChangePct > 0.12 ? 'risk_on' : x.dayChangePct < -0.12 ? 'risk_off' : 'neutral') : 'neutral';
                    const strength = typeof x.dayChangePct === 'number' && Number.isFinite(x.dayChangePct) ? Math.max(0.40, Math.min(1, Math.abs(x.dayChangePct) / 0.6)) : 0.55;
                    const right = `${escapeHtml(px)} • ${escapeHtml(dayPct)}`;
                    return `
                    <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:rgba(0,0,0,.14);">
                        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                            <div style="min-width:0;">
                                <div style="font-weight:900;letter-spacing:.5px;opacity:.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(label)}</div>
                                <div style="opacity:.75;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(symbol)}</div>
                            </div>
                            <div style="text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;white-space:nowrap;">
                                ${badge(tone, right, strength)}
                            </div>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        </div>
    ` : '';

        const futuresHtml = items.length ? `
        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Tenor</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Vértice</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Venc.</th>
                        <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Preço</th>
                        <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% dia</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>
    ` : '';

        const creditHtml = credit ? (() => {
            const line = credit && credit.line ? String(credit.line) : '';
            const mode = credit && credit.mode ? String(credit.mode) : '';
            const score = typeof credit.score === 'number' && Number.isFinite(credit.score) ? credit.score : null;
            const tone = score === null ? 'neutral' : score > 0.12 ? 'risk_on' : score < -0.12 ? 'risk_off' : 'neutral';
            const strength = score === null ? 0.55 : Math.max(0.40, Math.min(1, Math.abs(score) / 0.6));
            const pills = credit && Array.isArray(credit.pills) ? credit.pills.slice(0, 6).map(p => badge('neutral', String(p || ''), 0.55)).join('') : '';
            return `
            <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="opacity:.92;font-weight:900;letter-spacing:.6px;">Crédito vs Treasury (proxy)</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(tone, `Modo: ${mode}`, strength)}
                    </div>
                </div>
                <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                    ${escapeHtml(line)}
                </div>
                ${pills ? `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">${pills}</div>` : ''}
                <div style="margin-top:8px;opacity:.72;font-size:12px;">
                    Interpretação: score > 0 sugere crédito mais forte que TLT (mais RISK ON). Score < 0 sugere TLT mais forte (flight-to-quality). Score combina Δ% + range intraday.
                </div>
            </div>
        `;
        })() : '';

        el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">Treasuries (futuros)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(riskTone, `Regime: ${risk}`, riskStrength)}
                    ${badge('neutral', `Contratos: ${String(items.length)}`, 0.55)}
                    ${extras.length ? badge('neutral', `Extras: ${String(extras.length)}`, 0.55) : ''}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(headLine)}
            </div>
            ${futuresHtml}
            ${creditHtml}
            ${extrasHtml}
            <div style="margin-top:10px;opacity:.72;font-size:12px;">
                Fonte: Yahoo (futuresChain + spark) • Atualizado em ${escapeHtml(formatDateTime(data.generatedAt || ''))}
            </div>
        </div>
    `;
    }

    root.usTreasuryFutures = { render };
    w.MercadoBlocks = root;
})();
