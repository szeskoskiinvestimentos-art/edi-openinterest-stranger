(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, el, deps } = {}) {
        if (!el) return;
        const d = deps || {};
        const escapeHtml = d.escapeHtml;
        const formatNumber = d.formatNumber;
        const formatPercent = d.formatPercent;
        const formatDateTime = d.formatDateTime;
        const toneBadgeHtml = d.toneBadgeHtml;
        const pointPct = d.pointPct;
        const getLastPoint = d.getLastPoint;
        const getMostRecentPointWithPrice = d.getMostRecentPointWithPrice;
        const findAssetSymbol = d.findAssetSymbol;
        const symbolKey = d.symbolKey;
        const loadFavorites = d.loadFavorites;
        const assetIcon = d.assetIcon;

        const safeParse = raw => {
            try {
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        };

        const frozenKey = 'mercado_panorama_frozen_v2';
        const frozen = safeParse(localStorage.getItem(frozenKey)) || {};

        const expandKey = 'mercado_panorama_expand_v1';
        const expandedState = safeParse(localStorage.getItem(expandKey)) || {};

        const saveFrozen = next => {
            try {
                localStorage.setItem(frozenKey, JSON.stringify(next || {}));
            } catch {
            }
        };

        const saveExpanded = next => {
            try {
                localStorage.setItem(expandKey, JSON.stringify(next || {}));
            } catch {
            }
        };

        const formatPrice = (symbol, price) => {
            if (price === null || price === undefined || !Number.isFinite(price)) return '—';
            const s = String(symbol || '');
            if (/\b(BTC|ETH|XRP|SOL|ADA)\b/i.test(s)) return formatNumber(price, price >= 1000 ? 0 : 2);
            if (/\/\w{3}\b/i.test(s) || s.includes('/')) return formatNumber(price, 4);
            if (price >= 1000) return formatNumber(price, 0);
            if (price >= 100) return formatNumber(price, 2);
            return formatNumber(price, 4);
        };

        const formatHm = iso => {
            const full = iso ? formatDateTime(iso) : '';
            const parts = full.split(' ');
            return parts.length > 1 ? parts[1] : full || '';
        };

        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const assetBySymbol = new Map(assets.map(a => [String(a && a.symbol ? a.symbol : ''), a]));
        const seriesKeys = Object.keys((data && data.series) || {});
        const diMatcher = /^DI1[FGHJKMNQUVXZ]\d{2}$/i;
        const favorites = typeof loadFavorites === 'function' ? loadFavorites() : new Set();

        const isFav = symbol => {
            const s = String(symbol || '');
            if (!s) return false;
            const k = typeof symbolKey === 'function' ? symbolKey(s) : s;
            return favorites.has(s) || favorites.has(k);
        };

        const pinnedMatchers = groupKey => {
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

        const sortRows = (groupKey, rows) => {
            const key = String(groupKey || '');
            rows.sort((a, b) => {
                const af = isFav(a && a.symbol ? a.symbol : '') ? 0 : 1;
                const bf = isFav(b && b.symbol ? b.symbol : '') ? 0 : 1;
                if (af !== bf) return af - bf;
                const ap = pinnedIndex(key, a);
                const bp = pinnedIndex(key, b);
                if (ap !== bp) return ap - bp;
                return String(a && a.label ? a.label : '').localeCompare(String(b && b.label ? b.label : ''), 'pt-BR');
            });
        };

        const diMonthNum = code => {
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

        const diRows = () => {
            const symbols = seriesKeys.filter(s => diMatcher.test(s));
            const parsed = symbols
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

        const rowsFor = (groupKey, categories, { includeDxy = false, excludeSymbols = [], includeMissing = false } = {}) => {
            const cats = Array.isArray(categories) ? categories : [];
            const exclude = new Set((excludeSymbols || []).map(s => String(s)));
            const base = assets.filter(a => cats.includes(a && a.category ? a.category : ''));
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
                    const a = assetBySymbol.get(String(dxySymbol)) || null;
                    const last = typeof getMostRecentPointWithPrice === 'function' ? getMostRecentPointWithPrice(data, dxySymbol) : null;
                    const price = last && typeof last.price === 'number' ? last.price : null;
                    const pct = typeof pointPct === 'function' ? pointPct(last) : null;
                    const t = last && last.t ? String(last.t) : '';
                    const label = a && a.name ? String(a.name) : 'DXY';
                    const icon = typeof assetIcon === 'function' ? assetIcon({ symbol: dxySymbol, name: label, category: a && a.category ? a.category : 'other', tags: a && a.tags ? a.tags : [] }) : '•';
                    rows.unshift({ label, symbol: dxySymbol, icon, price, pct, t });
                }
            }

            sortRows(groupKey, rows);
            return rows;
        };

        const baseGroups = [
            { key: 'equities', title: 'Ações & ETFs', maxRows: 18, categories: ['equities'], opt: { includeMissing: true } },
            { key: 'emerging', title: 'Emergentes (ETFs/Índices)', maxRows: 14, categories: ['emerging'], opt: { includeMissing: true } },
            { key: 'fx_g10', title: 'FX G10', maxRows: 14, categories: ['fx_g10'], opt: { includeDxy: true, includeMissing: true } },
            { key: 'fx_em', title: 'FX Emergentes', maxRows: 14, categories: ['fx_emerging'], opt: { includeMissing: true } },
            { key: 'br_di', title: 'Juros Brasil (DI)', maxRows: 16, kind: 'di' },
            { key: 'rates', title: 'Juros & Títulos', maxRows: 14, categories: ['rates'], opt: { includeMissing: true } },
            { key: 'credit', title: 'Crédito (CDS/Spreads)', maxRows: 14, categories: ['credit'], opt: { includeMissing: true } },
            { key: 'vol', title: 'Volatilidade', maxRows: 12, categories: ['volatility'], opt: { includeMissing: true } },
            { key: 'energy', title: 'Commodities • Energia', maxRows: 12, categories: ['energy'], opt: { includeMissing: true } },
            { key: 'metals', title: 'Commodities • Metais', maxRows: 12, categories: ['metals'], opt: { includeMissing: true } },
            { key: 'agri', title: 'Commodities • Agrícolas', maxRows: 12, categories: ['agriculture'], opt: { includeMissing: true } },
            { key: 'commodities', title: 'Commodities • Outras', maxRows: 12, categories: ['commodities'], opt: { includeMissing: true } },
            { key: 'crypto', title: 'Criptos', maxRows: 12, categories: ['crypto'], opt: { includeMissing: true } },
        ];

        const usedCats = new Set(baseGroups.flatMap(g => (g && g.categories ? g.categories : [])));
        const allCats = Array.from(new Set(assets.map(a => (a && a.category ? String(a.category) : '')).filter(Boolean)));
        const extras = allCats.filter(c => c && !usedCats.has(c));
        const uncategorized = assets.filter(a => !(a && a.category)).filter(a => a && a.symbol);
        const groups = []
            .concat(baseGroups)
            .concat(extras.length ? [{ key: 'outros', title: 'Outros', categories: extras, opt: { includeMissing: true } }] : [])
            .concat(uncategorized.length ? [{ key: 'sem_categoria', title: 'Sem categoria', kind: 'uncategorized', maxRows: 12 }] : []);

        const buildSnapshot = group => {
            if (group && group.kind === 'di') {
                const rows = diRows();
                return { at: new Date().toISOString(), rows };
            }
            if (group && group.kind === 'uncategorized') {
                const rows = uncategorized
                    .map(a => {
                        const symbol = String(a && a.symbol ? a.symbol : '');
                        const last = typeof getLastPoint === 'function' ? getLastPoint(data, symbol) : null;
                        const price = last && typeof last.price === 'number' ? last.price : null;
                        const pct = typeof pointPct === 'function' ? pointPct(last) : null;
                        const t = last && last.t ? String(last.t) : '';
                        const label = String(a && a.name ? a.name : symbol);
                        const icon = typeof assetIcon === 'function' ? assetIcon({ symbol, name: label, category: '', tags: a && a.tags ? a.tags : [] }) : '•';
                        return { label, symbol, icon, price, pct, t };
                    })
                    .filter(r => r && r.symbol);
                sortRows(group.key, rows);
                return { at: new Date().toISOString(), rows };
            }
            const rows = rowsFor(group.key, group.categories, group.opt);
            return { at: new Date().toISOString(), rows };
        };

        const rerender = () => render({ data, el, deps });

        const renderCard = (group, snap, isFrozen) => {
            const allRows = (snap && Array.isArray(snap.rows) ? snap.rows : []).slice().filter(r => r && r.symbol);
            const maxRows = typeof group.maxRows === 'number' && Number.isFinite(group.maxRows) && group.maxRows > 0 ? group.maxRows : 14;
            const isExpanded = !!(expandedState && expandedState[group.key]);
            const canExpand = allRows.length > maxRows;
            const rows = canExpand && !isExpanded ? allRows.slice(0, maxRows) : allRows;
            const freezeAt = snap && snap.at ? formatDateTime(snap.at) : '';
            const subtitle = isFrozen && freezeAt ? `Congelado • ${freezeAt}` : '';
            const countTxt = allRows.length ? `${allRows.length}` : '';
            const headRight = `
                <div style="display:flex;gap:10px;align-items:center;">
                    ${subtitle ? `<div style="opacity:.75;font-weight:800;letter-spacing:.6px;font-size:12px;">${escapeHtml(subtitle)}</div>` : ''}
                    ${canExpand ? `<button class="panorama-freeze" data-panorama-expand="${escapeHtml(group.key)}" aria-pressed="${isExpanded ? 'true' : 'false'}">${isExpanded ? 'Recolher' : `Ver tudo (${escapeHtml(countTxt)})`}</button>` : ''}
                    <button class="panorama-freeze" data-panorama-freeze="${escapeHtml(group.key)}" aria-pressed="${isFrozen ? 'true' : 'false'}">Congelar</button>
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
                                const pctTxt = pct === null ? '—' : formatPercent(pct, 2);
                                const pctHtml = pct === null ? escapeHtml(pctTxt) : toneBadgeHtml(pct, pctTxt, { maxAbs: 3 });
                                const lastTxt = formatPrice(r.symbol, r.price);
                                const hm = r.t ? formatHm(r.t) : '';
                                const fullT = r.t ? formatDateTime(r.t) : '';
                                return `
                                    <tr>
                                        <td>
                                            <div class="panorama-asset" title="${escapeHtml(r.symbol)}">
                                                <span class="panorama-asset__icon">${escapeHtml(r.icon || '•')}</span>
                                                <span class="panorama-asset__name">${escapeHtml(r.label)}</span>
                                            </div>
                                        </td>
                                        <td class="panorama-mono" style="text-align:right;">${escapeHtml(lastTxt)}</td>
                                        <td class="panorama-mono" style="text-align:right;">${pctHtml}</td>
                                        <td class="panorama-mono" style="text-align:right;" title="${escapeHtml(fullT)}">${escapeHtml(hm || '—')}</td>
                                    </tr>
                                `;
                            })
                            .join('')}
                    </tbody>
                </table>`
                : `<div style="opacity:.85;">Sem dados suficientes para este bloco.</div>`;

            return `<div class="panorama-card" data-panorama-card="${escapeHtml(group.key)}">
                <div class="panorama-card__header">
                    <div class="panorama-card__title">${escapeHtml(group.title)}${countTxt ? ` <span style="opacity:.7;font-weight:900;">(${escapeHtml(countTxt)})</span>` : ''}</div>
                    ${headRight}
                </div>
                ${body}
            </div>`;
        };

        const monitoredSymbols = assets.map(a => String(a && a.symbol ? a.symbol : '')).filter(Boolean);
        const monitoredUnique = new Set(monitoredSymbols);
        const duplicates = monitoredSymbols.length - monitoredUnique.size;

        const panoramaSet = new Set();
        for (const g of groups) {
            const snap = buildSnapshot(g);
            const rows = snap && Array.isArray(snap.rows) ? snap.rows : [];
            for (const r of rows) {
                const s = String(r && r.symbol ? r.symbol : '');
                if (s) panoramaSet.add(s);
            }
        }
        const missingInPanorama = Array.from(monitoredUnique).filter(s => !panoramaSet.has(s));
        const inPanoramaCount = Array.from(monitoredUnique).filter(s => panoramaSet.has(s)).length;
        const extrasInPanorama = Array.from(panoramaSet).filter(s => !monitoredUnique.has(s)).length;

        const hasExpandableGroups = groups.some(g => {
            const snap = frozen && frozen[g.key] ? frozen[g.key] : buildSnapshot(g);
            const allRows = (snap && Array.isArray(snap.rows) ? snap.rows : []).slice().filter(r => r && r.symbol);
            const maxRows = typeof g.maxRows === 'number' && Number.isFinite(g.maxRows) && g.maxRows > 0 ? g.maxRows : 14;
            return allRows.length > maxRows;
        });

        const coverageHtml = `
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px;background:rgba(0,0,0,.18);margin-bottom:12px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                    <div style="font-weight:900;letter-spacing:1px;opacity:.95;">Cobertura do Panorama</div>
                    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                        <div style="opacity:.80;font-size:12px;">Ativos: ${escapeHtml(String(monitoredUnique.size))} • No panorama: ${escapeHtml(String(inPanoramaCount))}${extrasInPanorama ? ` • Extras: ${escapeHtml(String(extrasInPanorama))}` : ''}${duplicates ? ` • Duplicados: ${escapeHtml(String(duplicates))}` : ''}</div>
                        ${hasExpandableGroups ? `<button class="panorama-freeze" data-panorama-expand-all="1">Ver tudo</button>` : ''}
                        ${hasExpandableGroups ? `<button class="panorama-freeze" data-panorama-collapse-all="1">Recolher</button>` : ''}
                    </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                    <span class="neutral" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">Sem categoria: ${escapeHtml(String(uncategorized.length))}</span>
                    <span class="${missingInPanorama.length ? 'negative' : 'positive'}" style="display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 10px;background:rgba(0,0,0,.18);font-family:'Share Tech Mono',monospace;font-weight:900;">Fora do panorama: ${escapeHtml(String(missingInPanorama.length))}</span>
                </div>
                ${missingInPanorama.length
            ? `<div style="margin-top:10px;opacity:.88;line-height:1.35;">Faltando: ${escapeHtml(missingInPanorama.slice(0, 14).join(' • '))}${missingInPanorama.length > 14 ? ' • …' : ''}</div>`
            : ''
        }
            </div>
        `;

        const cards = groups
            .map(g => {
                const snap = frozen && frozen[g.key] ? frozen[g.key] : buildSnapshot(g);
                const isFrozen = !!(frozen && frozen[g.key]);
                const rows = snap && Array.isArray(snap.rows) ? snap.rows : [];
                if (!rows.length) return null;
                return renderCard(g, snap, isFrozen);
            })
            .filter(Boolean)
            .join('');

        el.innerHTML = `${coverageHtml}${cards ? `<div class="panorama-grid">${cards}</div>` : '<div style="opacity:.85;">Sem dados suficientes para montar o panorama.</div>'}`;

        el.querySelectorAll('[data-panorama-freeze]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-panorama-freeze') || '';
                if (!key) return;
                const exists = frozen && frozen[key];
                if (exists) {
                    const next = { ...(frozen || {}) };
                    delete next[key];
                    saveFrozen(next);
                } else {
                    const group = groups.find(g => g.key === key);
                    if (!group) return;
                    const snap = buildSnapshot(group);
                    const next = { ...(frozen || {}), [key]: snap };
                    saveFrozen(next);
                }
                rerender();
            });
        });

        el.querySelectorAll('[data-panorama-expand]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-panorama-expand') || '';
                if (!key) return;
                const next = { ...(expandedState || {}) };
                if (next[key]) delete next[key];
                else next[key] = true;
                saveExpanded(next);
                rerender();
            });
        });

        const expandAll = () => {
            const next = { ...(expandedState || {}) };
            for (const g of groups) {
                const snap = frozen && frozen[g.key] ? frozen[g.key] : buildSnapshot(g);
                const allRows = (snap && Array.isArray(snap.rows) ? snap.rows : []).slice().filter(r => r && r.symbol);
                const maxRows = typeof g.maxRows === 'number' && Number.isFinite(g.maxRows) && g.maxRows > 0 ? g.maxRows : 14;
                if (allRows.length > maxRows) next[g.key] = true;
            }
            saveExpanded(next);
            rerender();
        };

        const collapseAll = () => {
            saveExpanded({});
            rerender();
        };

        el.querySelectorAll('[data-panorama-expand-all]').forEach(btn => {
            btn.addEventListener('click', () => expandAll());
        });
        el.querySelectorAll('[data-panorama-collapse-all]').forEach(btn => {
            btn.addEventListener('click', () => collapseAll());
        });
    }

    root.marketPanorama = { render };
    w.MercadoBlocks = root;
})();

