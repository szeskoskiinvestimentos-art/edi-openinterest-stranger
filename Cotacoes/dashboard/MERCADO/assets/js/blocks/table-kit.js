(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    const core = () => (w.MercadoBlocks && w.MercadoBlocks.coreKit) ? w.MercadoBlocks.coreKit : null;
    const kEscape = (s) => {
        const c = core();
        if (c && typeof c.escapeHtml === 'function') return c.escapeHtml(s);
        return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    };
    const kIsNum = (v) => {
        const c = core();
        if (c && typeof c.isNum === 'function') return c.isNum(v);
        return typeof v === 'number' && Number.isFinite(v);
    };
    const kFormatPercent = (v, d) => {
        const c = core();
        if (c && typeof c.formatPercent === 'function') return c.formatPercent(v, d);
        return String(v ?? '—');
    };
    const kFormatDateTimeLoose = (v) => {
        const c = core();
        if (c && typeof c.formatDateTimeLoose === 'function') return c.formatDateTimeLoose(v);
        return String(v ?? '');
    };
    const kFormatTickerPrice = (symbol, price) => {
        const c = core();
        if (c && typeof c.formatTickerPrice === 'function') return c.formatTickerPrice(symbol, price, '');
        return String(price ?? '—');
    };
    const kToneBadgeHtml = (value, text) => {
        const c = core();
        if (c && typeof c.toneBadgeHtml === 'function') return c.toneBadgeHtml(value, text, { maxAbs: 5 });
        return `<span>${kEscape(text)}</span>`;
    };
    const kToneBadgeNeutral = () => {
        const c = core();
        if (c && typeof c.toneBadgeHtmlFromTone === 'function') return c.toneBadgeHtmlFromTone('neutral', 0, '—', { maxAbs: 1 });
        return '<span>—</span>';
    };
    const kSymbolKey = (symbol) => {
        const c = core();
        if (c && typeof c.symbolKey === 'function') return c.symbolKey(symbol);
        return String(symbol || '').trim().toUpperCase().replace(/\s+/g, ' ');
    };
    const kPointPct = (p) => {
        const c = core();
        if (c && typeof c.pointPct === 'function') return c.pointPct(p);
        if (!p) return null;
        const regular = (typeof p.changePct === 'number' && Number.isFinite(p.changePct)) ? p.changePct : null;
        if (regular !== null) return regular;
        const extended = (typeof p.extendedChangePct === 'number' && Number.isFinite(p.extendedChangePct)) ? p.extendedChangePct : null;
        if (extended === null) return null;
        if (Math.abs(extended) > 50) return null;
        return extended;
    };
    const kGetLastPoint = (data, symbol) => {
        const c = core();
        if (c && typeof c.getLastPoint === 'function') return c.getLastPoint(data, symbol);
        const s = String(symbol || '');
        const xs = (data && data.series && Array.isArray(data.series[s])) ? data.series[s] : null;
        return xs && xs.length ? xs[xs.length - 1] : null;
    };
    const kGetMostRecentPointWithPrice = (data, symbol) => {
        const c = core();
        if (c && typeof c.getMostRecentPointWithPrice === 'function') return c.getMostRecentPointWithPrice(data, symbol);
        return kGetLastPoint(data, symbol);
    };

    const favoritesKey = 'mercado_favorites_v1';
    const loadFavorites = () => {
        try {
            const raw = localStorage.getItem(favoritesKey);
            const parsed = raw ? JSON.parse(raw) : null;
            const list = Array.isArray(parsed) ? parsed : [];
            return new Set(list.map(kSymbolKey).filter(Boolean));
        } catch {
            return new Set();
        }
    };
    const saveFavorites = (set) => {
        try {
            localStorage.setItem(favoritesKey, JSON.stringify(Array.from(set || []).slice(0, 200)));
        } catch {
        }
    };
    const toggleFavorite = (symbol) => {
        const s = kSymbolKey(symbol);
        if (!s) return;
        const fav = loadFavorites();
        if (fav.has(s)) fav.delete(s);
        else fav.add(s);
        saveFavorites(fav);
        try {
            document.dispatchEvent(new CustomEvent('mercado:favoritesChanged'));
        } catch {
        }
    };

    const parseTableRow = (data, asset) => {
        const sym = String(asset && asset.symbol ? asset.symbol : '');
        const last = sym ? (kGetMostRecentPointWithPrice(data, sym) || kGetLastPoint(data, sym)) : null;
        const price = last && kIsNum(last.price) ? last.price : null;
        const pct = kPointPct(last);
        const t = last && last.t ? String(last.t) : '';
        return {
            symbol: sym,
            name: String(asset && asset.name ? asset.name : ''),
            exchange: String(asset && asset.exchange ? asset.exchange : ''),
            category: String(asset && asset.category ? asset.category : ''),
            tags: Array.isArray(asset && asset.tags) ? asset.tags.map(x => String(x)) : [],
            last,
            _price: price,
            _pct: pct,
            _tMs: t ? (Date.parse(t) || 0) : 0,
        };
    };

    const buildRows = (data, categories) => {
        const cats = Array.isArray(categories) ? categories.map(x => String(x)) : [];
        const assets = data && Array.isArray(data.assets) ? data.assets : [];
        const out = [];
        for (const a of assets) {
            const cat = String(a && a.category ? a.category : '');
            if (cats.length && cats.indexOf(cat) === -1) continue;
            out.push(parseTableRow(data, a));
        }
        return out;
    };

    const tableStorageKey = (name, tableKey) => `mercado_table_${name}:${String(tableKey || '')}`;

    const createTable = (containerId, rows, data, onSelect, opts = {}) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tableKey = opts && opts.tableKey ? String(opts.tableKey) : String(containerId || '');
        const grouped = opts && opts.grouped === true;
        const sortable = opts && opts.sortable !== false;
        const toolbar = opts && opts.toolbar === true;
        const favorites = opts && opts.favorites === true;
        const limit = (opts && (opts.limit === null || typeof opts.limit === 'number')) ? opts.limit : 60;
        const exportEnabled = opts && opts.export === true;

        const fav = loadFavorites();

        const rawQuery = (() => {
            try { return localStorage.getItem(tableStorageKey('q', tableKey)) || ''; } catch { return ''; }
        })();
        const selectedKey = (() => {
            try { return localStorage.getItem(tableStorageKey('sel', tableKey)) || ''; } catch { return ''; }
        })();

        const normalize = (s) => String(s || '').toLowerCase().trim();
        const q = normalize(rawQuery);
        const isRowMatch = (r) => {
            if (!q) return true;
            const key = kSymbolKey(r.symbol);
            const name = normalize(r.name);
            const sym = normalize(r.symbol);
            const cat = normalize(r.category);
            return key.includes(q.toUpperCase()) || sym.includes(q) || name.includes(q) || cat.includes(q);
        };

        const baseRows = Array.isArray(rows) ? rows.slice() : [];
        const filtered = baseRows.filter(r => r && r.separator ? true : isRowMatch(r));

        const materialize = () => {
            const out = [];
            for (const r of filtered) {
                if (!r) continue;
                if (r.separator) { out.push(r); continue; }
                out.push(r.last ? r : parseTableRow(data, r));
            }
            return out;
        };

        const material = materialize();

        const visible = (() => {
            if (!sortable) return material;
            const list = material.filter(r => !r.separator);
            list.sort((a, b) => {
                if (!kIsNum(a._pct) && !kIsNum(b._pct)) return String(a.name).localeCompare(String(b.name));
                if (!kIsNum(a._pct)) return 1;
                if (!kIsNum(b._pct)) return -1;
                return (b._pct - a._pct);
            });
            if (!grouped) return list;
            const groups = [];
            let cur = null;
            for (const r of material) {
                if (r.separator) { cur = { sep: r, rows: [] }; groups.push(cur); continue; }
                if (!cur) { cur = { sep: null, rows: [] }; groups.push(cur); }
                cur.rows.push(r);
            }
            const sortedBySymbol = new Map(list.map(r => [String(r.symbol), r]));
            const rebuilt = [];
            for (const g of groups) {
                if (g.sep) rebuilt.push(g.sep);
                const xs = g.rows.map(r => sortedBySymbol.get(String(r.symbol)) || r);
                for (const r0 of xs) rebuilt.push(r0);
            }
            return rebuilt;
        })();

        const capped = (() => {
            if (limit === null) return visible;
            const lim = typeof limit === 'number' && Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 60;
            const out = [];
            let count = 0;
            for (const r of visible) {
                if (r && r.separator) { out.push(r); continue; }
                out.push(r);
                count += 1;
                if (count >= lim) break;
            }
            return out;
        })();

        const headerHtml = toolbar
            ? `
            <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px;">
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    <input data-table-search="1" type="text" inputmode="search" placeholder="Buscar..." value="${kEscape(rawQuery)}" style="background:#101010;color:#e0e0e0;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:8px 12px;min-width:220px;font-family:'Share Tech Mono',monospace;" />
                </div>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    ${exportEnabled ? `<button type="button" data-table-export="1" style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 12px;border-radius:999px;font-weight:900;letter-spacing:1px;cursor:pointer;">Exportar</button>` : ''}
                    ${rawQuery ? `<button type="button" data-table-clear="1" style="background:#141414;color:#e0e0e0;border:1px solid #333;padding:8px 12px;border-radius:999px;font-weight:900;letter-spacing:1px;cursor:pointer;">Limpar</button>` : ''}
                </div>
            </div>
        `
            : '';

        const rowsHtml = capped.map(r => {
            if (r.separator) {
                return `<tr><td colspan="6" style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.10);font-weight:900;letter-spacing:1px;opacity:.92;background:rgba(0,0,0,.18);">${kEscape(r.label || '')}</td></tr>`;
            }
            const sym = String(r.symbol || '');
            const key = kSymbolKey(sym);
            const isFav = favorites ? fav.has(key) : false;
            const star = favorites ? `<button type="button" data-fav="${kEscape(sym)}" style="background:transparent;border:0;color:${isFav ? 'rgba(255,210,74,.95)' : 'rgba(255,255,255,.45)'};cursor:pointer;font-size:16px;line-height:1;">${isFav ? '★' : '☆'}</button>` : '';
            const priceTxt = kIsNum(r._price) ? kFormatTickerPrice(sym, r._price) : '—';
            const pctTxt = kIsNum(r._pct) ? kFormatPercent(r._pct, 2) : '—';
            const pctBadge = kIsNum(r._pct) ? kToneBadgeHtml(r._pct, pctTxt) : kToneBadgeNeutral();
            const sel = key && selectedKey && kSymbolKey(selectedKey) === key;
            const rowCls = sel ? ' style="background:rgba(0,243,255,.06);"' : '';
            return `
                <tr data-sym="${kEscape(sym)}"${rowCls}>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);width:34px;text-align:center;">${star}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);font-family:'Share Tech Mono',monospace;font-weight:900;">${kEscape(sym)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.92;">${kEscape(r.name || '')}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${kEscape(priceTxt)}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right;font-family:'Share Tech Mono',monospace;">${pctBadge}</td>
                    <td style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.06);opacity:.72;white-space:nowrap;">${kEscape(r.last && r.last.t ? kFormatDateTimeLoose(String(r.last.t)) : '')}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            ${headerHtml}
            <table class="data-table" style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="text-align:center;width:34px;">☆</th>
                        <th style="text-align:left;">Símbolo</th>
                        <th style="text-align:left;">Nome</th>
                        <th style="text-align:right;">Preço</th>
                        <th style="text-align:right;">Chg%</th>
                        <th style="text-align:left;">Hora</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;

        const setQuery = (next) => {
            try { localStorage.setItem(tableStorageKey('q', tableKey), String(next || '')); } catch { }
        };
        const setSelected = (sym) => {
            try { localStorage.setItem(tableStorageKey('sel', tableKey), String(sym || '')); } catch { }
        };

        const onRowSelect = (sym) => {
            if (!sym) return;
            setSelected(sym);
            if (typeof onSelect === 'function') onSelect(sym);
        };

        const tbody = container.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const t = e.target;
                const favBtn = t && typeof t.closest === 'function' ? t.closest('button[data-fav]') : null;
                if (favBtn) {
                    const sym = favBtn.getAttribute('data-fav') || '';
                    toggleFavorite(sym);
                    createTable(containerId, rows, data, onSelect, opts);
                    return;
                }
                const tr = t && typeof t.closest === 'function' ? t.closest('tr[data-sym]') : null;
                if (!tr) return;
                const sym = tr.getAttribute('data-sym') || '';
                onRowSelect(sym);
            });
        }

        const input = container.querySelector('input[data-table-search="1"]');
        if (input) {
            input.addEventListener('input', (e) => {
                setQuery(e.target.value || '');
                createTable(containerId, rows, data, onSelect, opts);
            });
        }
        const clearBtn = container.querySelector('button[data-table-clear="1"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                setQuery('');
                createTable(containerId, rows, data, onSelect, opts);
            });
        }
        const exportBtn = container.querySelector('button[data-table-export="1"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const lines = [];
                lines.push(['symbol', 'name', 'price', 'pct'].join(','));
                for (const r of capped) {
                    if (!r || r.separator) continue;
                    const price = kIsNum(r._price) ? String(r._price) : '';
                    const pct = kIsNum(r._pct) ? String(r._pct) : '';
                    lines.push([r.symbol, `"${String(r.name || '').replace(/"/g, '""')}"`, price, pct].join(','));
                }
                const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${tableKey || containerId || 'table'}.csv`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1200);
            });
        }

        if (selectedKey) onRowSelect(selectedKey);
        else {
            const first = capped.find(r => r && !r.separator && r.symbol);
            if (first) onRowSelect(first.symbol);
        }
    };

    root.tableKit = { loadFavorites, toggleFavorite, buildRows, createTable };
    w.MercadoBlocks = root;
})();
