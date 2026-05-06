(() => {
    const normalize = (s) => String(s || '').trim();

    const baseRatesCredit = [
        { key: 'US_3M', label: 'US 3M', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US3MT=RR$|^\^IRX$|\b13-Week\b|\b3-Month\b|\bUS\s*3M\b)/i }] },
        { key: 'US_6M', label: 'US 6M', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US6MT=RR$|\b6-Month\b|\bUS\s*6M\b)/i }] },
        { key: 'US_1Y', label: 'US 1Y', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US1YT=RR$|\bUnited States 1-Year\b|\bUS\s*1Y\b|^US1Y\b)/i }] },
        { key: 'US_2Y', label: 'US 2Y', region: 'US', kind: 'yield', candidates: [{ aliasKey: 'US2Y' }] },
        { key: 'US_5Y', label: 'US 5Y', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US5YT=RR$|\bUnited States 5-Year\b|\bUS\s*5Y\b|^US5Y\b)/i }] },
        { key: 'US_10Y', label: 'US 10Y', region: 'US', kind: 'yield', candidates: [{ aliasKey: 'US10Y' }] },
        { key: 'US_20Y', label: 'US 20Y', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US20YT=RR$|\bUnited States 20-Year\b|\bUS\s*20Y\b)/i }] },
        { key: 'US_30Y', label: 'US 30Y', region: 'US', kind: 'yield', candidates: [{ aliasKey: 'US30Y' }] },
        { key: 'US_TIPS_10Y', label: 'TIPS (10Y)', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US10YTIPT=RR$|\bTIPS\b.*\b10-Year\b|\bUS\s*TIPS\b)/i }] },

        { key: 'ETF_SHY', label: 'ETF SHY (1–3Y)', region: 'US', kind: 'price', candidates: [{ matcher: /^SHY$/i }] },
        { key: 'ETF_IEF', label: 'ETF IEF (7–10Y)', region: 'US', kind: 'price', candidates: [{ matcher: /^IEF$/i }] },
        { key: 'ETF_TLT', label: 'ETF TLT (20Y+)', region: 'US', kind: 'price', candidates: [{ aliasKey: 'TLT' }, { matcher: /^TLT$/i }] },
        { key: 'ETF_TIP', label: 'ETF TIP (TIPS)', region: 'US', kind: 'price', candidates: [{ aliasKey: 'TIPS_ETF' }, { matcher: /^TIP$/i }] },

        { key: 'ETF_HYG', label: 'ETF HYG (HY)', region: 'US', kind: 'price', candidates: [{ aliasKey: 'HYG' }, { matcher: /^HYG$/i }] },
        { key: 'ETF_LQD', label: 'ETF LQD (IG)', region: 'US', kind: 'price', candidates: [{ matcher: /^LQD$/i }] },

        { key: 'BR_10Y', label: 'BR 10Y (proxy)', region: 'BR', kind: 'yield', candidates: [{ aliasKey: 'BR10Y' }] },

        { key: 'DE_10Y', label: 'DE 10Y', region: 'EU', kind: 'yield', candidates: [{ matcher: /(^DE10YT=RR$|\bGermany 10-Year\b|^DE10Y\b)/i }] },
        { key: 'GB_10Y', label: 'GB 10Y', region: 'EU', kind: 'yield', candidates: [{ matcher: /(^GB10YT=RR$|\bUnited Kingdom 10-Year\b|^GB10Y\b)/i }] },
        { key: 'IT_10Y', label: 'IT 10Y', region: 'EU', kind: 'yield', candidates: [{ matcher: /(^IT10YT=RR$|\bItaly 10-Year\b|^IT10Y\b)/i }] },

        { key: 'JP_10Y', label: 'JP 10Y', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'JP10Y' }, { matcher: /(^JP10YT=RR$|\bJapan 10-Year\b|^JP10Y\b)/i }] },
        { key: 'CN_10Y', label: 'CN 10Y', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'CN10Y' }, { matcher: /(^CN10YT=RR$|\bChina 10-Year\b|^CN10Y\b)/i }] },

        { key: 'HK_3M', label: 'HK 3M', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'HK3M' }] },
        { key: 'HK_10Y', label: 'HK 10Y', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'HK10Y' }] },
        { key: 'SPREAD_HK10Y', label: 'Spread HK10Y', region: 'ASIA', kind: 'spread', candidates: [{ aliasKey: 'SPREAD_HK10Y' }] },

        { key: 'CDS_BR_5Y', label: 'CDS BR 5Y', region: 'BR', kind: 'bp', candidates: [{ aliasKey: 'CDS_BR5Y' }] },
        { key: 'CDS_CN_5Y', label: 'CDS CN 5Y', region: 'ASIA', kind: 'bp', candidates: [{ aliasKey: 'CDS_CN5Y' }] },
    ];

    const inferKind = (asset) => {
        const name = normalize(asset && asset.name ? asset.name : '');
        const sym = normalize(asset && asset.symbol ? asset.symbol : '');
        const cat = normalize(asset && asset.category ? asset.category : '');
        if (/\bCDS\b/i.test(name) || /\bCDS\b/i.test(sym)) return 'bp';
        if (/^\.?VIX/i.test(sym) || /\bVol\b/i.test(name)) return 'index';
        if (cat === 'credit') return 'price';
        if (/\bETF\b/i.test(name)) return 'price';
        if (/\bYield\b/i.test(name) || /\bTreasury\b/i.test(name) || /\bBond\b/i.test(name) || cat === 'rates') return 'yield';
        return 'price';
    };

    const inferRegion = (asset) => {
        const name = normalize(asset && asset.name ? asset.name : '');
        const sym = normalize(asset && asset.symbol ? asset.symbol : '');
        if (/\bBrazil\b|\bBrasil\b|\bBR\b/i.test(name) || /^BR/i.test(sym)) return 'BR';
        if (/\bUnited States\b|\bUS\b|\bEUA\b/i.test(name) || /^US/i.test(sym) || /^\^TNX$|^\.TNX$/i.test(sym)) return 'US';
        if (/\bGermany\b|\bUnited Kingdom\b|\bItaly\b|\bBund\b|\bBTP\b/i.test(name) || /^DE|^GB|^IT/i.test(sym)) return 'EU';
        if (/\bJapan\b|\bChina\b|\bHong Kong\b|\bHK\b/i.test(name) || /^JP|^CN|^HK/i.test(sym)) return 'ASIA';
        return 'GLOBAL';
    };

    const resolveSymbol = (deps, data, candidates) => {
        const dc = (typeof window !== 'undefined' && window.DecisionCore) ? window.DecisionCore : null;
        const dcDeps = deps && deps.dcDeps ? deps.dcDeps : null;
        if (dc && dcDeps && typeof dc.pickSymbol === 'function') {
            return dc.pickSymbol(dcDeps, data, candidates);
        }
        const list = Array.isArray(candidates) ? candidates : [];
        for (const c of list) {
            if (!c || typeof c !== 'object') continue;
            if (c.aliasKey && typeof deps.findAliasSymbolBest === 'function') {
                const sym = deps.findAliasSymbolBest(data, c.aliasKey) || (typeof deps.findAliasSymbol === 'function' ? deps.findAliasSymbol(data, c.aliasKey) : null);
                if (sym) return sym;
            }
            if (c.matcher instanceof RegExp && typeof deps.findAssetSymbol === 'function') {
                const sym = deps.findAssetSymbol(data, c.matcher);
                if (sym) return sym;
            }
        }
        return null;
    };

    const buildResolved = (deps, data, def) => {
        const symbol = resolveSymbol(deps, data, def.candidates);
        if (!symbol) return null;
        return { ...def, symbol };
    };

    const discoverRatesCredit = (data, { max = 14 } = {}) => {
        const assets = Array.isArray(data && data.assets ? data.assets : []) ? data.assets : [];
        const out = [];
        const seen = new Set();
        for (const a of assets) {
            if (!a || typeof a !== 'object') continue;
            const sym = normalize(a.symbol);
            if (!sym || seen.has(sym)) continue;
            const cat = normalize(a.category);
            if (cat !== 'rates' && cat !== 'credit') continue;
            const name = normalize(a.name);
            if (!/\bYield\b|\bTreasury\b|\bBond\b|\bCDS\b/i.test(name)) continue;
            seen.add(sym);
            out.push({
                key: `DISC_${sym}`,
                label: name.length <= 28 ? name : `${name.slice(0, 28).trim()}…`,
                region: inferRegion(a),
                kind: inferKind(a),
                candidates: [],
                symbol: a.symbol,
            });
            if (out.length >= max) break;
        }
        return out;
    };

    window.InstrumentsCatalog = {
        baseRatesCredit,
        inferKind,
        inferRegion,
        resolveSymbol,
        buildResolved,
        discoverRatesCredit,
        listRatesCredit: () => baseRatesCredit.slice(),
    };
})();

