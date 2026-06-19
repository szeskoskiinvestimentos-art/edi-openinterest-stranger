function opBriefing_computeFocusSummaryHtml({
    rawFocus,
    data,
    diSignal,
    findAliasSymbolBest,
    findAliasSymbol,
    findAssetSymbol,
    getMostRecentPointWithPrice,
    getLastPoint,
    badge,
    escapeHtml,
    formatNumber,
    formatDateTimeLoose,
    toneBadgeHtmlFromTone,
}) {
    const raw = rawFocus || null;
    if (!raw) return '';
    const ok = raw && raw.ok === true;
    const msg = raw && raw.message ? String(raw.message) : 'Indisponível.';
    const pageUrl = raw && raw.source && raw.source.pageUrl ? String(raw.source.pageUrl) : 'https://www.bcb.gov.br/publicacoes/focus';
    const pdfUrl = raw && raw.source && raw.source.pdfUrl ? String(raw.source.pdfUrl) : '';
    const cutoffDate = raw && raw.source && raw.source.cutoffDate ? String(raw.source.cutoffDate) : '';
    const publishedAt = raw && raw.source && raw.source.publishedAt ? String(raw.source.publishedAt) : '';
    const datasetUrl = raw && raw.source && raw.source.datasetUrl ? String(raw.source.datasetUrl) : '';
    const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
    const fmt4 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 4) : '—');
    const dTone = (k, d) => {
        if (!(typeof d === 'number' && Number.isFinite(d)) || d === 0) return 'neutral';
        if (k === 'pib') return d > 0 ? 'positive' : 'negative';
        return d > 0 ? 'negative' : 'positive';
    };
    const dTxt = d => (typeof d === 'number' && Number.isFinite(d) && d !== 0 ? `${d > 0 ? '+' : ''}${fmt2(d)}` : '0.00');
    const line = (label, k, p, fmtVal) => {
        const med = p && typeof p.mediana === 'number' ? p.mediana : null;
        const d = p && typeof p.deltaMediana === 'number' ? p.deltaMediana : null;
        const t = dTone(k, d);
        const deltaBadge = toneBadgeHtmlFromTone(t, d || 0, `Δ ${dTxt(d)}`, { maxAbs: 2 });
        return `
                    <div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);">
                        <div style="opacity:.9;font-weight:900;">${escapeHtml(label)}</div>
                        <div style="display:flex;gap:8px;align-items:center;font-family:'Share Tech Mono',monospace;font-weight:900;">
                            <span style="opacity:.95;">${escapeHtml(fmtVal(med))}</span>
                            ${deltaBadge}
                        </div>
                    </div>
                `;
    };
    if (!ok) {
        return `
                    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                            <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🧩 Boletim Focus (BCB)</div>
                            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                                ${publishedAt ? badge('neutral', `Publicado: ${formatDateTimeLoose(publishedAt)}`) : ''}
                                ${cutoffDate ? badge('neutral', `Corte: ${cutoffDate}`) : ''}
                                <a href="${escapeHtml(pageUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">página</a>
                                ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">pdf</a>` : ''}
                            </div>
                        </div>
                        <div style="margin-top:8px;opacity:.88;line-height:1.35;">${escapeHtml(msg)}</div>
                    </div>
                `;
    }
    const refYear = raw && raw.derived && raw.derived.referenceYear ? String(raw.derived.referenceYear) : '';
    const yearKeys = (() => {
        const start = /^\d{4}$/.test(refYear) ? Number(refYear) : NaN;
        if (Number.isFinite(start)) return [start, start + 1, start + 2, start + 3].map(y => String(y));
        const ys = raw && raw.years && typeof raw.years === 'object' ? Object.keys(raw.years) : [];
        return ys.filter(y => /^\d{4}$/.test(y)).sort().slice(0, 4);
    })();
    const bias = raw && raw.derived && raw.derived.bias ? String(raw.derived.bias) : 'mixed';
    const score = raw && raw.derived && typeof raw.derived.score === 'number' && Number.isFinite(raw.derived.score) ? raw.derived.score : 0;
    const wdo = raw && raw.derived && raw.derived.wdo ? String(raw.derived.wdo) : '≈';
    const win = raw && raw.derived && raw.derived.win ? String(raw.derived.win) : '≈';
    const biasLabel = bias === 'hawkish' ? 'mais duro' : bias === 'dovish' ? 'mais leve' : 'misto';
    const biasTone = bias === 'hawkish' ? 'negative' : bias === 'dovish' ? 'positive' : 'neutral';
    const interpretation =
        bias === 'hawkish'
            ? 'Leitura: revisões para cima em inflação/juros/câmbio e/ou para baixo em crescimento → piora de condições financeiras. Operacional: tende a WDO↑ / WIN↓ (precisa confirmar com preço/fluxo).'
            : bias === 'dovish'
                ? 'Leitura: revisões para baixo em inflação/juros/câmbio e/ou para cima em crescimento → alívio de condições financeiras. Operacional: tende a WDO↓ / WIN↑ (precisa confirmar com preço/fluxo).'
                : 'Leitura: revisões mistas (sem direção clara). Operacional: tratar como neutro e esperar confirmação por preço/fluxo.';
    const focusInsights = typeof opBriefing_focusComputeInsights === 'function'
        ? opBriefing_focusComputeInsights({
            raw,
            yearKeys,
            data,
            diSignal,
            findAliasSymbolBest,
            findAliasSymbol,
            findAssetSymbol,
            getMostRecentPointWithPrice,
            getLastPoint,
            formatNumber,
        })
        : { macroText: '', carryText: '', curveText: '' };
    const insightCard = (title, text) => {
        if (!text) return '';
        return `
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;">${escapeHtml(title)}</div>
                        <div style="margin-top:6px;opacity:.86;line-height:1.35;font-size:12px;">${escapeHtml(text)}</div>
                    </div>
                `;
    };
    const insightsHtml = (() => {
        const blocks = [
            insightCard('Macro', focusInsights.macroText),
            insightCard('Carry Trade', focusInsights.carryText),
            insightCard('Curva de Juros', focusInsights.curveText),
        ].filter(Boolean);
        if (!blocks.length) return '';
        return `
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        ${blocks.join('')}
                    </div>
                `;
    })();
    const yearCard = (title, pack) => {
        if (!pack) return '';
        const updated = pack.updatedAt ? formatDateTimeLoose(pack.updatedAt) : '';
        return `
                    <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                            <div style="font-weight:900;letter-spacing:.8px;">${escapeHtml(title)}</div>
                            <div style="opacity:.75;font-size:12px;white-space:nowrap;">${escapeHtml(updated || '')}</div>
                        </div>
                        <div style="margin-top:8px;">
                            ${line('IPCA (%)', 'ipca', pack.ipca, fmt2)}
                            ${line('Selic (%)', 'selic', pack.selic, fmt2)}
                            ${line('Câmbio (R$/US$)', 'cambio', pack.cambio, fmt4)}
                            ${line('PIB (%)', 'pib', pack.pib, fmt2)}
                        </div>
                    </div>
                `;
    };
    return `
                <div style="margin-top:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.95;">🧩 Boletim Focus (BCB)</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(biasTone, `Viés: ${biasLabel}`)}
                            ${badge('neutral', `Score: ${formatNumber(score, 2)}`)}
                            ${badge('neutral', `WDO ${wdo}`)}
                            ${badge('neutral', `WIN ${win}`)}
                            ${publishedAt ? badge('neutral', `Publicado: ${formatDateTimeLoose(publishedAt)}`) : ''}
                            ${cutoffDate ? badge('neutral', `Corte: ${cutoffDate}`) : ''}
                            <a href="${escapeHtml(pageUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">página</a>
                            ${pdfUrl ? `<a href="${escapeHtml(pdfUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.92;">pdf</a>` : ''}
                            ${datasetUrl ? `<a href="${escapeHtml(datasetUrl)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.75;">dataset</a>` : ''}
                        </div>
                    </div>
                    <div style="margin-top:8px;opacity:.90;line-height:1.35;">${escapeHtml(interpretation)}</div>
                    ${insightsHtml}
                    <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                        ${(yearKeys || [])
                            .map(y => yearCard(`Mediana ${y}`, raw && raw.years ? raw.years[y] : null))
                            .join('')}
                    </div>
                </div>
            `;
}
