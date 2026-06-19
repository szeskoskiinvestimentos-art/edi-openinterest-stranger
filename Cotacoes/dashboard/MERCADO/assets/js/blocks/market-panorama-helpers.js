(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;

    const safeParse = raw => {
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };

    const readJson = (key) => safeParse(localStorage.getItem(String(key || '')));
    const writeJson = (key, value) => {
        try {
            localStorage.setItem(String(key || ''), JSON.stringify(value || {}));
        } catch {
        }
    };

    const formatPrice = (symbol, price, formatNumber) => {
        if (price === null || price === undefined || !Number.isFinite(price)) return '—';
        const fmt = typeof formatNumber === 'function' ? formatNumber : ((v) => String(v));
        const s = String(symbol || '');
        if (/\b(BTC|ETH|XRP|SOL|ADA)\b/i.test(s)) return fmt(price, price >= 1000 ? 0 : 2);
        if (/\/\w{3}\b/i.test(s) || s.includes('/')) return fmt(price, 4);
        if (price >= 1000) return fmt(price, 0);
        if (price >= 100) return fmt(price, 2);
        return fmt(price, 4);
    };

    const formatHm = (iso, formatDateTime) => {
        const full = iso && typeof formatDateTime === 'function' ? formatDateTime(iso) : '';
        const parts = String(full || '').split(' ');
        return parts.length > 1 ? parts[1] : full || '';
    };

    const pinnedMatchers = (groupKey) => {
        const k = String(groupKey || '');
        if (k === 'fx_g10') return [/^\.(DXY)\b/i, /^EUR\/USD\b/i, /^USD\/JPY\b/i, /^GBP\/USD\b/i, /^AUD\/USD\b/i, /^NZD\/USD\b/i, /^USD\/CHF\b/i, /^USD\/CAD\b/i];
        if (k === 'fx_em') return [/^USD\/BRL\b/i, /^USD\/MXN\b/i, /^USD\/ZAR\b/i, /^USD\/TRY\b/i, /^USD\/(CNY|CNH)\b/i];
        if (k === 'rates' || k === 'credit') return [/^US2YT=RR$/i, /^US10YT=RR$/i, /^US30YT=RR$/i, /^BR2YT=RR$/i, /^BR10YT=RR$/i, /^US10BR10=RR$/i];
        if (k === 'equities') return [/^\.(SPX|NDX)\b/i, /^SPY$/i, /^QQQ$/i, /^IWM$/i, /^DIA$/i, /^EWZ$/i];
        if (k === 'emerging') return [/^FXI$/i, /^\.(CSI300)\b/i, /^EEM$/i, /^EWW$/i];
        if (k === 'energy') return [/\bBrent\b/i, /\bWTI\b/i, /^CO1\b/i, /^CL1\b/i];
        if (k === 'metals') return [/\bGold\b/i, /\bSilver\b/i, /\bCopper\b/i, /^GC1\b/i, /^SI1\b/i, /^HG\b/i];
        if (k === 'agri') return [/\bSoy\b/i, /\bCorn\b/i, /\bWheat\b/i];
        if (k === 'crypto') return [/\bBTC\b/i, /\bETH\b/i];
        if (k === 'vol') return [/\bVIX\b/i, /^\.VIX\b/i];
        return [];
    };

    const pinnedIndex = (groupKey, row) => {
        const matchers = pinnedMatchers(groupKey);
        if (!matchers.length) return 999;
        const s = String(row && row.symbol ? row.symbol : '');
        const n = String(row && row.label ? row.label : '');
        for (let i = 0; i < matchers.length; i++) {
            const re = matchers[i];
            if (re.test(s) || re.test(n)) return i;
        }
        return 999;
    };

    const sortRows = (groupKey, rows, isFav) => {
        const key = String(groupKey || '');
        const list = Array.isArray(rows) ? rows : [];
        const fav = typeof isFav === 'function' ? isFav : (() => false);
        list.sort((a, b) => {
            const af = fav(a && a.symbol ? a.symbol : '') ? 0 : 1;
            const bf = fav(b && b.symbol ? b.symbol : '') ? 0 : 1;
            if (af !== bf) return af - bf;
            const ap = pinnedIndex(key, a);
            const bp = pinnedIndex(key, b);
            if (ap !== bp) return ap - bp;
            return String(a && a.label ? a.label : '').localeCompare(String(b && b.label ? b.label : ''), 'pt-BR');
        });
    };

    const diMonthNum = (code) => {
        const c = String(code || '').toUpperCase();
        if (c === 'F') return 1;
        if (c === 'G') return 2;
        if (c === 'H') return 3;
        if (c === 'J') return 4;
        if (c === 'K') return 5;
        if (c === 'M') return 6;
        if (c === 'N') return 7;
        if (c === 'Q') return 8;
        if (c === 'U') return 9;
        if (c === 'V') return 10;
        if (c === 'X') return 11;
        if (c === 'Z') return 12;
        return null;
    };

    const buildDiRows = ({ data, seriesKeys, diMatcher, getMostRecentPointWithPrice, pointPct, assetIcon } = {}) => {
        const keys = Array.isArray(seriesKeys) ? seriesKeys : Object.keys((data && data.series) || {});
        const matcher = diMatcher instanceof RegExp ? diMatcher : /^DI1[FGHJKMNQUVXZ]\d{2}$/i;
        const parsed = keys
            .filter(s => matcher.test(s))
            .map(symbol => {
                const last = typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null;
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = typeof pointPct === 'function' ? pointPct(last) : null;
                const t = last && last.t ? String(last.t) : '';
                const yy = Number(String(symbol).slice(-2));
                const mm = diMonthNum(String(symbol)[3]);
                const tag = Number.isFinite(yy) && Number.isFinite(mm) ? ` ${String(mm).padStart(2, '0')}/${String(yy).padStart(2, '0')}` : '';
                const label = `${symbol}${tag ? ` (${tag.trim()})` : ''}`;
                const icon = typeof assetIcon === 'function' ? assetIcon({ symbol, name: label, category: 'rates', tags: [] }) : '•';
                return { label, symbol, icon, price, pct, t, yy: Number.isFinite(yy) ? yy : null, mm };
            })
            .filter(r => typeof r.price === 'number' && Number.isFinite(r.price))
            .sort((a, b) => ((a.yy || 0) - (b.yy || 0)) || ((a.mm || 0) - (b.mm || 0)));
        return parsed.map(({ yy, mm, ...rest }) => rest);
    };

    const buildRowsFor = ({ groupKey, categories, opt, assets, data, assetBySymbol, getLastPoint, getMostRecentPointWithPrice, pointPct, assetIcon, findAssetSymbol, isFav } = {}) => {
        const cats = Array.isArray(categories) ? categories : [];
        const options = opt && typeof opt === 'object' ? opt : {};
        const includeDxy = options.includeDxy === true;
        const excludeSymbols = Array.isArray(options.excludeSymbols) ? options.excludeSymbols : [];
        const includeMissing = options.includeMissing === true;
        const exclude = new Set(excludeSymbols.map(s => String(s)));
        const list = Array.isArray(assets) ? assets : [];
        const bySym = assetBySymbol instanceof Map ? assetBySymbol : new Map(list.map(a => [String(a && a.symbol ? a.symbol : ''), a]));

        const base = list.filter(a => cats.includes(a && a.category ? a.category : ''));
        const rows = base
            .map(a => {
                const symbol = String(a && a.symbol ? a.symbol : '');
                const last = includeMissing
                    ? (typeof getLastPoint === 'function' ? getLastPoint(data, symbol) : null)
                    : (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null);
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = typeof pointPct === 'function' ? pointPct(last) : null;
                const t = last && last.t ? String(last.t) : '';
                const label = String(a && a.name ? a.name : symbol);
                const icon = typeof assetIcon === 'function' ? assetIcon({ symbol, name: label, category: a && a.category ? a.category : 'other', tags: a && a.tags ? a.tags : [] }) : '•';
                return { label, symbol, icon, price, pct, t };
            })
            .filter(r => r.symbol && !exclude.has(r.symbol))
            .filter(r => includeMissing ? true : (typeof r.price === 'number' && Number.isFinite(r.price)));

        if (includeDxy) {
            const dxySymbol = typeof findAssetSymbol === 'function' ? findAssetSymbol(data, /(^\.DXY$|\bDXY\b|US Dollar Index)/i) : null;
            if (dxySymbol && !rows.some(r => r.symbol === dxySymbol)) {
                const a = bySym.get(String(dxySymbol)) || null;
                const last = typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, dxySymbol) : null;
                const price = last && typeof last.price === 'number' ? last.price : null;
                const pct = typeof pointPct === 'function' ? pointPct(last) : null;
                const t = last && last.t ? String(last.t) : '';
                const label = a && a.name ? String(a.name) : 'DXY';
                const icon = typeof assetIcon === 'function' ? assetIcon({ symbol: dxySymbol, name: label, category: a && a.category ? a.category : 'other', tags: a && a.tags ? a.tags : [] }) : '•';
                rows.unshift({ label, symbol: dxySymbol, icon, price, pct, t });
            }
        }

        sortRows(groupKey, rows, isFav);
        return rows;
    };

    const renderCard = ({ group, snap, isFrozen, expandedState, escapeHtml, formatDateTime, formatPercent, toneBadgeHtml, formatNumber } = {}) => {
        const g = group && typeof group === 'object' ? group : { key: '', title: '', maxRows: 14 };
        const esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s ?? '');
        const fmtT = typeof formatDateTime === 'function' ? formatDateTime : (t) => String(t || '');
        const fmtP = typeof formatPercent === 'function' ? formatPercent : (v) => String(v ?? '');
        const badge = typeof toneBadgeHtml === 'function' ? toneBadgeHtml : ((v, txt) => esc(txt));

        const allRows = (snap && Array.isArray(snap.rows) ? snap.rows : []).slice().filter(r => r && r.symbol);
        const maxRows = typeof g.maxRows === 'number' && Number.isFinite(g.maxRows) && g.maxRows > 0 ? g.maxRows : 14;
        const isExpanded = !!(expandedState && expandedState[g.key]);
        const canExpand = allRows.length > maxRows;
        const rows = canExpand && !isExpanded ? allRows.slice(0, maxRows) : allRows;
        const freezeAt = snap && snap.at ? fmtT(snap.at) : '';
        const subtitle = isFrozen && freezeAt ? `Congelado • ${freezeAt}` : '';
        const countTxt = allRows.length ? `${allRows.length}` : '';
        const headRight = `
            <div style="display:flex;gap:10px;align-items:center;">
                ${subtitle ? `<div style="opacity:.75;font-weight:800;letter-spacing:.6px;font-size:12px;">${esc(subtitle)}</div>` : ''}
                ${canExpand ? `<button class="panorama-freeze" data-panorama-expand="${esc(g.key)}" aria-pressed="${isExpanded ? 'true' : 'false'}">${isExpanded ? 'Recolher' : `Ver tudo (${esc(countTxt)})`}</button>` : ''}
                <button class="panorama-freeze" data-panorama-freeze="${esc(g.key)}" aria-pressed="${isFrozen ? 'true' : 'false'}">Congelar</button>
            </div>
        `;

        const body = rows.length
            ? `<table class="panorama-table">
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th class="panorama-mono" style="text-align:right;">Último</th>
                        <th class="panorama-mono" style="text-align:right;">Var%</th>
                        <th class="panorama-mono" style="text-align:right;">Hora</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows
                    .map(r => {
                        const pct = typeof r.pct === 'number' ? r.pct : null;
                        const pctTxt = pct === null ? '—' : fmtP(pct, 2);
                        const pctHtml = pct === null ? esc(pctTxt) : badge(pct, pctTxt, { maxAbs: 3 });
                        const lastTxt = formatPrice(r.symbol, r.price, formatNumber);
                        const hm = r.t ? formatHm(r.t, formatDateTime) : '';
                        const fullT = r.t ? fmtT(r.t) : '';
                        return `
                            <tr>
                                <td>
                                    <div class="panorama-asset" title="${esc(r.symbol)}">
                                        <span class="panorama-asset__icon">${esc(r.icon || '•')}</span>
                                        <span class="panorama-asset__name">${esc(r.label)}</span>
                                    </div>
                                </td>
                                <td class="panorama-mono" style="text-align:right;">${esc(lastTxt)}</td>
                                <td class="panorama-mono" style="text-align:right;">${pctHtml}</td>
                                <td class="panorama-mono" style="text-align:right;" title="${esc(fullT)}">${esc(hm || '—')}</td>
                            </tr>
                        `;
                    })
                    .join('')}
                </tbody>
            </table>`
            : `<div style="opacity:.85;">Sem dados suficientes para este bloco.</div>`;

        return `<div class="panorama-card" data-panorama-card="${esc(g.key)}">
            <div class="panorama-card__header">
                <div class="panorama-card__title">${esc(g.title)}${countTxt ? ` <span style="opacity:.7;font-weight:900;">(${esc(countTxt)})</span>` : ''}</div>
                ${headRight}
            </div>
            ${body}
        </div>`;
    };

    w.MarketPanoramaHelpers = {
        safeParse,
        readJson,
        writeJson,
        formatPrice,
        formatHm,
        pinnedMatchers,
        pinnedIndex,
        sortRows,
        diMonthNum,
        buildDiRows,
        buildRowsFor,
        renderCard,
    };
})();
