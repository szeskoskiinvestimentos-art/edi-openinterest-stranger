(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const clamp10 = (v) => Math.max(0, Math.min(10, Math.round(Number(v) || 0)));

    const toneColor = (s10) => {
        const x = clamp10(s10);
        if (x <= 3) return 'rgba(255,60,80,.95)';
        if (x >= 7) return 'rgba(0,255,160,.95)';
        return 'rgba(255,210,74,.95)';
    };

    const toTime = (tMs) => {
        try {
            return new Date(tMs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const readHistory = (historyKey) => {
        try {
            const raw = localStorage.getItem(String(historyKey || ''));
            const parsed = raw ? JSON.parse(raw) : null;
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter(x => x && typeof x === 'object')
                .map(o => {
                    const tMs = typeof o.tMs === 'number' && Number.isFinite(o.tMs) ? o.tMs : null;
                    const s10 = typeof o.s10 === 'number' && Number.isFinite(o.s10) ? o.s10 : null;
                    const pct = typeof o.pct === 'number' && Number.isFinite(o.pct) ? o.pct : null;
                    const delta = typeof o.delta === 'number' && Number.isFinite(o.delta) ? o.delta : null;
                    const oilAdj = typeof o.oilAdj === 'number' && Number.isFinite(o.oilAdj) ? o.oilAdj : 0;
                    const label = typeof o.label === 'string' ? o.label : '';
                    if (tMs === null || s10 === null || pct === null || delta === null) return null;
                    return { tMs, s10, pct, delta, oilAdj, label };
                })
                .filter(Boolean);
        } catch {
            return [];
        }
    };

    const writeHistory = (historyKey, items) => {
        try {
            localStorage.setItem(String(historyKey || ''), JSON.stringify(Array.isArray(items) ? items : []));
        } catch {
        }
    };

    const buildBarsHtml = ({ history, formatNumber, escapeHtml } = {}) => {
        const esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s ?? '');
        const fmtN = typeof formatNumber === 'function' ? formatNumber : ((v) => String(v));
        const list = Array.isArray(history) ? history : [];
        return list
            .slice(-12)
            .map(h => {
                const height = 8 + clamp10(h.s10) * 2.3;
                const title = `${toTime(h.tMs)} • ${clamp10(h.s10)}/10 • Δ ${fmtN(h.delta, 3)}${h.oilAdj ? ` • oil ${h.oilAdj > 0 ? '+' : ''}${fmtN(h.oilAdj, 2)}` : ''}`;
                return `<div title="${esc(title)}" style="width:10px;height:${height}px;background:${toneColor(h.s10)};border-radius:4px;opacity:.92;"></div>`;
            })
            .join('');
    };

    const buildHistoryCardHtml = ({ history, formatNumber, escapeHtml } = {}) => {
        const esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s ?? '');
        const list = Array.isArray(history) ? history : [];
        const bars = buildBarsHtml({ history: list, formatNumber, escapeHtml });
        const last = list.length ? list[list.length - 1] : null;
        return `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;background:rgba(0,0,0,.18);">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Histórico (últimas janelas)</div>
                    <div style="opacity:.80;font-size:12px;">${esc(last ? `${toTime(last.tMs)}` : '')}</div>
                </div>
                <div style="display:flex;align-items:flex-end;gap:6px;margin-top:10px;min-height:38px;">
                    ${bars || '<div style="opacity:.85;">—</div>'}
                </div>
            </div>
        `;
    };

    const updateThermoHistory = ({ historyKey, maxHistory, nowMs, s10, pct, delta, oilAdj, label, formatNumber, escapeHtml } = {}) => {
        const key = String(historyKey || '');
        const max = Math.max(4, Math.floor(Number(maxHistory) || 24));
        const tMs = typeof nowMs === 'number' && Number.isFinite(nowMs) ? nowMs : Date.now();
        const nextItem = {
            tMs,
            s10: clamp10(s10),
            pct: Math.max(0, Math.min(100, Math.round(Number(pct) || 0))),
            delta: typeof delta === 'number' && Number.isFinite(delta) ? delta : 0,
            oilAdj: typeof oilAdj === 'number' && Number.isFinite(oilAdj) ? oilAdj : 0,
            label: typeof label === 'string' ? label : '',
        };
        const history = readHistory(key);
        const last = history.length ? history[history.length - 1] : null;
        if (last && tMs - last.tMs < 20000) {
            history[history.length - 1] = nextItem;
        } else {
            history.push(nextItem);
        }
        const trimmed = history.slice(-max);
        writeHistory(key, trimmed);
        const html = buildHistoryCardHtml({ history: trimmed, formatNumber, escapeHtml });
        return { trimmed, html };
    };

    const mergeAlerts = (alerts) => Array.from(new Set((Array.isArray(alerts) ? alerts : []).map(x => String(x || '').trim()).filter(Boolean)));

    w.FlowSentinelHelpers = {
        clamp10,
        toneColor,
        toTime,
        readHistory,
        writeHistory,
        buildBarsHtml,
        buildHistoryCardHtml,
        updateThermoHistory,
        mergeAlerts,
    };
})();
