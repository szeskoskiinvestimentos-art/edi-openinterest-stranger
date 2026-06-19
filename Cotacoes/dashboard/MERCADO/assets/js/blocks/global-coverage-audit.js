(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        const target = el || document.getElementById('globalCoverageAudit');
        if (!target) return;
        const d = deps && typeof deps === 'object' ? deps : {};

        const escapeHtml = d.escapeHtml;
        const formatPercent = d.formatPercent;
        const formatDateTime = d.formatDateTime;
        const pillHtml = d.pillHtml;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const getLastPoint = d.getLastPoint;

        if (typeof escapeHtml !== 'function'
            || typeof formatPercent !== 'function'
            || typeof formatDateTime !== 'function'
            || typeof pillHtml !== 'function'
            || typeof findAliasSymbolBest !== 'function'
            || typeof findAliasSymbol !== 'function'
            || typeof findAssetSymbol !== 'function'
            || typeof getLastPoint !== 'function'
        ) {
            target.innerHTML = '<div style="opacity:.86;font-weight:900;letter-spacing:.6px;">Qualidade do Feed indisponível (deps ausentes).</div>';
            return;
        }

        const isNum = v => (typeof v === 'number' && Number.isFinite(v));
        const nowMs = Date.now();
        const op = d.operationalTuning && typeof d.operationalTuning === 'object' ? d.operationalTuning : {};
        const staleWarnMin = typeof op.staleAsOfWarnMin === 'number' && Number.isFinite(op.staleAsOfWarnMin) ? Math.max(1, op.staleAsOfWarnMin) : 15;
        const staleBadMin = typeof op.staleAsOfBadMin === 'number' && Number.isFinite(op.staleAsOfBadMin) ? Math.max(staleWarnMin + 1, op.staleAsOfBadMin) : 60;

        const badge = (tone, text, strength) => pillHtml('status', tone, text, strength);
        const ageText = (ageMin) => {
            if (!isNum(ageMin)) return '—';
            const m = Math.max(0, ageMin);
            if (m < 1) return '0m';
            return `${String(Math.round(m))}m`;
        };
        const resolve = (aliasKey, matcher, { preferSymbols = [] } = {}) => {
            const ds = data || null;
            for (const s0 of (Array.isArray(preferSymbols) ? preferSymbols : [])) {
                const s = String(s0 || '');
                if (s && ds && ds.series && Array.isArray(ds.series[s]) && ds.series[s].length) return s;
            }
            return findAliasSymbolBest(ds, aliasKey) || findAliasSymbol(ds, aliasKey) || (matcher instanceof RegExp ? findAssetSymbol(ds, matcher) : null);
        };

        const lastPoint = (symbol) => {
            if (!data || !symbol) return null;
            return (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || getLastPoint(data, symbol);
        };
        const pointAsOfMs = (pt) => {
            if (!pt) return null;
            const raw = pt.asOf ? String(pt.asOf) : (pt.t ? String(pt.t) : '');
            const ms = raw ? Date.parse(raw) : NaN;
            return Number.isFinite(ms) ? ms : null;
        };
        const pointTMs = (pt) => {
            if (!pt || !pt.t) return null;
            const ms = Date.parse(String(pt.t));
            return Number.isFinite(ms) ? ms : null;
        };
        const isFutureSymbol = (symbol) => {
            const s = String(symbol || '');
            if (!s) return false;
            if (/=F$/i.test(s)) return true;
            if (/[A-Z]{1,6}c\d+$/i.test(s)) return true;
            if (/(^TNc1=$|^DAPc\d+$|^DDIc\d+$)/i.test(s)) return true;
            return false;
        };
        const derivePctFromPrev = (symbol, pt) => {
            if (!data || !symbol || !pt || !isNum(pt.price) || pt.price <= 0) return null;
            const xs = data.series && Array.isArray(data.series[symbol]) ? data.series[symbol] : [];
            if (xs.length < 2) return null;
            for (let i = xs.length - 2; i >= 0; i -= 1) {
                const p = xs[i];
                if (!p || !isNum(p.price) || p.price <= 0) continue;
                return ((pt.price - p.price) / p.price) * 100;
            }
            return null;
        };

        const drivers = [
            { key: 'WINc1', label: 'WIN', symbol: () => findAssetSymbol(data, /^WINc1$/i) || findAssetSymbol(data, /^WIN\b/i) || null },
            { key: 'WDOc1', label: 'WDO', symbol: () => findAssetSymbol(data, /^WDOc1$/i) || findAssetSymbol(data, /^WDO\b/i) || null },
            { key: 'USD/BRL', label: 'USD/BRL', symbol: () => resolve('USD_BRL', /^USD\/BRL\b/i) },
            { key: 'DXY', label: 'DXY', symbol: () => resolve('DXY', /(^USDX$|DX-Y\.NYB|^\.(DXY)\b|\bDollar Index\b)/i, { preferSymbols: ['USDX'] }) },
            { key: 'VIX', label: 'VIX', symbol: () => resolve('VIX', /(^\.(VIX|VIX9D)\b|^VIX\b)/i) },
            { key: 'US10Y', label: 'US10Y', symbol: () => resolve('US10Y', /(^TNc1=$|^\.(TNX)\b|^US10YT=RR\b|\bUnited States 10-Year\b)/i, { preferSymbols: ['TNc1=', '.TNX'] }) },
            { key: 'SPX', label: 'SPX', cashStaleOk: true, symbol: () => resolve('SPX', /(^\.SPX\b|^SPY\b|\bS&P 500\b)/i, { preferSymbols: ['ES=F', 'MES=F'] }) },
            { key: 'BRENT', label: 'Brent', cashStaleOk: true, symbol: () => resolve('BRENT', /(\bBrent\b|^BZ(=F)?$|^LCOc1$|^BZc1$)/i, { preferSymbols: ['BZ=F', 'LCOc1'] }) },
            { key: 'GOLD', label: 'Ouro', cashStaleOk: true, symbol: () => resolve('GOLD', /(\bXAU\/USD\b|\bGold\b|^GC(=F)?$|^GCc1$)/i, { preferSymbols: ['GC=F', 'GCc1'] }) },
            { key: 'FXI/CSI300', label: 'China', cashStaleOk: true, symbol: () => resolve('FXI', /^FXI(\.\w+)?$/i) || resolve('CSI300', /^\.(CSI300)\b/i) || null },
            { key: 'DCE_I0', label: 'Minério', staleBadMinOverride: 72 * 60, symbol: () => resolve('IRON', /(^DCE_I0$|^TIO(=F)?$|^TIOc1$|^TIOc2$|^SM58F(c1)?$|\bIron\s*Ore\b|\bMin[ée]rio\b)/i) },
            { key: 'HG', label: 'Cobre', symbol: () => resolve('COPPER', /(^HG(=F)?$|^HG$|\bCopper\b|\bCobre\b)/i) },
        ];

        const rows = drivers.map(it => {
            const symbol = typeof it.symbol === 'function' ? it.symbol() : null;
            const pt = symbol ? lastPoint(symbol) : null;
            const price = pt && isNum(pt.price) ? pt.price : null;
            const asOfMs = pointAsOfMs(pt);
            const ageMin = asOfMs !== null ? Math.max(0, (nowMs - asOfMs) / 60000) : null;
            const tMs = pointTMs(pt);
            const tAgeMin = tMs !== null ? Math.max(0, (nowMs - tMs) / 60000) : null;
            const rawPct = pt && isNum(pt.changePct) ? pt.changePct : null;
            const derivedPct = rawPct === null ? derivePctFromPrev(symbol, pt) : null;
            const pct = rawPct !== null ? rawPct : (isNum(derivedPct) ? derivedPct : null);
            const pctSource = rawPct !== null ? 'field' : (pct !== null ? 'derived' : 'none');
            const missing = !symbol
                ? 'missing_symbol'
                : (price === null ? 'missing_price' : (pct === null ? 'missing_pct' : ''));
            const warnMin = isNum(it.staleWarnMinOverride) ? it.staleWarnMinOverride : staleWarnMin;
            const badMinBase = isNum(it.staleBadMinOverride) ? it.staleBadMinOverride : staleBadMin;
            const badMin = it.cashStaleOk ? Math.max(badMinBase, 24 * 60) : badMinBase;
            const isStale = isNum(ageMin) && ageMin > warnMin;
            const isBadByAge = isNum(ageMin) && ageMin > badMin;
            const cashClosed = !!(it.cashStaleOk && symbol && !isFutureSymbol(symbol) && isBadByAge && isNum(tAgeMin) && tAgeMin <= 45);
            const st = (missing === 'missing_symbol' || missing === 'missing_price' || ageMin === null)
                ? 'bad'
                : (cashClosed ? 'warn' : (isBadByAge ? 'bad' : ((isStale || pct === null) ? 'warn' : 'ok')));
            const tone = st === 'ok' ? 'ok' : st === 'warn' ? 'warn' : 'bad';
            const strength = st === 'ok' ? 0.75 : st === 'warn' ? 0.85 : 0.95;
            const asOfTxt = asOfMs !== null ? formatDateTime(new Date(asOfMs).toISOString()) : '—';
            const pctTxt = pct === null ? 'Δ%—' : (pctSource === 'derived' ? `Δ~${formatPercent(pct, 2)}` : `Δ${formatPercent(pct, 2)}`);
            const info = `${it.label}: ${ageText(ageMin)} • ${pctTxt}`;
            const title = [
                it.key,
                symbol ? `sym=${symbol}` : 'sym=—',
                `asOf=${asOfTxt}`,
                isNum(ageMin) ? `age=${String(Math.round(ageMin))}m` : 'age=—',
                isNum(tAgeMin) ? `tAge=${String(Math.round(tAgeMin))}m` : '',
                cashClosed ? 'expected=avista_fechado' : '',
                missing ? `reason=${missing}` : '',
                pctSource !== 'none' ? `pctSource=${pctSource}` : '',
            ].filter(Boolean).join(' • ');
            return { ...it, symbol, pt, ageMin, tAgeMin, asOfTxt, pct, pctSource, missing: cashClosed ? 'market_closed' : missing, tone, strength, info, title };
        });

        const counts = rows.reduce((acc, r) => {
            acc[r.tone] = (acc[r.tone] || 0) + 1;
            return acc;
        }, {});
        const okN = counts.ok || 0;
        const warnN = counts.warn || 0;
        const badN = counts.bad || 0;
        const headlineTone = badN ? 'bad' : warnN ? 'warn' : 'ok';
        const headlineStrength = badN ? 0.95 : warnN ? 0.85 : 0.75;

        const missingPct = rows.filter(r => r.missing === 'missing_pct').map(r => r.key);
        const missingPrice = rows.filter(r => r.missing === 'missing_price').map(r => r.key);
        const missingSymbol = rows.filter(r => r.missing === 'missing_symbol').map(r => r.key);
        const cashClosed = rows.filter(r => r.missing === 'market_closed').map(r => `${r.key} ${ageText(r.ageMin)}`);
        const stale = rows
            .filter(r => r.missing !== 'market_closed' && isNum(r.ageMin) && r.ageMin > staleWarnMin)
            .map(r => `${r.key} ${ageText(r.ageMin)}`);
        const issues = []
            .concat(missingSymbol.length ? [`Sem símbolo: ${missingSymbol.join(', ')}`] : [])
            .concat(missingPrice.length ? [`Sem preço: ${missingPrice.join(', ')}`] : [])
            .concat(missingPct.length ? [`Sem Δ% calculável: ${missingPct.join(', ')}`] : [])
            .concat(cashClosed.length ? [`À vista fechado (esperado): ${cashClosed.join(', ')}`] : [])
            .concat(stale.length ? [`Stale: ${stale.join(', ')}`] : []);

        const pills = rows.map(r => `<span title="${escapeHtml(r.title)}">${badge(r.tone, r.info, r.strength)}</span>`).join(' ');
        const issuesHtml = issues.length
            ? `<div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">${escapeHtml(issues.slice(0, 6).join(' • '))}</div>`
            : `<div style="margin-top:10px;opacity:.82;font-size:12px;line-height:1.35;">Sem inconsistências detectadas nos drivers críticos.</div>`;

        target.innerHTML = `
        <div style="padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Qualidade do Feed (drivers críticos)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${badge(headlineTone, `OK ${String(okN)} • WARN ${String(warnN)} • BAD ${String(badN)}`, headlineStrength)}
                    ${badge('info', `stale>${String(staleWarnMin)}m`, 0.65)}
                </div>
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                ${pills}
            </div>
            ${issuesHtml}
        </div>
    `;
    }

    root.globalCoverageAudit = { render };
    w.MercadoBlocks = root;
})();
