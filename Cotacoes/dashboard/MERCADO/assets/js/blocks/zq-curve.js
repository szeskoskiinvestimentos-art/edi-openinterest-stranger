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

        const data = (() => {
            try {
                return w.ZQ_CURVE_DATA || null;
            } catch {
                return null;
            }
        })();

        const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

        if (!data || !Array.isArray(data.items) || !data.items.length) {
            el.innerHTML = `
            <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);opacity:.88;">
                Curva ZQ indisponível (zq_curve.js/json).
            </div>
        `;
            return;
        }

        const items = data.items.slice(0, 36);
        const count = typeof data.contractCount === 'number' && Number.isFinite(data.contractCount) ? data.contractCount : data.items.length;
        const slope = typeof data.slopePct === 'number' && Number.isFinite(data.slopePct) ? data.slopePct : null;
        const risk = String(data.riskMode || 'N/D');
        const tone = risk === 'RISK_OFF' ? 'risk_off' : risk === 'RISK_ON' ? 'risk_on' : 'neutral';
        const strength = slope === null ? 0.65 : Math.max(0.40, Math.min(1, Math.abs(slope) / 0.15));

        const first = data.items[0] || null;
        const last = data.items[data.items.length - 1] || null;
        const headLine = (() => {
            const a = first && typeof first.impliedRatePct === 'number' ? first.impliedRatePct : null;
            const b = last && typeof last.impliedRatePct === 'number' ? last.impliedRatePct : null;
            const lo = a !== null ? `${formatNumber(a, 3)}%` : '—';
            const hi = b !== null ? `${formatNumber(b, 3)}%` : '—';
            const sl = slope !== null ? `${formatNumber(slope, 2)}%` : '—';
            return `Curva: curto ${lo} → longo ${hi} • slope ${sl}`;
        })();

        const rowsHtml = items.map(it => {
            const vertex = it && it.vertex ? String(it.vertex) : '—';
            const exp = it && it.expirationFmt ? String(it.expirationFmt) : '—';
            const px = it && typeof it.lastPrice === 'number' ? formatNumber(it.lastPrice, 4) : '—';
            const rate = it && typeof it.impliedRatePct === 'number' ? `${formatNumber(it.impliedRatePct, 3)}%` : '—';
            const dayPct = it && typeof it.dayChangePct === 'number' && Number.isFinite(it.dayChangePct) ? formatPercent(it.dayChangePct, 2) : '—';
            return `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(vertex)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${escapeHtml(exp)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(px)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(rate)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${escapeHtml(dayPct)}</td>
            </tr>
        `;
        }).join('');

        el.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;">Curva Fed Funds (ZQ)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(tone, `Regime: ${risk}`, strength)}
                    ${badge('neutral', `Contratos: ${String(count)}`, 0.55)}
                </div>
            </div>
            <div style="margin-top:8px;opacity:.86;font-size:12px;line-height:1.35;">
                ${escapeHtml(headLine)}
            </div>
            <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.10);padding-top:10px;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Vértice</th>
                            <th style="text-align:left;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Venc.</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Preço</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Juro Implícito</th>
                            <th style="text-align:right;padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.12);opacity:.85;">Δ% dia</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
            <div style="margin-top:10px;opacity:.72;font-size:12px;">
                Fórmula: <span style="font-family:'Share Tech Mono',monospace;">100 - preço</span> • Atualizado em ${escapeHtml(formatDateTime(data.generatedAt || ''))}
            </div>
        </div>
    `;
    }

    root.zqCurve = { render };
    w.MercadoBlocks = root;
})();
