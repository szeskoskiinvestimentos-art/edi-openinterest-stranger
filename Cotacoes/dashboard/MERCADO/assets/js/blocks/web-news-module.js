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
            : (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

        const formatDateTime = typeof d.formatDateTime === 'function'
            ? d.formatDateTime
            : (iso) => {
                const raw = iso ? String(iso) : '';
                if (!raw) return '';
                const ms = Date.parse(raw);
                if (!Number.isFinite(ms)) return raw;
                try { return new Date(ms).toLocaleString('pt-BR', { hour12: false }); } catch { return raw; }
            };

        const formatDateTimeLoose = typeof d.formatDateTimeLoose === 'function'
            ? d.formatDateTimeLoose
            : (iso) => {
                const raw = iso ? String(iso) : '';
                if (!raw) return '';
                const ms = Date.parse(raw);
                if (!Number.isFinite(ms)) return raw;
                try { return new Date(ms).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false }); } catch { return raw; }
            };

        const pillHtml = typeof d.pillHtml === 'function'
            ? d.pillHtml
            : (_kind, _tone, text) => `<span style="display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">${escapeHtml(text ?? '')}</span>`;

        const fallbackCard = typeof d.fallbackCard === 'function'
            ? d.fallbackCard
            : (title, message) => {
                const t = escapeHtml(title || 'Indisponível');
                const m = escapeHtml(message || 'Falha ao renderizar.');
                return `<div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">${t}</div>
                    <div style="margin-top:8px;opacity:.88;line-height:1.35;">${m}</div>
                </div>`;
            };

        try {
            const ok = payload && payload.ok === true;
            const message = payload && payload.message ? String(payload.message) : '';
            const items = ok && Array.isArray(payload.items) ? payload.items : null;
            const summary = ok && payload.summary ? payload.summary : null;
            const sources = ok && Array.isArray(payload.sources) ? payload.sources : [];
            const windowHours = ok && typeof payload.windowHours === 'number' ? payload.windowHours : null;
            const generatedAt = ok && payload.generatedAt ? String(payload.generatedAt) : '';

            const badge = (tone, text, strength) => pillHtml('signal', tone, text, strength);

            if (!ok) {
                el.innerHTML = `
                <div style="padding:12px;opacity:.90;">
                    ${escapeHtml(message || 'Web News Module indisponível.')}
                </div>
            `;
                return;
            }

            const sentiment = summary && summary.sentiment ? String(summary.sentiment) : 'Neutro';
            const conflicts = summary && Array.isArray(summary.conflicts) ? summary.conflicts : [];
            const thesis = summary && summary.thesis ? summary.thesis : null;
            const globalTop = summary && Array.isArray(summary.globalTop) ? summary.globalTop : [];
            const brasilTop = summary && Array.isArray(summary.brasilTop) ? summary.brasilTop : [];
            const commoditiesTop = summary && Array.isArray(summary.commoditiesTop) ? summary.commoditiesTop : [];
            const bullish = summary && Array.isArray(summary.bullish) ? summary.bullish : [];
            const bearish = summary && Array.isArray(summary.bearish) ? summary.bearish : [];

        const sentimentTone =
            sentiment === 'Muito Otimista' || sentiment === 'Otimista' ? 'positive'
                : sentiment === 'Muito Pessimista' || sentiment === 'Pessimista' ? 'negative'
                    : 'neutral';

        const topicsLine = (label, arr) => {
            if (!arr || !arr.length) return '';
            return `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);"><span style="opacity:.9;font-weight:900;">${escapeHtml(label)}:</span> <span style="opacity:.92;">${escapeHtml(arr.join(' • '))}</span></div>`;
        };

        const renderItems = () => {
            if (!items || !items.length) return `<div style="padding:0 12px 10px;opacity:.90;">Sem manchetes no momento.</div>`;

            const rows = items.map(x => {
                const publishedAt = x && x.publishedAt ? formatDateTime(String(x.publishedAt)) : '';
                const title = x && x.title ? String(x.title) : '';
                const link = x && x.url ? String(x.url) : '';
                const source = x && x.source ? String(x.source) : '';
                const bucket = x && x.bucket ? String(x.bucket) : '';
                const driver = x && x.driver ? String(x.driver) : '';
                const wdo = x && x.impact && x.impact.wdo ? String(x.impact.wdo) : '≈';
                const win = x && x.impact && x.impact.win ? String(x.impact.win) : '≈';
                const conf = x && x.confidence ? String(x.confidence) : 'média';

                const wdoTone = wdo === '↑' ? 'negative' : wdo === '↓' ? 'positive' : 'neutral';
                const winTone = win === '↑' ? 'positive' : win === '↓' ? 'negative' : 'neutral';

                return `
                <div style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(0,0,0,.14);">
                    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;line-height:1.25;">${escapeHtml(title || '—')}</div>
                        <div style="opacity:.80;font-size:12px;white-space:nowrap;">${escapeHtml(publishedAt || '')}</div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge('neutral', `${bucket}${driver ? ` • ${driver}` : ''}`)}
                        ${badge(wdoTone, `WDO ${wdo}`)}
                        ${badge(winTone, `WIN ${win}`)}
                        ${badge('neutral', `conf: ${conf}`)}
                    </div>
                    <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="opacity:.85;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(source || '')}</div>
                        ${link ? `<a href="${escapeHtml(link)}" target="_blank" class="underline_link" style="font-size:12px;opacity:.95;">ver fonte</a>` : ''}
                    </div>
                </div>
            `;
            }).join('');

            return `
            <div style="padding:0 12px 12px;">
                <div style="display:grid;gap:10px;">${rows}</div>
            </div>
        `;
        };

            el.innerHTML = `
            <div style="padding:10px 12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;">Web News Module</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${badge(sentimentTone, `Sentimento: ${sentiment}`)}
                        ${badge('neutral', `Janela: ${windowHours ? `${windowHours}h` : '—'}`)}
                        ${generatedAt ? badge('neutral', `Carimbo: ${formatDateTimeLoose(generatedAt)}`) : ''}
                    </div>
                </div>
                <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
                    ${topicsLine('TOP Global', globalTop)}
                    ${topicsLine('TOP Brasil', brasilTop)}
                    ${topicsLine('TOP Commodities', commoditiesTop)}
                </div>
                ${(bullish && bullish.length) || (bearish && bearish.length)
                    ? `
                    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;">
                            <div>
                                <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">Bullish (Top 3)</div>
                                ${(bullish || []).slice(0, 3).map(t => `<div style="opacity:.92;line-height:1.35;">• ${escapeHtml(String(t))}</div>`).join('') || `<div style="opacity:.80;">—</div>`}
                            </div>
                            <div>
                                <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">Bearish (Top 3)</div>
                                ${(bearish || []).slice(0, 3).map(t => `<div style="opacity:.92;line-height:1.35;">• ${escapeHtml(String(t))}</div>`).join('') || `<div style="opacity:.80;">—</div>`}
                            </div>
                        </div>
                    </div>
                  `
                    : ''}
                ${thesis
                    ? `
                    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">O que está sendo precificado (3 frases)</div>
                        <div style="opacity:.92;line-height:1.45;">${escapeHtml(String(thesis.global || ''))}</div>
                        <div style="opacity:.92;line-height:1.45;margin-top:6px;">${escapeHtml(String(thesis.brasil || ''))}</div>
                        <div style="opacity:.92;line-height:1.45;margin-top:6px;">${escapeHtml(String(thesis.commodities || ''))}</div>
                    </div>
                  `
                    : ''}
                ${conflicts && conflicts.length
                    ? `
                    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.12);">
                        <div style="font-weight:900;letter-spacing:1px;opacity:.92;margin-bottom:8px;">Conflitos</div>
                        ${conflicts.map(t => `<div style="opacity:.92;line-height:1.35;">• ${escapeHtml(String(t))}</div>`).join('')}
                    </div>
                  `
                    : ''}
                ${sources && sources.length
                    ? `
                    <div style="margin-top:12px;opacity:.80;font-size:12px;">Fontes: ${escapeHtml(sources.join(' • '))}</div>
                  `
                    : ''}
            </div>
            ${renderItems()}
        `;
        } catch {
            el.innerHTML = fallbackCard('Web News Module', 'Falha ao renderizar o módulo.');
        }
    }

    root.webNewsModule = { render };
    w.MercadoBlocks = root;
})();
