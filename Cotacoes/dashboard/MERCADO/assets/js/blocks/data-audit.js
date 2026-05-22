(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatDateTime = d.formatDateTime;
        const symbolKey = d.symbolKey;
        const getLastPoint = d.getLastPoint;
        const findAssetSymbol = d.findAssetSymbol;

        const assets = (data && Array.isArray(data.assets)) ? data.assets : [];
        const nowMs = Date.now();
        const rows = assets.map(a => ({ a, last: (typeof getLastPoint === 'function' ? getLastPoint(data, a && a.symbol) : null) }));
        const withPrice = rows.filter(x => x.last && typeof x.last.price === 'number');
        const missing = rows.filter(x => !(x.last && typeof x.last.price === 'number'));
        const withTime = withPrice
            .map(x => {
                const t = x.last && x.last.t ? Date.parse(String(x.last.t)) : NaN;
                return { ...x, tMs: Number.isFinite(t) ? t : null };
            })
            .filter(x => x.tMs !== null);

        const staleMs = 6 * 60 * 60 * 1000;
        const fresh = withTime.filter(x => nowMs - x.tMs <= staleMs);
        const stale = withTime
            .filter(x => nowMs - x.tMs > staleMs)
            .map(x => ({ ...x, ageMs: nowMs - x.tMs }))
            .sort((a, b) => b.ageMs - a.ageMs)
            .slice(0, 12);

        const fmtAge = ms => {
            const m = Math.floor(ms / 60000);
            const h = Math.floor(m / 60);
            const mm = m - h * 60;
            return h > 0 ? `${h}h${String(mm).padStart(2, '0')}` : `${m}m`;
        };

        const critical = [
            { label: 'USD/BRL', r: /^USD\/BRL\b/i },
            { label: 'WDO', r: /^WDO/i },
            { label: 'WIN', r: /^WIN/i },
            { label: 'IBOV', r: /(^\.BVSP$|\bIbovespa\b)/i },
            { label: 'EWZ', r: /^EWZ$/i },
            { label: 'BOVA11', r: /^BOVA11\.SA$/i },
            { label: 'DXY', r: /(^\.DXY$|\bDXY\b)/i },
            { label: 'Brent', r: /\bBrent\b/i },
            { label: 'WTI', r: /\bWTI\b/i },
            { label: 'FXI', r: /^FXI$/i },
            { label: 'CSI300', r: /^\.(CSI300)\b/i },
            { label: 'Minério', r: /^TIOc1$|^SM58Fc1$/i },
            { label: 'Soja', r: /^ZS$/i },
            { label: 'BR10Y', r: /^BR10YT=RR$/i },
        ].map(x => ({ ...x, found: !!(typeof findAssetSymbol === 'function' ? findAssetSymbol(data, x.r) : null) }));

        const chips = critical
            .map(x => {
                const tone = x.found ? 'rgba(0,255,160,.18)' : 'rgba(255,60,80,.18)';
                const border = x.found ? 'rgba(0,255,160,.35)' : 'rgba(255,60,80,.35)';
                const color = x.found ? 'rgba(0,255,160,.95)' : 'rgba(255,60,80,.95)';
                return `<span style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid ${border};background:${tone};color:${color};font-weight:900;letter-spacing:1px;">
                    ${escapeHtml(x.label)} ${x.found ? '✓' : '✕'}
                </span>`;
            })
            .join(' ');

        const staleRows = stale
            .map(x => `<tr>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.9;">${escapeHtml((typeof symbolKey === 'function' ? symbolKey(x.a && x.a.symbol) : '') || (x.a && x.a.symbol) || '')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml((x.a && x.a.name) || '')}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${escapeHtml(fmtAge(x.ageMs))}</td>
                <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;opacity:.9;">${escapeHtml(x.last && x.last.t ? formatDateTime(x.last.t) : '—')}</td>
            </tr>`)
            .join('');

        el.innerHTML = `
            <div class="metrics-grid" style="margin:0;">
                <div class="metric-card">
                    <div class="metric-icon">🧭</div>
                    <div class="metric-value">${escapeHtml(String(assets.length))}</div>
                    <div class="metric-label">Ativos</div>
                    <div class="metric-change neutral">monitorados</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">✅</div>
                    <div class="metric-value">${escapeHtml(String(withPrice.length))}</div>
                    <div class="metric-label">Com preço</div>
                    <div class="metric-change neutral">${escapeHtml(formatNumber((assets.length ? (withPrice.length / assets.length) * 100 : 0), 0))}%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⏱️</div>
                    <div class="metric-value">${escapeHtml(String(fresh.length))}</div>
                    <div class="metric-label">Atualizados (&lt;6h)</div>
                    <div class="metric-change neutral">${escapeHtml(formatNumber((withTime.length ? (fresh.length / withTime.length) * 100 : 0), 0))}%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⚠️</div>
                    <div class="metric-value">${escapeHtml(String(missing.length))}</div>
                    <div class="metric-label">Sem preço</div>
                    <div class="metric-change neutral">${escapeHtml(formatNumber((assets.length ? (missing.length / assets.length) * 100 : 0), 0))}%</div>
                </div>
            </div>

            <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Críticos</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;line-height:1.6;">${chips}</div>
            </div>

            <div style="margin-top:14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;margin-bottom:8px;">Mais desatualizados</div>
                <table class="data-table" style="width:100%;border-collapse:collapse;table-layout:auto;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:120px;width:1%;">Símbolo</th>
                            <th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);">Ativo</th>
                            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:90px;width:1%;">Idade</th>
                            <th style="text-align:right;padding:10px;border-bottom:1px solid rgba(255,255,255,.15);min-width:160px;width:1%;">Atualização</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${staleRows || `<tr><td colspan="4" style="padding:12px;opacity:.85;">Nenhum item está &gt; 6h (ou sem timestamps).</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;
    }

    root.dataAudit = { render };
    w.MercadoBlocks = root;
})();

