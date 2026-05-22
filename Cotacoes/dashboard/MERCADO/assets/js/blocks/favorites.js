(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const tableId = 'favoritesTable';
        const chartId = 'favoritesChart';
        const container = document.getElementById(tableId);
        if (!container) return;

        const fav = deps.loadFavorites();
        const allRows = (data.assets || []).map(a => {
            const last = deps.getLastPoint(data, a.symbol);
            return {
                symbol: a.symbol,
                name: a.name,
                exchange: a.exchange || '',
                category: a.category,
                tags: a.tags || [],
                last,
            };
        });

        const selectedRows = allRows.filter(r => fav.has(r.symbol));
        if (!selectedRows.length) {
            container.innerHTML = '<p style="opacity:.8">Nenhum favorito ainda. Use a estrela nas tabelas para adicionar.</p>';
            const c = document.getElementById(chartId);
            if (c && c.getContext) {
                deps.renderLineChart(chartId, [], '—');
            }
            return;
        }

        const byCat = new Map();
        for (const r of selectedRows) {
            const key = String(r.category || 'other');
            if (!byCat.has(key)) byCat.set(key, []);
            byCat.get(key).push(r);
        }

        const catOrder = ['commodities', 'energy', 'agriculture', 'metals', 'fx_g10', 'fx_emerging', 'emerging', 'rates', 'volatility', 'crypto', 'other'];
        const labelFor = c => {
            if (c === 'fx_g10' || c === 'fx_emerging') return 'FX';
            if (c === 'energy' || c === 'agriculture' || c === 'commodities') return 'Commodities';
            if (c === 'metals') return 'Metais';
            if (c === 'emerging') return 'Emergentes';
            if (c === 'rates') return 'Juros';
            if (c === 'volatility') return 'Volatilidade';
            if (c === 'crypto') return 'Crypto';
            return 'Outros';
        };

        const rows = [];
        for (const c of catOrder) {
            const list = (byCat.get(c) || []).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            if (!list.length) continue;
            rows.push({ separator: true, label: labelFor(c) });
            rows.push(...list);
        }

        const first = selectedRows.find(r => data.series && data.series[r.symbol] && data.series[r.symbol].length) || selectedRows[0];
        const selectedSymbol = first ? first.symbol : null;

        deps.createTable(
            tableId,
            rows,
            data,
            symbol => {
                const points = data.series[symbol] || [];
                deps.renderLineChart(chartId, points, symbol);
            },
            { limit: null, sortable: true, grouped: true, tableKey: 'fav', toolbar: true, favorites: true, modes: [], export: true }
        );

        if (selectedSymbol) {
            const points = data.series[selectedSymbol] || [];
            deps.renderLineChart(chartId, points, selectedSymbol);
        }
    }

    root.favorites = { render };
    w.MercadoBlocks = root;
})();

