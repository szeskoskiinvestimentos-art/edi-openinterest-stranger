(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const payload = data || null;
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatDateTime = d.formatDateTime;

        const url = payload && payload.url ? String(payload.url) : 'https://www.financialjuice.com/home';

        const items = payload && payload.ok === true && Array.isArray(payload.items) ? payload.items : null;
        const mode = payload && payload.mode ? String(payload.mode) : '';
        const message = payload && payload.message ? String(payload.message) : '';

        const rows = (items || []).map(x => {
            const createdAt = x && x.createdAt ? formatDateTime(String(x.createdAt)) : '';
            const original = x && x.original ? String(x.original) : '';
            const link = x && x.url ? String(x.url) : url;

            return `
            <div style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(0,0,0,.14);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;line-height:1.25;">${escapeHtml(original || '—')}</div>
                    <div style="opacity:.80;font-size:12px;white-space:nowrap;">${escapeHtml(createdAt || '')}</div>
                </div>
                <div style="margin-top:6px;">
                    <a href="${escapeHtml(link)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.95;">ver fonte</a>
                </div>
            </div>
        `;
        }).join('');

        const body = items && items.length
            ? `
            <div style="max-height:56vh;overflow:auto;overscroll-behavior:contain;padding:0 12px 12px;">
                <div style="display:grid;gap:10px;">${rows}</div>
            </div>
        `
            : `
            <div style="padding:0 12px 10px;opacity:.90;">
                ${escapeHtml(message || (mode ? `Sem manchetes disponíveis (${mode}).` : 'Sem manchetes disponíveis.'))}
            </div>
        `;

        el.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;">
            <a href="${escapeHtml(url)}" target="_blank" class="underline_link" style="font-weight:900;">Abrir FinancialJuice</a>
        </div>
        ${body}
    `;
    }

    root.financialJuice = { render };
    w.MercadoBlocks = root;
})();
