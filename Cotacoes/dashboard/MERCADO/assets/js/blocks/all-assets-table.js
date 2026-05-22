(function () {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    const root = (w.MercadoBlocks && typeof w.MercadoBlocks === 'object') ? w.MercadoBlocks : {};

    function render({ data, deps } = {}) {
        const d = deps || {};

        const buildRows = d.buildRows;
        const createTable = d.createTable;

        if (typeof buildRows !== 'function' || typeof createTable !== 'function') {
            throw new Error('deps_missing');
        }

        const containerId = 'allAssetsTable';
        const groups = [
            { label: 'Ações & ETFs', categories: ['equities'] },
            { label: 'Emergentes (ETFs/Índices)', categories: ['emerging'] },
            { label: 'FX G10', categories: ['fx_g10'] },
            { label: 'FX Emergentes', categories: ['fx_emerging'] },
            { label: 'Juros', categories: ['rates'] },
            { label: 'Crédito (CDS/Spreads)', categories: ['credit'] },
            { label: 'Volatilidade', categories: ['volatility'] },
            { label: 'Commodities • Energia', categories: ['energy'] },
            { label: 'Commodities • Metais', categories: ['metals'] },
            { label: 'Commodities • Agrícolas', categories: ['agriculture'] },
            { label: 'Commodities • Outras', categories: ['commodities'] },
            { label: 'Crypto', categories: ['crypto'] },
        ];

        const used = new Set(groups.flatMap(g => g.categories));
        const extras = Array.from(new Set((data && data.assets ? data.assets : []).map(a => a && a.category ? a.category : null)))
            .filter(c => c && !used.has(c));
        if (extras.length) groups.push({ label: 'Outros', categories: extras });

        const rows = [];
        for (const g of groups) {
            const rs = buildRows(data, g.categories, true)
                .slice()
                .sort((a, b) => String(a.name).localeCompare(String(b.name)));
            if (!rs.length) continue;
            rows.push({ separator: true, label: g.label });
            rows.push(...rs);
        }

        createTable(containerId, rows, data, null, { limit: null, sortable: true, grouped: true, tableKey: 'all', toolbar: true, favorites: true });
    }

    root.allAssetsTable = { render };
    w.MercadoBlocks = root;
})();
