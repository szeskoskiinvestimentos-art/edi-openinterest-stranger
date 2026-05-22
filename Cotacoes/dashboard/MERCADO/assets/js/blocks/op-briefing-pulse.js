function opBriefing_computePulseCardHtml({ pulseNow, web, data, badge, biasTone, biasLabel, escapeHtml, formatNumber, formatPercent, toneBadgeHtmlFromTone, getChangePct }) {
    if (!pulseNow) return '';

    const mkPulse = (sym, side) => {
        const p = pulseNow.pulse && pulseNow.pulse[side] ? pulseNow.pulse[side] : null;
        if (!p) return '';
        const tone = p.net > 0.25 ? 'positive' : p.net < -0.25 ? 'negative' : 'neutral';
        const netBadge = toneBadgeHtmlFromTone(tone, Math.abs(p.net), `${formatNumber(p.net, 2)}`, { maxAbs: 3 });
        const pnl = p.pnlLike || { posSum: 0, negSum: 0, net: 0 };
        const br = p.breadth || { pos: 0, neg: 0, zero: 0 };

        const alignBadge = (ok, label) => {
            const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? formatPercent(v, 2) : '—');
            if (!ok || typeof ok !== 'object') return badge('neutral', `${label}: —`);
            if (ok.reason === 'missing') return badge('neutral', `${label}: —`);
            if (ok.reason === 'weak') return badge('neutral', `${label}: FRACO (${fmt(ok.a)} / ${fmt(ok.b)})`);
            if (ok.ok === null) return badge('neutral', `${label}: —`);
            return badge(ok.ok ? 'positive' : 'negative', `${label}: ${ok.ok ? 'OK' : 'DIVERGE'} (${fmt(ok.a)} / ${fmt(ok.b)})`);
        };

        const a1 =
            side === 'wdo'
                ? alignBadge(pulseNow.align ? pulseNow.align.wdo_usdbrl : null, 'WDO×USD/BRL')
                : alignBadge(pulseNow.align ? pulseNow.align.win_ibov : null, 'WIN×IBOV');
        const a2 =
            side === 'wdo'
                ? alignBadge(pulseNow.align ? pulseNow.align.wdo_dxy : null, 'WDO×DXY')
                : alignBadge(pulseNow.align ? pulseNow.align.win_ewz : null, 'WIN×EWZ');

        const missing = (() => {
            const cov = pulseNow.coverage && pulseNow.coverage[side] ? pulseNow.coverage[side] : null;
            const list = cov && Array.isArray(cov.missing) ? cov.missing : [];
            if (!list.length) return badge('positive', 'Drivers: completos');
            const head = list.slice(0, 6).join(', ');
            const tail = list.length > 6 ? `… +${list.length - 6}` : '';
            return badge('neutral', `Faltando: ${head}${tail ? ` ${tail}` : ''}`);
        })();

        const topNews = (() => {
            const items = web && Array.isArray(web.items) ? web.items.slice(0, 18) : [];
            const out = [];
            for (const it of items) {
                const title = it && it.title ? String(it.title) : '';
                const url = it && it.url ? String(it.url) : '';
                const impact = it && it.impact ? it.impact : null;
                const sig = impact && impact[side] ? String(impact[side]) : '≈';
                if (!title || sig === '≈') continue;
                const safeUrl = url && /^https?:\/\//i.test(url) ? url : '';
                const a = safeUrl
                    ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer" style="color:rgba(0,243,255,.92);text-decoration:none;">${escapeHtml(title)}</a>`
                    : escapeHtml(title);
                out.push(`• ${a} <span style="opacity:.85;font-family:'Share Tech Mono',monospace;">(${escapeHtml(sig)})</span>`);
                if (out.length >= 2) break;
            }
            return out.length ? out.join('<br>') : '<span style="opacity:.78;">• —</span>';
        })();

        let groupsLineHtml = '';
        {
            const g = p.groups || null;
            if (g) {
                const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? formatNumber(v, 2) : '—');
                const d = g.driver || { net: 0, count: 0 };
                const c = g.confirm || { net: 0, count: 0 };
                const x = g.context || { net: 0, count: 0 };
                groupsLineHtml = `<div style="margin-top:6px;opacity:.78;font-size:12px;">Camadas: Driver ${fmt(d.net)} (${String(d.count)}) • Conf ${fmt(c.net)} (${String(c.count)}) • Contexto ${fmt(x.net)} (${String(x.count)})</div>`;
            }
        }

        let volLineHtml = '';
        {
            const mk = (label, symbol) => {
                const pct = symbol ? getChangePct(data, symbol) : null;
                if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
                return `${label} ${formatPercent(pct, 2)}`;
            };
            const s = pulseNow.sym || {};
            const bits = [
                mk('VIX9D', s.vix9d),
                mk('VIX', s.vix30),
                mk('VVIX', s.vvix),
                mk('VXN', s.vxn),
                mk('VXEEM', s.vxeem),
                mk('VXEWZ', s.vxewz),
                mk('VXBR', s.vxbr),
            ].filter(Boolean);
            if (bits.length) {
                volLineHtml = `<div style="margin-top:6px;opacity:.78;font-size:12px;">Vol: ${escapeHtml(bits.join(' • '))}</div>`;
            }
        }

        return `
                <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="font-weight:900;letter-spacing:1px;">Pulso ${escapeHtml(sym)}</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            ${badge(biasTone(p.bias), biasLabel(sym, p.bias))}
                            ${badge('neutral', `Drivers net`)} ${netBadge}
                        </div>
                    </div>
                    <div style="margin-top:6px;opacity:.78;font-size:12px;">
                        Cobertura: ${escapeHtml(String((p.rows || []).length))} drivers ativos
                    </div>
                    ${groupsLineHtml}
                    ${volLineHtml}
                    <div style="margin-top:8px;opacity:.88;font-size:12px;line-height:1.35;">
                        PnL (sintético): +${formatNumber(pnl.posSum, 2)} / ${formatNumber(pnl.negSum, 2)} • net ${formatNumber(pnl.net, 2)}
                        • Largura: ${String(br.pos)}↑ ${String(br.neg)}↓ ${String(br.zero)}≈
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${missing}
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        ${a1} ${a2}
                    </div>
                    <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;opacity:.92;line-height:1.35;">
                        <div style="font-weight:900;letter-spacing:.6px;opacity:.92;margin-bottom:6px;">Notícias (impacto direto)</div>
                        <div style="font-size:12px;">${topNews}</div>
                    </div>
                </div>
            `;
    };

    return `
            <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">
                ${mkPulse('WDO', 'wdo')}
                ${mkPulse('WIN', 'win')}
            </div>
        `;
}
