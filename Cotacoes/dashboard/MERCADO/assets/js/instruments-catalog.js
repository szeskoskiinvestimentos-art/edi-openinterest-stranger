(() => {
    const normalize = (s) => String(s || '').trim();

    const baseRatesCredit = [
        { key: 'US_3M', label: 'US 3M', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US3MT=RR$|^\^IRX$|\b13-Week\b|\b3-Month\b|\bUS\s*3M\b)/i }] },
        { key: 'US_6M', label: 'US 6M', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US6MT=RR$|\b6-Month\b|\bUS\s*6M\b)/i }] },
        { key: 'US_FEDFUNDS', label: 'Fed Funds', region: 'US', kind: 'yield', candidates: [{ matcher: /FEDR$/i }] },
        { key: 'US_1Y', label: 'US 1Y', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US1YT=RR$|\bUnited States 1-Year\b|\bUS\s*1Y\b|^US1Y\b)/i }] },
        { key: 'US_2Y', label: 'US 2Y', region: 'US', kind: 'yield', candidates: [{ aliasKey: 'US2Y' }, { matcher: /(^US2YT=RR$|\bUnited States 2-Year\b|\bUS\s*2Y\b|^US2Y\b)/i }] },
        { key: 'US_5Y', label: 'US 5Y', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US5YT=RR$|\bUnited States 5-Year\b|\bUS\s*5Y\b|^US5Y\b)/i }] },
        { key: 'US_10Y', label: 'US 10Y', region: 'US', kind: 'yield', candidates: [{ aliasKey: 'US10Y' }, { matcher: /(^US10YT=RR$|^US10YT=X$|^\.TNX$|\^TNX)/i }] },
        { key: 'US_20Y', label: 'US 20Y', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US20YT=RR$|\bUnited States 20-Year\b|\bUS\s*20Y\b)/i }] },
        { key: 'US_30Y', label: 'US 30Y', region: 'US', kind: 'yield', candidates: [{ aliasKey: 'US30Y' }] },
        { key: 'US_TIPS_10Y', label: 'TIPS (10Y)', region: 'US', kind: 'yield', candidates: [{ matcher: /(^US10YTIPT=RR$|\bTIPS\b.*\b10-Year\b|\bUS\s*TIPS\b)/i }] },

        { key: 'ETF_SHY', label: 'ETF SHY (1–3Y)', region: 'US', kind: 'price', candidates: [{ matcher: /^SHY$/i }] },
        { key: 'ETF_IEF', label: 'ETF IEF (7–10Y)', region: 'US', kind: 'price', candidates: [{ matcher: /^IEF$/i }] },
        { key: 'ETF_TLT', label: 'ETF TLT (20Y+)', region: 'US', kind: 'price', candidates: [{ aliasKey: 'TLT' }, { matcher: /^TLT$/i }] },
        { key: 'ETF_TIP', label: 'ETF TIP (TIPS)', region: 'US', kind: 'price', candidates: [{ aliasKey: 'TIPS_ETF' }, { matcher: /^TIP$/i }] },

        { key: 'ETF_HYG', label: 'ETF HYG (HY)', region: 'US', kind: 'price', candidates: [{ aliasKey: 'HYG' }, { matcher: /^HYG$/i }] },
        { key: 'ETF_LQD', label: 'ETF LQD (IG)', region: 'US', kind: 'price', candidates: [{ matcher: /^LQD$/i }] },

        { key: 'SPREAD_US10_BR10', label: 'Spread US10–BR10', region: 'GLOBAL', kind: 'spread', candidates: [{ matcher: /^US10BR10=RR$/i }] },
        { key: 'SPREAD_US10_AU10', label: 'Spread US10–AU10', region: 'GLOBAL', kind: 'spread', candidates: [{ matcher: /^US10AU10=RR$/i }] },

        { key: 'BR_3M', label: 'BR 3M', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BR3MT=RR$/i }] },
        { key: 'BR_1Y', label: 'BR 1Y', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BR1YT=RR$/i }] },
        { key: 'BR_2Y', label: 'BR 2Y', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BR2YT=RR$/i }] },
        { key: 'BR_3Y', label: 'BR 3Y', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BR3YT=RR$/i }] },
        { key: 'BR_5Y', label: 'BR 5Y', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BR5YT=RR$/i }] },
        { key: 'BR_8Y', label: 'BR 8Y', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BR8YT=RR$/i }] },
        { key: 'BR_10Y', label: 'BR 10Y (proxy)', region: 'BR', kind: 'yield', candidates: [{ aliasKey: 'BR10Y' }, { matcher: /^BR10YT=RR$/i }] },
        { key: 'BR_IPCA_10Y', label: 'BR IPCA+ 10Y', region: 'BR', kind: 'yield', candidates: [{ matcher: /^BRNB10YT=RR$/i }] },
        { key: 'BR_DAPC1', label: 'BR DAP 1 (real)', region: 'BR', kind: 'yield', candidates: [{ matcher: /^DAPc1$/i }] },
        { key: 'BR_DAPC2', label: 'BR DAP 2 (real)', region: 'BR', kind: 'yield', candidates: [{ matcher: /^DAPc2$/i }] },
        { key: 'BR_DAPC3', label: 'BR DAP 3 (real)', region: 'BR', kind: 'yield', candidates: [{ matcher: /^DAPc3$/i }] },

        { key: 'DE_10Y', label: 'DE 10Y', region: 'EU', kind: 'yield', candidates: [{ matcher: /(^DE10YT=RR$|\bGermany 10-Year\b|^DE10Y\b)/i }] },
        { key: 'GB_10Y', label: 'GB 10Y', region: 'EU', kind: 'yield', candidates: [{ matcher: /(^GB10YT=RR$|\bUnited Kingdom 10-Year\b|^GB10Y\b)/i }] },
        { key: 'IT_10Y', label: 'IT 10Y', region: 'EU', kind: 'yield', candidates: [{ matcher: /(^IT10YT=RR$|\bItaly 10-Year\b|^IT10Y\b)/i }] },

        { key: 'AU_10Y', label: 'AU 10Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^AU10YT=RR$/i }] },
        { key: 'CA_10Y', label: 'CA 10Y', region: 'GLOBAL', kind: 'yield', candidates: [{ matcher: /^CA10YT=RR$/i }] },
        { key: 'MX_3Y', label: 'MX 3Y', region: 'GLOBAL', kind: 'yield', candidates: [{ matcher: /^MX3YT=RR$/i }] },
        { key: 'MX_10Y', label: 'MX 10Y', region: 'GLOBAL', kind: 'yield', candidates: [{ matcher: /^MX10YT=RR$/i }] },
        { key: 'MX_20Y', label: 'MX 20Y', region: 'GLOBAL', kind: 'yield', candidates: [{ matcher: /^MX20YT=RR$/i }] },
        { key: 'MX_30Y', label: 'MX 30Y', region: 'GLOBAL', kind: 'yield', candidates: [{ matcher: /^MX30YT=RR$/i }] },

        { key: 'JP_1Y', label: 'JP 1Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^JP1YT=RR$/i }] },
        { key: 'JP_5Y', label: 'JP 5Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^JP5YT=RR$/i }] },
        { key: 'JP_10Y', label: 'JP 10Y', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'JP10Y' }, { matcher: /(^JP10YT=RR$|\bJapan 10-Year\b|^JP10Y\b)/i }] },
        { key: 'JP_20Y', label: 'JP 20Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^JP20YT=RR$/i }] },
        { key: 'JP_30Y', label: 'JP 30Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^JP30YT=RR$/i }] },
        { key: 'JP_40Y', label: 'JP 40Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^JP40YT=RR$/i }] },

        { key: 'CN_1Y', label: 'CN 1Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^CN1YT=RR$/i }] },
        { key: 'CN_2Y', label: 'CN 2Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^CN2YT=RR$/i }] },
        { key: 'CN_5Y', label: 'CN 5Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^CN5YT=RR$/i }] },
        { key: 'CN_10Y', label: 'CN 10Y', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'CN10Y' }, { matcher: /(^CN10YT=RR$|\bChina 10-Year\b|^CN10Y\b)/i }] },
        { key: 'CN_20Y', label: 'CN 20Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^CN20YT=RR$/i }] },
        { key: 'CN_30Y', label: 'CN 30Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^CN30YT=RR$/i }] },

        { key: 'HK_3M', label: 'HK 3M', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'HK3M' }, { matcher: /^HK3MT=RR$/i }] },
        { key: 'HK_2Y', label: 'HK 2Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^HK2YT=RR$/i }] },
        { key: 'HK_3Y', label: 'HK 3Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^HK3YT=RR$/i }] },
        { key: 'HK_5Y', label: 'HK 5Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^HK5YT=RR$/i }] },
        { key: 'HK_10Y', label: 'HK 10Y', region: 'ASIA', kind: 'yield', candidates: [{ aliasKey: 'HK10Y' }, { matcher: /^HK10YT=RR$/i }] },
        { key: 'HK_20Y', label: 'HK 20Y', region: 'ASIA', kind: 'yield', candidates: [{ matcher: /^HK20YT=RR$/i }] },
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
        if (/\bc\d+=\$?$/i.test(sym)) return 'price';
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
        if (/\bJapan\b|\bChina\b|\bHong Kong\b|\bHK\b|\bAustralia\b|\bAustral/i.test(name) || /^JP|^CN|^HK|^AU/i.test(sym)) return 'ASIA';
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
            if (/\bc\d+=\$?$/i.test(sym)) continue;
            const looksBySymbol =
                /^[A-Z]{2}\d{1,2}(?:Y|M)T=RR$/i.test(sym)
                || /^US\d{2}[A-Z]{2}\d{2}=RR$/i.test(sym)
                || /^US10[A-Z]{2}\d{2}=RR$/i.test(sym)
                || /^\.TNX$|^\^TNX$/i.test(sym)
                || /FEDR$/i.test(sym);
            const looksByName =
                /\bYield\b|\bTreasury\b|\bBond\b|\bCDS\b/i.test(name)
                || /\bGovernment\b|\bGov\b/i.test(name)
                || /\bjuros\b|\btaxa\b|\brendimento\b/i.test(name)
                || /\b\d{1,2}\s*(anos?|years?)\b/i.test(name);
            if (!looksBySymbol && !looksByName) continue;
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
        findRatesCreditByKey: (key) => {
            const k = normalize(key);
            if (!k) return null;
            return baseRatesCredit.find(x => String(x && x.key ? x.key : '') === k) || null;
        },
        resolveRatesCreditByKey: (deps, data, key) => {
            const def = window.InstrumentsCatalog.findRatesCreditByKey(key);
            if (!def) return null;
            return resolveSymbol(deps, data, def.candidates);
        },
    };
})();
