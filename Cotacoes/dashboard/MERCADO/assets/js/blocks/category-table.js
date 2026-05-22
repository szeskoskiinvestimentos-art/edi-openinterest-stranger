(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, containerId, chartId, categories, defaultSymbol, deps } = {}) {
        const d = deps || {};

        const createTable = d.createTable;
        const buildRows = d.buildRows;
        const findAliasSymbolBest = d.findAliasSymbolBest;
        const findAliasSymbol = d.findAliasSymbol;
        const findAssetSymbol = d.findAssetSymbol;
        const renderLineChart = d.renderLineChart || ((id, points, symbol) => {
            if (w.MercadoCharts && typeof w.MercadoCharts.renderLineChart === 'function') {
                w.MercadoCharts.renderLineChart(id, points, symbol);
            }
        });

        if (typeof createTable !== 'function'
            || typeof buildRows !== 'function'
            || typeof findAliasSymbolBest !== 'function'
            || typeof findAliasSymbol !== 'function'
            || typeof findAssetSymbol !== 'function'
            || typeof renderLineChart !== 'function'
        ) {
            throw new Error('deps_missing');
        }

        const isFxCarryTable = containerId === 'fxTable' && Array.isArray(categories) && categories.length > 1;
        const labelByCategory = {
            fx_g10: 'FX G10',
            fx_emerging: 'FX Emergentes',
            emerging: 'Emergentes',
            commodities: 'Commodities',
            metals: 'Metais',
        };

        const dxyDefault = (() => {
            try {
                return findAliasSymbolBest(data, 'DXY') || findAliasSymbol(data, 'DXY') || findAssetSymbol(data, /^\.DXY$/i) || null;
            } catch {
                return null;
            }
        })();

        const rows = isFxCarryTable
            ? (() => {
                const out = [];
                for (const c of categories || []) {
                    const rs = buildRows(data, [c]);
                    if (!rs.length) continue;
                    out.push({ separator: true, label: labelByCategory[c] || String(c || '').toUpperCase() });
                    out.push(...rs);
                }
                return out.length ? out : buildRows(data, categories);
            })()
            : buildRows(data, categories);

        const pickFirstSelectable = (list) => {
            for (const r of (list || [])) {
                if (!r || r.separator) continue;
                if (r.symbol && data && data.series && Array.isArray(data.series[r.symbol]) && data.series[r.symbol].length) return r.symbol;
            }
            return null;
        };

        let selected = (defaultSymbol && data && data.series && data.series[defaultSymbol])
            ? defaultSymbol
            : (isFxCarryTable && dxyDefault && data && data.series && data.series[dxyDefault])
                ? dxyDefault
                : pickFirstSelectable(rows);

        createTable(containerId, rows, data, symbol => {
            selected = symbol;
            const points = (data && data.series && selected) ? (data.series[selected] || []) : [];
            renderLineChart(chartId, points, selected);
        }, { limit: 60, sortable: true, grouped: isFxCarryTable, tableKey: containerId, toolbar: false, favorites: true });

        if (selected) {
            const points = data.series[selected] || [];
            renderLineChart(chartId, points, selected);
        }
    }

    root.categoryTable = { render };
    w.MercadoBlocks = root;
})();
