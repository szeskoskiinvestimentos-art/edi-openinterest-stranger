(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatPercent = d.formatPercent;
        const toneBadgeHtml = d.toneBadgeHtml;
        const symbolKey = d.symbolKey;
        const pointPct = d.pointPct;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const isBrazilRelated = d.isBrazilRelated;
        const renderBrazilMarket = d.renderBrazilMarket;
        const renderAllAssetsTable = d.renderAllAssetsTable;

        const nowMs = Date.now();
        const assets = Array.isArray(data && data.assets ? data.assets : []) ? data.assets : [];
        const lastOf = (symbol) => (typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, symbol) : null) || (typeof getLastPoint === 'function' ? getLastPoint(data, symbol) : null);
        const parseTms = (p) => {
            const t = p && p.t ? Date.parse(String(p.t)) : NaN;
            return Number.isFinite(t) ? t : null;
        };
        const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

        const hardMaxAbs = 80;
        const rowsAll = (() => {
            const out = [];
            const seen = new Set();
            for (const a of assets) {
                if (!a || typeof a !== 'object') continue;
                const sym = a.symbol ? String(a.symbol) : '';
                if (!sym) continue;
                const key = (typeof symbolKey === 'function' ? symbolKey(sym) : sym) || sym;
                if (seen.has(key)) continue;
                const last = lastOf(sym);
                if (!last) continue;
                const pct = typeof pointPct === 'function' ? pointPct(last) : null;
                const price = last && typeof last.price === 'number' ? last.price : null;
                if (!isNum(pct) || !isNum(price) || !(price > 0)) continue;
                if (Math.abs(pct) > hardMaxAbs) continue;
                const tMs = parseTms(last);
                out.push({ a, last, pct, tMs, key });
                seen.add(key);
            }
            return out;
        })();

        const staleMs = 4 * 60 * 60 * 1000;
        const rowsFresh = rowsAll.filter(x => typeof x.tMs === 'number' && (nowMs - x.tMs) <= staleMs);

        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        const pickTopN = (list, dir, n) => {
            const arr = Array.isArray(list) ? list.slice() : [];
            arr.sort((a, b) => (dir === 'up' ? (b.pct - a.pct) : (a.pct - b.pct)));

            const preferred = dir === 'up'
                ? arr.filter(x => x.pct > 0)
                : arr.filter(x => x.pct < 0);
            const fallback = dir === 'up'
                ? arr.filter(x => x.pct <= 0)
                : arr.filter(x => x.pct >= 0);

            const out = [];
            const seen = new Set();
            const takeFrom = (xs) => {
                for (const x of xs) {
                    if (!x || !x.key || seen.has(x.key)) continue;
                    out.push(x);
                    seen.add(x.key);
                    if (out.length >= n) break;
                }
            };
            takeFrom(preferred);
            if (out.length < n) takeFrom(fallback);
            return out;
        };

        const groupDefs = [
            { key: 'equities', label: 'Ações / Índices', categories: ['equities'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'fx', label: 'FX', categories: ['fx_g10', 'fx_emerging', 'fx'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'commodities', label: 'Commodities', categories: ['commodities', 'energy', 'agriculture'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'metals', label: 'Metais', categories: ['metals'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'crypto', label: 'Cripto', categories: ['crypto'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'credit', label: 'Crédito', categories: ['credit'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'rates', label: 'Juros', categories: ['rates'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'vol', label: 'Volatilidade', categories: ['volatility'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'emerging', label: 'Emergentes', categories: ['emerging'], target: 'all-assets', tableKey: 'all', n: 3 },
            { key: 'other', label: 'Outros', categories: ['other'], target: 'all-assets', tableKey: 'all', n: 2 },
            { key: 'br', label: 'Brasil', predicate: isBrazilRelated, target: 'brazil-market', tableKey: 'br', n: 3 },
        ];

        const groupHasAny = (g) => {
            const base = g.predicate
                ? rowsAll.filter(x => g.predicate({ ...x.a, last: x.last }))
                : rowsAll.filter(x => (g.categories || []).includes(String(x.a && x.a.category ? x.a.category : '').toLowerCase()));
            return base.length > 0;
        };
        const groups = groupDefs.filter(groupHasAny);

        const cards = groups.map(g => {
            const listAll = g.predicate
                ? rowsAll.filter(x => g.predicate({ ...x.a, last: x.last }))
                : rowsAll.filter(x => (g.categories || []).includes(String(x.a && x.a.category ? x.a.category : '').toLowerCase()));
            const listFresh = g.predicate
                ? rowsFresh.filter(x => g.predicate({ ...x.a, last: x.last }))
                : rowsFresh.filter(x => (g.categories || []).includes(String(x.a && x.a.category ? x.a.category : '').toLowerCase()));

            const n = Math.max(1, Math.floor(Number(g.n) || 2));
            const baseList = listFresh.length >= Math.min(2, n) ? listFresh : listAll;
            if (!baseList.length) return '';

            const ups = pickTopN(baseList, 'up', n);
            const downs = pickTopN(baseList, 'down', n);
            const used = [...ups, ...downs].filter(Boolean);
            const absSorted = used.map(x => Math.abs(x.pct)).filter(isNum).sort((a, b) => a - b);
            const p90 = absSorted.length ? absSorted[Math.max(0, Math.floor(absSorted.length * 0.9) - 1)] : 5;
            const scaleAbs = clamp(isNum(p90) ? p90 : 5, 1.5, 12);

            const ageLabel = (x) => {
                if (!x || typeof x.tMs !== 'number') return '';
                const age = nowMs - x.tMs;
                if (!Number.isFinite(age) || age < 0) return '';
                if (age <= staleMs) return '';
                const mins = Math.round(age / 60000);
                if (!(mins > 0)) return '';
                return `<span style="opacity:.62;font-size:11px;margin-left:8px;">(${escapeHtml(String(mins) + 'm')})</span>`;
            };

            const line = (x, dir) => {
                if (!x) return '';
                const pct = x.pct;
                const arrow = dir === 'up' ? '▲' : '▼';
                const abs = Math.abs(pct);
                const a = clamp(abs / scaleAbs, 0.18, 0.85);
                const tone = pct > 0 ? 'tm-item--pos' : pct < 0 ? 'tm-item--neg' : 'tm-item--neu';
                const badge = typeof toneBadgeHtml === 'function' && typeof formatPercent === 'function'
                    ? toneBadgeHtml(pct, formatPercent(pct), { maxAbs: scaleAbs })
                    : escapeHtml ? escapeHtml(String(pct)) : String(pct);
                const symTxt = typeof symbolKey === 'function' ? (symbolKey(x.a.symbol) || x.a.symbol) : x.a.symbol;
                return `
                    <div class="tm-item ${tone}" data-tm="${escapeHtml(String(g.tableKey))}" data-target="${escapeHtml(String(g.target))}" data-symbol="${escapeHtml(String(x.a.symbol))}" style="--tm-a:${String(a)};">
                        <div style="min-width:0;">
                            <div style="font-weight:900;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arrow} ${escapeHtml(String(symTxt || ''))}</div>
                            <div style="opacity:.82;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(String(x.a.name || ''))}${ageLabel(x)}</div>
                        </div>
                        <div style="text-align:right;min-width:90px;font-weight:900;align-self:center;">${badge}</div>
                    </div>
                `;
            };

            const titleMeta = `<span style="opacity:.72;font-size:11px;margin-left:8px;">${escapeHtml(String(ups.length) + '↑/' + String(downs.length) + '↓')}</span>`;
            return `
                <div class="tm-card">
                    <div class="tm-card__title">${escapeHtml(String(g.label))}${titleMeta}</div>
                    <div class="tm-card__list">
                        ${ups.map(x => line(x, 'up')).join('')}
                        ${downs.map(x => line(x, 'down')).join('')}
                    </div>
                </div>
            `;
        }).filter(Boolean).join('');

        el.innerHTML = `<div class="tm-grid">${cards}</div>`;

        el.querySelectorAll('[data-symbol][data-target][data-tm]').forEach(node => {
            node.addEventListener('click', () => {
                const symbol = node.getAttribute('data-symbol') || '';
                const target = node.getAttribute('data-target') || '';
                const tableKey = node.getAttribute('data-tm') || '';
                if (!symbol || !tableKey) return;
                try {
                    localStorage.setItem(`mercado_table_q:${tableKey}`, typeof symbolKey === 'function' ? symbolKey(symbol) : symbol);
                    localStorage.setItem(`mercado_table_mode:${tableKey}`, 'all');
                } catch {
                }

                if (tableKey === 'br' && typeof renderBrazilMarket === 'function') renderBrazilMarket(data);
                if (tableKey === 'all' && typeof renderAllAssetsTable === 'function') renderAllAssetsTable(data);
                if (target) location.hash = `#${target}`;
            });
        });
    }

    root.topMovers = { render };
    w.MercadoBlocks = root;
})();

