(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const payload = data || null;
        const d = deps || {};
        const escapeHtml = typeof d.escapeHtml === 'function'
            ? d.escapeHtml
            : (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const formatNumber = typeof d.formatNumber === 'function'
            ? d.formatNumber
            : (v, dec = 2) => {
                const n = typeof v === 'number' ? v : Number(v);
                if (!Number.isFinite(n)) return '—';
                try { return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); } catch { return String(n); }
            };
        const formatDateTimeLoose = typeof d.formatDateTimeLoose === 'function'
            ? d.formatDateTimeLoose
            : (iso) => {
                const raw = iso ? String(iso) : '';
                if (!raw) return '—';
                const ms = Date.parse(raw);
                if (!Number.isFinite(ms)) return raw;
                try { return new Date(ms).toLocaleString('pt-BR', { hour12: false }); } catch { return raw; }
            };
        const toneFromRegimeText = typeof d.toneFromRegimeText === 'function'
            ? d.toneFromRegimeText
            : (txt) => (/negativ|stress|risk[_\s-]?off/i.test(String(txt || '')) ? 'negative' : /positiv|risk[_\s-]?on/i.test(String(txt || '')) ? 'positive' : 'neutral');
        const toneBadgeHtmlFromTone = typeof d.toneBadgeHtmlFromTone === 'function'
            ? d.toneBadgeHtmlFromTone
            : (tone, _strength, text) => {
                const cls = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral';
                return `<span class="${escapeHtml(cls)}" style="display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;opacity:.92;">${escapeHtml(text ?? '')}</span>`;
            };

        if (!payload) {
            el.innerHTML = `<div style="padding:12px;opacity:.9;">Indisponível • Sem dados.</div>`;
            return;
        }
        if (payload.ok !== true || !payload.items) {
            const msg = payload && payload.message ? String(payload.message) : 'Indisponível • Sem dados.';
            el.innerHTML = `<div style="padding:12px;opacity:.9;">${escapeHtml(msg)}</div>`;
            return;
        }

        const items = [payload.items.WDO, payload.items.WIN].filter(Boolean);
        if (!items.length) {
            el.innerHTML = `<div style="padding:12px;opacity:.9;">Sem dados</div>`;
            return;
        }

        const fmt0 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 0) : '—');
        const fmt2 = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');

        const rows = items.map(item => {
            const regime = item && item.regime ? String(item.regime) : '—';
            const tone = toneFromRegimeText(regime);
            const badge = toneBadgeHtmlFromTone(tone, 1, regime, { maxAbs: 1 });

            const key = item && item.keyLevels ? item.keyLevels : {};
            const model = key && key.gammaFlipModel ? String(key.gammaFlipModel) : '';
            const gammaTxt = fmt0(key.gammaFlip);
            const gammaHtml = model
                ? `${escapeHtml(gammaTxt)}<div style="opacity:.72;font-size:11px;margin-top:2px;line-height:1.1;">${escapeHtml(model)}</div>`
                : escapeHtml(gammaTxt);

            const range =
                typeof key.rangeLow === 'number' && typeof key.rangeHigh === 'number'
                    ? `${fmt0(key.rangeLow)}–${fmt0(key.rangeHigh)}`
                    : '—';

            const dash = item && item.links && item.links.dashboard ? String(item.links.dashboard) : '';
            const dataUrl = item && item.links && item.links.data ? String(item.links.data) : '';
            const links = [
                dash ? `<a href="${escapeHtml(dash)}" target="_blank" class="underline_link">Dashboard</a>` : null,
                dataUrl ? `<a href="${escapeHtml(dataUrl)}" target="_blank" class="underline_link">Data</a>` : null,
            ].filter(Boolean).join(' • ');

            return `
            <tr>
                <td style="font-weight:900;letter-spacing:.5px;">${escapeHtml(item.symbol || '—')}</td>
                <td>${badge}</td>
                <td>${fmt2(item.spot)}</td>
                <td>${gammaHtml}</td>
                <td>${fmt0(key.putWall)}</td>
                <td>${fmt0(key.callWall)}</td>
                <td>${range}</td>
                <td>${fmt0(key.maxPain)}</td>
                <td style="white-space:nowrap;">${escapeHtml(formatDateTimeLoose(item.updatedAt))}</td>
                <td style="white-space:nowrap;">${links || '—'}</td>
            </tr>
        `;
        }).join('');

        el.innerHTML = `
        <table class="data-table" style="width:100%;">
            <thead>
                <tr>
                    <th>Ativo</th>
                    <th>Regime</th>
                    <th>Spot</th>
                    <th>Gamma Flip</th>
                    <th>PutWall</th>
                    <th>CallWall</th>
                    <th>Range</th>
                    <th>MaxPain</th>
                    <th>Atualizado</th>
                    <th>Abrir</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
    }

    root.optionsGammaSummary = { render };
    w.MercadoBlocks = root;
})();
