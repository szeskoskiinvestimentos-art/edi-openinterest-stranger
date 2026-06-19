function opBriefing_gaugeHtml({ label, score, escapeHtml, toneBadgeHtmlFromTone, formatNumber }) {
    const safeLabel = typeof escapeHtml === 'function' ? escapeHtml(label) : String(label || '');
    const deg = Math.round(Math.max(-1, Math.min(1, score)) * 60);
    const tone = score > 0.22 ? 'positive' : score < -0.22 ? 'negative' : 'neutral';
    const arcGrad = 'linear-gradient(90deg, rgba(255,60,80,.85) 0%, rgba(255,210,74,.85) 50%, rgba(0,255,160,.85) 100%)';
    const glow = tone === 'positive' ? '0 0 18px rgba(0,255,160,.35)' : tone === 'negative' ? '0 0 18px rgba(255,60,80,.35)' : '0 0 18px rgba(255,210,74,.28)';
    const scoreTxt = typeof formatNumber === 'function' ? formatNumber(score, 2) : String(score);
    const badge = typeof toneBadgeHtmlFromTone === 'function' ? toneBadgeHtmlFromTone(tone, score, scoreTxt, { maxAbs: 1 }) : scoreTxt;
    const needleClr = tone === 'positive' ? 'rgba(0,255,160,.95)' : tone === 'negative' ? 'rgba(255,60,80,.95)' : 'rgba(255,210,74,.95)';
    return `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:98px;height:54px;border:1px solid rgba(255,255,255,.18);border-radius:98px 98px 0 0;background:rgba(0,0,0,.22);position:relative;overflow:hidden;box-shadow:${glow};">
                    <div style="position:absolute;left:6px;right:6px;bottom:6px;height:10px;border-radius:999px;background:${arcGrad};opacity:.85;"></div>
                    <div style="position:absolute;left:50%;bottom:6px;width:3px;height:42px;background:${needleClr};transform-origin:bottom center;transform:translateX(-50%) rotate(${deg}deg);box-shadow:0 0 14px rgba(255,255,255,.22);border-radius:3px;"></div>
                    <div style="position:absolute;left:10px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.35);"></div>
                    <div style="position:absolute;left:26px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.25);"></div>
                    <div style="position:absolute;right:26px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.25);"></div>
                    <div style="position:absolute;right:10px;bottom:6px;width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.35);"></div>
                </div>
                <div style="font-family:'Share Tech Mono',monospace;font-weight:900;letter-spacing:.5px;">${safeLabel} ${badge}</div>
            </div>
        `;
}

function opBriefing_biasTone(b) {
    return b === 'buy' ? 'positive' : b === 'sell' ? 'negative' : 'neutral';
}

function opBriefing_biasLabel(symbol, b) {
    if (b === 'buy') return `${symbol}: COMPRA`;
    if (b === 'sell') return `${symbol}: VENDA`;
    return `${symbol}: NEUTRO`;
}

function opBriefing_formatAgendaLine({ agendaNext, agendaIfThen, agendaValidation, formatNumber }) {
    const next = agendaNext || null;
    if (!next) return 'Agenda: —';
    const imp = String(next.impact || '').toUpperCase() || '—';
    const cur = String(next.currency || '').toUpperCase() || '—';
    const tt = next.time ? String(next.time) : '—';
    const ev = next.event ? String(next.event) : '—';
    const wdo = next.wdo ? String(next.wdo) : '—';
    const win = next.win ? String(next.win) : '—';
    const key = next.matrixKey ? ` • key ${String(next.matrixKey)}` : '';
    const m = typeof next.minutesTo === 'number' && Number.isFinite(next.minutesTo) ? next.minutesTo : null;
    const when = m === null ? '' : (m < 0 ? ` (há ${String(Math.abs(Math.round(m)))}m)` : ` (em ${String(Math.round(m))}m)`);
    const seEntao = (agendaIfThen && Array.isArray(agendaIfThen.lines) && agendaIfThen.lines.length)
        ? ` • Se–então: ${agendaIfThen.lines.join(' | ')}${agendaIfThen.source ? ` (${agendaIfThen.source})` : ''}`
        : '';
    const conf = agendaValidation && typeof agendaValidation.score === 'number' && Number.isFinite(agendaValidation.score)
        ? ` • Conf ${agendaValidation.label} (${typeof formatNumber === 'function' ? formatNumber(agendaValidation.score * 100, 0) : String(Math.round(agendaValidation.score * 100))}%)`
        : '';
    const val = agendaValidation && Array.isArray(agendaValidation.keys) && agendaValidation.keys.length
        ? ` • Validar ${agendaValidation.keys.join('/')}`
        : '';
    return `Agenda: ${imp} ${cur} ${tt}${when} • WDO ${wdo} / WIN ${win}${key} • ${ev}${seEntao}${conf}${val}`;
}

function opBriefing_formatNewsLine({ web, newsTilt, fmt1 }) {
    if (!web) return 'News tilt: —';
    return `News tilt (-1..+1): WDO ${fmt1(newsTilt.wdo.score)} • WIN ${fmt1(newsTilt.win.score)}`;
}

