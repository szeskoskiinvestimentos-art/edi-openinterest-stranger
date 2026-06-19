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

        const h = w.MarketPanoramaHelpers || {};
        const readJson = typeof h.readJson === 'function'
            ? h.readJson
            : (key) => {
                try {
                    const raw = localStorage.getItem(String(key || ''));
                    return raw ? JSON.parse(raw) : null;
                } catch {
                    return null;
                }
            };
        const writeJson = typeof h.writeJson === 'function'
            ? h.writeJson
            : (key, value) => {
                try { localStorage.setItem(String(key || ''), JSON.stringify(value || {})); } catch { }
            };

        const frozenKey = 'mercado_panorama_frozen_v2';
        const frozen = readJson(frozenKey) || {};

        const expandKey = 'mercado_panorama_expand_v1';
        const expandedState = readJson(expandKey) || {};

        const saveFrozen = next => writeJson(frozenKey, next || {});
        const saveExpanded = next => writeJson(expandKey, next || {});

        const formatPrice = (symbol, price) => (typeof h.formatPrice === 'function'
            ? h.formatPrice(symbol, price, formatNumber)
            : (price === null || price === undefined || !Number.isFinite(price)) ? '—' : formatNumber(price, 2));
        const formatHm = iso => (typeof h.formatHm === 'function' ? h.formatHm(iso, formatDateTime) : '');

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

        const sortRows = (groupKey, rows) => {
            if (typeof h.sortRows === 'function') h.sortRows(groupKey, rows, isFav);
            else (Array.isArray(rows) ? rows : []).sort((a, b) => String(a && a.label ? a.label : '').localeCompare(String(b && b.label ? b.label : ''), 'pt-BR'));
        };

        const diRows = () => (typeof h.buildDiRows === 'function'
            ? h.buildDiRows({ data, seriesKeys, diMatcher, getMostRecentPointWithPrice, pointPct, assetIcon })
            : []);

        const rowsFor = (groupKey, categories, opt = {}) => (typeof h.buildRowsFor === 'function'
            ? h.buildRowsFor({
                groupKey,
                categories,
                opt,
                assets,
                data,
                assetBySymbol,
                getLastPoint,
                getMostRecentPointWithPrice,
                pointPct,
                assetIcon,
                findAssetSymbol,
                isFav,
            })
            : []);

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
            if (typeof h.renderCard === 'function') {
                return h.renderCard({
                    group,
                    snap,
                    isFrozen,
                    expandedState,
                    escapeHtml,
                    formatDateTime,
                    formatPercent,
                    toneBadgeHtml,
                    formatNumber,
                });
            }
            return '';
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
